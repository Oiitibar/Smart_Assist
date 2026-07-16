const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, default: "", trim: true },
    teacher: { type: String, default: "", trim: true },
    type: {
      type: String,
      enum: ["Lecture", "Lab", "Seminar", "Study", "Other"],
      default: "Lecture",
    },
    color: { type: String, default: "#4f46e5" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Timetable", timetableSchema);
