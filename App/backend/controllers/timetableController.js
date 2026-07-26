const Timetable = require("../models/Timetable");

const dayOrder = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

const timeToMinutes = (value) => {
  if (!value || typeof value !== "string") return null;

  const normalized = value.trim().toUpperCase();
  const twelveHour = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = Number(twelveHour[2]);
    const period = twelveHour[3];

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
    if (hour === 12) hour = 0;
    if (period === "PM") hour += 12;

    return hour * 60 + minute;
  }

  const twentyFourHour = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHour) {
    const hour = Number(twentyFourHour[1]);
    const minute = Number(twentyFourHour[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return hour * 60 + minute;
  }

  return null;
};

const sortTimetable = (items) => items.sort((a, b) => {
  const dayDifference = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
  if (dayDifference !== 0) return dayDifference;
  return (timeToMinutes(a.startTime) ?? Number.MAX_SAFE_INTEGER)
    - (timeToMinutes(b.startTime) ?? Number.MAX_SAFE_INTEGER);
});

const validateTimeRange = (startTime, endTime) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null) {
    return {
      error: "Enter a valid time such as 01:00 PM or 13:00",
    };
  }

  if (endMinutes <= startMinutes) {
    return { error: "End time must be later than start time" };
  }

  return { startMinutes, endMinutes };
};

const findConflict = async ({ userId, day, startMinutes, endMinutes, excludeId }) => {
  const query = { userId, day };
  if (excludeId) query._id = { $ne: excludeId };

  const sameDayItems = await Timetable.find(query).lean();
  return sameDayItems.find((item) => {
    const itemStart = timeToMinutes(item.startTime);
    const itemEnd = timeToMinutes(item.endTime);
    if (itemStart === null || itemEnd === null) return false;
    return startMinutes < itemEnd && endMinutes > itemStart;
  });
};

const conflictMessage = (conflict, day) => (
  `${conflict.subject} already uses ${conflict.startTime}–${conflict.endTime} on ${day}. Choose a non-overlapping time.`
);

exports.getTimetable = async (req, res) => {
  const timetable = await Timetable.find({ userId: req.user._id }).lean();
  return res.json(sortTimetable(timetable));
};

exports.getTodayTimetable = async (req, res) => {
  const day = req.query.day || new Date().toLocaleDateString("en-US", { weekday: "long" });
  const timetable = await Timetable.find({ userId: req.user._id, day }).lean();
  return res.json(sortTimetable(timetable));
};

exports.createTimetableItem = async (req, res) => {
  const { subject, day, startTime, endTime, room, teacher, type, color } = req.body;

  if (!subject || !day || !startTime || !endTime) {
    return res.status(400).json({
      message: "Subject, day, start time and end time are required",
    });
  }

  if (!dayOrder[day]) {
    return res.status(400).json({ message: "Choose a valid timetable day" });
  }

  const range = validateTimeRange(startTime, endTime);
  if (range.error) return res.status(400).json({ message: range.error });

  const conflict = await findConflict({
    userId: req.user._id,
    day,
    startMinutes: range.startMinutes,
    endMinutes: range.endMinutes,
  });

  if (conflict) {
    return res.status(409).json({
      message: conflictMessage(conflict, day),
      conflict: {
        id: conflict._id,
        subject: conflict.subject,
        day: conflict.day,
        startTime: conflict.startTime,
        endTime: conflict.endTime,
      },
    });
  }

  const item = await Timetable.create({
    userId: req.user._id,
    subject,
    day,
    startTime,
    endTime,
    room,
    teacher,
    type,
    color,
  });

  return res.status(201).json(item);
};

exports.updateTimetableItem = async (req, res) => {
  const allowed = ["subject", "day", "startTime", "endTime", "room", "teacher", "type", "color"];
  const update = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key)),
  );

  const item = await Timetable.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!item) return res.status(404).json({ message: "Timetable item not found" });

  const nextDay = update.day ?? item.day;
  const nextStartTime = update.startTime ?? item.startTime;
  const nextEndTime = update.endTime ?? item.endTime;

  if (!dayOrder[nextDay]) {
    return res.status(400).json({ message: "Choose a valid timetable day" });
  }

  const range = validateTimeRange(nextStartTime, nextEndTime);
  if (range.error) return res.status(400).json({ message: range.error });

  const conflict = await findConflict({
    userId: req.user._id,
    day: nextDay,
    startMinutes: range.startMinutes,
    endMinutes: range.endMinutes,
    excludeId: item._id,
  });

  if (conflict) {
    return res.status(409).json({
      message: conflictMessage(conflict, nextDay),
      conflict: {
        id: conflict._id,
        subject: conflict.subject,
        day: conflict.day,
        startTime: conflict.startTime,
        endTime: conflict.endTime,
      },
    });
  }

  Object.assign(item, update);
  await item.save();
  return res.json(item);
};

exports.deleteTimetableItem = async (req, res) => {
  const item = await Timetable.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!item) return res.status(404).json({ message: "Timetable item not found" });
  return res.json({ message: "Timetable item deleted" });
};
