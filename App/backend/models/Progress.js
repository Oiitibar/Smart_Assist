const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true },
    tasksCompleted: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    cardsReviewed: { type: Number, default: 0 },
    correctCards: { type: Number, default: 0 },
    studyStreak: { type: Number, default: 0 },
    focusMinutes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

progressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
