const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const materialRoutes = require("./routes/materialRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Smart Student Planner API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/flashcards", flashcardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
