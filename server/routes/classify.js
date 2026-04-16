const express = require("express");
const router = express.Router();

const { classify } = require("../controllers/classifyController");

// FINAL CORRECT
router.post("/classify", classify);

module.exports = router;
