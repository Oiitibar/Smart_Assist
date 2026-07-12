const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    title: { type: String, required: true, trim: true },
    originalName: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: "FILE" },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
