const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    profile: {
      phone: { type: String, default: "" },
      school: { type: String, default: "" },
      grade: { type: String, default: "" },
      subjects: { type: [String], default: [] },
    },
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      darkMode: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
      studyReminder: { type: String, default: "30 minutes before" },
      language: { type: String, default: "English" },
      timetableView: { type: String, default: "Week View" },
      flashcardMode: { type: String, default: "Review All" },
    },
    studyData: {
      dailyGoal: { type: Number, default: 5 },
      completedTasks: { type: Number, default: 0 },
      flashcardsCreated: { type: Number, default: 0 },
      studyMinutes: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

userSchema.pre("validate", function syncNames() {
  if (!this.name && this.fullName) this.name = this.fullName;
  if (!this.fullName && this.name) this.fullName = this.name;
  if (!this.name && !this.fullName) this.invalidate("name", "Name is required");
});

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.password;
    return returnedObject;
  },
});

module.exports = mongoose.model("User", userSchema);
