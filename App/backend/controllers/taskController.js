const Task = require("../models/Task");

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, detail = "", dueAt = null } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Task title is required" });
    }

    const task = await Task.create({
      userId: req.user._id,
      title: title.trim(),
      detail: detail.trim(),
      dueAt,
    });

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Completing a task removes it so it disappears from the dashboard immediately.
const completeTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.json({ success: true, message: "Task completed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    return res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, createTask, completeTask, deleteTask };
