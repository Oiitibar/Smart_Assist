const Task = require("../models/Task");
const Progress = require("../models/Progress");
const User = require("../models/User");

const todayKey = () => new Date().toISOString().slice(0, 10);

exports.getTasks = async (req, res) => {
  const tasks = await Task.find({
    userId: req.user._id,
    completed: false,
  }).sort({ createdAt: -1 });

  return res.json(tasks);
};

exports.createTask = async (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) return res.status(400).json({ message: "Task title is required" });

  const task = await Task.create({
    userId: req.user._id,
    title,
    detail: String(req.body.detail || "Personal task").trim(),
    dueDate: req.body.dueDate || null,
  });

  await Progress.findOneAndUpdate(
    { userId: req.user._id, date: todayKey() },
    {
      $inc: { totalTasks: 1 },
      $setOnInsert: {
        tasksCompleted: 0,
        cardsReviewed: 0,
        correctCards: 0,
        studyStreak: 1,
        focusMinutes: 0,
      },
    },
    { upsert: true },
  );

  return res.status(201).json(task);
};

exports.completeTask = async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
    completed: false,
  });

  if (!task) return res.status(404).json({ message: "Task not found" });

  await Promise.all([
    Progress.findOneAndUpdate(
      { userId: req.user._id, date: todayKey() },
      {
        $inc: { tasksCompleted: 1 },
        $setOnInsert: {
          totalTasks: 1,
          cardsReviewed: 0,
          correctCards: 0,
          studyStreak: 1,
          focusMinutes: 0,
        },
      },
      { upsert: true },
    ),
    User.findByIdAndUpdate(req.user._id, {
      $inc: { "studyData.completedTasks": 1 },
    }),
  ]);

  return res.json({ message: "Task completed and removed" });
};

exports.deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) return res.status(404).json({ message: "Task not found" });
  return res.json({ message: "Task deleted" });
};
