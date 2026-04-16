const Student = require("../models/Student");
const Result = require("../models/Result");
const { classifyStudent } = require("../utils/classificationEngine");

const BOARD_VALUES = ["CBSE", "ICSE", "State"];

function asTrimString(v) {
  if (typeof v !== "string") return "";
  return v.trim();
}

function assertScore(fieldName, value) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    throw new Error(`${fieldName} must be a number between 0 and 100.`);
  }
  return n;
}

function computeTotals(scores) {
  const subjectScores = [
    scores.mathematics,
    scores.science,
    scores.socialScience,
    scores.english,
    scores.hindi
  ];
  if (typeof scores.sanskrit === "number") subjectScores.push(scores.sanskrit);

  const totalScore = subjectScores.reduce((sum, n) => sum + n, 0);
  const percentage = (totalScore / (subjectScores.length * 100)) * 100;
  return { totalScore, percentage };
}

async function classify(req, res) {
  try {
    const body = req.body || {};

    const name = asTrimString(body.name);
    const rollNumber = asTrimString(body.rollNumber);
    const school = asTrimString(body.school);
    const board = asTrimString(body.board);

    if (!name) return res.status(400).json({ success: false, message: "Student name is required." });
    if (!rollNumber)
      return res.status(400).json({ success: false, message: "Roll number is required." });
    if (!school) return res.status(400).json({ success: false, message: "School is required." });
    if (!BOARD_VALUES.includes(board))
      return res.status(400).json({ success: false, message: "Invalid board. Use CBSE, ICSE, or State." });

    const nestedScores = body.scores && typeof body.scores === "object" ? body.scores : {};

    const sanskritRaw = body.sanskrit ?? nestedScores.sanskrit;

    const scores = {
      mathematics: assertScore("Mathematics", body.mathematics ?? nestedScores.mathematics),
      science: assertScore("Science", body.science ?? nestedScores.science),
      socialScience: assertScore("Social Science", body.socialScience ?? nestedScores.socialScience),
      english: assertScore("English", body.english ?? nestedScores.english),
      hindi: assertScore("Hindi", body.hindi ?? nestedScores.hindi),
      sanskrit: sanskritRaw === undefined ? undefined : assertScore("Sanskrit", sanskritRaw)
    };

    const { totalScore, percentage } = computeTotals(scores);

    const { recommendedStream, confidenceScore, alternativeStream, reasoning } = classifyStudent({
      scores,
      totalScore,
      percentage
    });

    // Upsert student by (rollNumber + board)
    const student = await Student.findOneAndUpdate(
      { rollNumber, board },
      { $set: { name, rollNumber, school, board } },
      { upsert: true, new: true }
    );

    const result = await Result.create({
      studentId: student._id,
      scores,
      totalScore,
      percentage,
      recommendedStream,
      confidenceScore,
      alternativeStream,
      reasoning
    });

    return res.status(201).json({
      success: true,
      data: {
        result: {
          id: result._id,
          scores,
          recommendedStream,
          confidenceScore,
          alternativeStream,
          reasoning,
          totalScore,
          percentage,
          createdAt: result.createdAt,
          student: {
            id: student._id,
            name: student.name,
            rollNumber: student.rollNumber,
            school: student.school,
            board: student.board
          }
        }
      }
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message || "Classification failed." });
  }
}

module.exports = { classify };

