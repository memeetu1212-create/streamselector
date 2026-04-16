const express = require("express");
const router = express.Router();

const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const {
  getAllResults,
  getResultById,
  deleteResult,
  getStatsSummary
} = require("../controllers/resultsController");

// Protect history/stats endpoints using JWT
router.get("/results", authMiddleware, getAllResults);
router.get("/results/:id", authMiddleware, getResultById);
router.delete("/results/:id", authMiddleware, requireRole("admin", "teacher"), deleteResult);
router.get("/stats/summary", authMiddleware, requireRole("admin", "teacher"), getStatsSummary);

module.exports = router;

