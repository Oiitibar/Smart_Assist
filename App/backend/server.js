const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require("dotenv");
const multer = require("multer");
const fs = require("fs");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const materialRoutes = require("./routes/materialRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const quizRoutes = require("./routes/quizRoutes");
const documentAiRoutes = require("./routes/documentAiRoutes");
const taskRoutes = require("./routes/taskRoutes");
const adminRoutes = require("./routes/adminRoutes");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = String(
  process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },

    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Only profile avatars are public. Study documents remain private and are
// served exclusively through authenticated /api/materials/:materialId/view.
app.use(
  "/uploads/avatars",
  express.static(path.join(__dirname, "uploads", "avatars"))
);

// Backward-compatible access for avatars uploaded by older project versions.
// A legacy file is served only when it is referenced as a user's avatar, so
// old study materials in uploads/ are not exposed as public static files.
app.get("/uploads/:filename", async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename || "");
    if (!filename) return res.status(404).end();

    const avatarOwner = await User.exists({ avatarUrl: `/uploads/${filename}` });
    if (!avatarOwner) return res.status(404).end();

    const legacyPath = path.join(__dirname, "uploads", filename);
    if (!fs.existsSync(legacyPath)) return res.status(404).end();
    return res.sendFile(legacyPath);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Smart Assist API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/materials", documentAiRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);
// Route not found
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Uploaded file is too large"
          : error.message,
    });
  }

  if (error?.code === 11000) {
    const field =
      Object.keys(error.keyPattern || {})[0] || "value";

    return res.status(409).json({
      message: `${field} already exists`,
    });
  }

  if (error?.name === "ValidationError") {
    const message =
      Object.values(error.errors || {})[0]?.message ||
      "Validation failed";

    return res.status(400).json({
      message,
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({
      message: "Invalid record ID",
    });
  }

  return res.status(error.status || 500).json({
    message: error.message || "Server error",
  });
});

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Server running on 0.0.0.0:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      `Database connection failed: ${error.message}`
    );

    process.exit(1);
  });