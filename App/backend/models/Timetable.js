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
    room: { type: String, default: "" },
    teacher: { type: String, default: "" },
    color: { type: String, default: "indigo" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
