const Result = require("../models/Result");
const Student = require("../models/Student");

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getAllResults(req, res) {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 10);
    const skip = (page - 1) * limit;

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    let studentIds = null;
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const students = await Student.find({ $or: [{ name: regex }, { rollNumber: regex }] }).select("_id");
      studentIds = students.map((s) => s._id);
      if (studentIds.length === 0) {
        return res.json({
          success: true,
          data: { results: [], total: 0, page, limit }
        });
      }
    }

    const query = studentIds ? { studentId: { $in: studentIds } } : {};

    const [total, results] = await Promise.all([
      Result.countDocuments(query),
      Result.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("studentId", "name rollNumber school board")
        .exec()
    ]);

    return res.json({
      success: true,
      data: {
        results,
        total,
        page,
        limit
      }
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message || "Failed to fetch results." });
  }
}

async function getResultById(req, res) {
  try {
    const { id } = req.params;
    const result = await Result.findById(id).populate("studentId", "name rollNumber school board").exec();

    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found." });
    }

    return res.json({ success: true, data: { result } });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message || "Failed to fetch result." });
  }
}

async function deleteResult(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Result.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Result not found." });
    }
    return res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message || "Failed to delete result." });
  }
}

async function getStatsSummary(req, res) {
  try {
    const streamCounts = await Result.aggregate([
      { $group: { _id: "$recommendedStream", count: { $sum: 1 } } }
    ]);

    const byStream = {
      Science: 0,
      Commerce: 0,
      Arts: 0
    };
    for (const row of streamCounts) {
      if (row._id in byStream) byStream[row._id] = row.count;
    }

    return res.json({ success: true, data: { summary: byStream } });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message || "Failed to fetch stats summary." });
  }
}

module.exports = { getAllResults, getResultById, deleteResult, getStatsSummary };

