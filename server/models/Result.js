const mongoose = require("mongoose");

const { Schema } = mongoose;

const ScoresSchema = new Schema(
  {
    mathematics: { type: Number, required: true, min: 0, max: 100 },
    science: { type: Number, required: true, min: 0, max: 100 },
    socialScience: { type: Number, required: true, min: 0, max: 100 },
    english: { type: Number, required: true, min: 0, max: 100 },
    hindi: { type: Number, required: true, min: 0, max: 100 },
    sanskrit: { type: Number, min: 0, max: 100, required: false }
  },
  { _id: false }
);

const ResultSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    scores: { type: ScoresSchema, required: true },
    totalScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    recommendedStream: {
      type: String,
      required: true,
      enum: ["Science", "Commerce", "Arts"]
    },
    confidenceScore: { type: Number, required: true, min: 0, max: 100 },
    alternativeStream: { type: String, required: true, enum: ["Science", "Commerce", "Arts"] },
    reasoning: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", ResultSchema);

