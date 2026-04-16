const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    school: { type: String, required: true, trim: true },
    board: { type: String, required: true, enum: ["CBSE", "ICSE", "State"] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);

