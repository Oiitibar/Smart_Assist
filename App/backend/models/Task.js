const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: 180,
    },
    detail: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },
    dueAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Task", taskSchema);
