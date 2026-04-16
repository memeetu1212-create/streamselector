const express = require("express");
const router = express.Router();

const { classify } = require("../controllers/classifyController");

// POST /api/classify
router.post("/classify", classify);

module.exports = router;

