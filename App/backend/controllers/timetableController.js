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

const getTodayName = () => {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
};

const sortTimetable = (items) => {
  return items.sort((a, b) => {
    const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
    if (dayDiff !== 0) return dayDiff;
    return String(a.startTime).localeCompare(String(b.startTime));
  });
};

exports.getTimetable = async (req, res) => {
  const timetable = await Timetable.find({ userId: req.user._id }).lean();
  res.json(sortTimetable(timetable));
};

exports.getTodayTimetable = async (req, res) => {
  const day = req.query.day || getTodayName();
  const timetable = await Timetable.find({ userId: req.user._id, day }).lean();
  res.json(sortTimetable(timetable));
};

exports.createTimetableItem = async (req, res) => {
  const { subject, day, startTime, endTime, room, teacher, color } = req.body;

  if (!subject || !day || !startTime || !endTime) {
    return res.status(400).json({ message: "Subject, day, start time and end time are required" });
  }

  const item = await Timetable.create({
    userId: req.user._id,
    subject,
    day,
    startTime,
    endTime,
    room,
    teacher,
    color,
  });

  res.status(201).json(item);
};

exports.updateTimetableItem = async (req, res) => {
  const item = await Timetable.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!item) return res.status(404).json({ message: "Timetable item not found" });
  res.json(item);
};

exports.deleteTimetableItem = async (req, res) => {
  const item = await Timetable.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!item) return res.status(404).json({ message: "Timetable item not found" });
  res.json({ message: "Timetable item deleted" });
};
