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
  if (!value || typeof value !== "string") return Number.MAX_SAFE_INTEGER;

  const normalized = value.trim().toUpperCase();
  const twelveHour = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = Number(twelveHour[2]);
    const period = twelveHour[3];

    if (hour === 12) hour = 0;
    if (period === "PM") hour += 12;

    return hour * 60 + minute;
  }

  const twentyFourHour = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHour) {
    return Number(twentyFourHour[1]) * 60 + Number(twentyFourHour[2]);
  }

  return Number.MAX_SAFE_INTEGER;
};

const sortTimetable = (items) => items.sort((a, b) => {
  const dayDifference = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
  if (dayDifference !== 0) return dayDifference;
  return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
});

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

  const item = await Timetable.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    update,
    { new: true, runValidators: true },
  );

  if (!item) return res.status(404).json({ message: "Timetable item not found" });
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
