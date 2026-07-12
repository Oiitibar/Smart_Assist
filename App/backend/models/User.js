const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Support both old project fullName and new backend name
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
      phone: {
        type: String,
        default: "",
      },
      school: {
        type: String,
        default: "",
      },
      grade: {
        type: String,
        default: "",
      },
      subjects: {
        type: [String],
        default: [],
      },
    },

    preferences: {
      theme: {
        type: String,
        default: "light",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      studyReminder: {
        type: String,
        default: "30 minutes before",
      },
      language: {
        type: String,
        default: "English",
      },
      timetableView: {
        type: String,
        default: "Week View",
      },
      flashcardMode: {
        type: String,
        default: "Review All",
      },
    },

    studyData: {
      dailyGoal: {
        type: Number,
        default: 5,
      },
      completedTasks: {
        type: Number,
        default: 0,
      },
      flashcardsCreated: {
        type: Number,
        default: 0,
      },
      studyMinutes: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Make sure at least name/fullName exists before validation
userSchema.pre("validate", function (next) {
  if (!this.name && this.fullName) {
    this.name = this.fullName;
  }

  if (!this.fullName && this.name) {
    this.fullName = this.name;
  }

  if (!this.name && !this.fullName) {
    this.invalidate("name", "Name is required");
  }

  next();
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Remove password when sending user data to frontend
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);