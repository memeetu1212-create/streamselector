console.log("Starting server...");

const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");

// Load environment variables
const rootEnvPath = path.resolve(__dirname, "..", ".env");
const serverEnvPath = path.resolve(__dirname, ".env");

dotenv.config({ path: rootEnvPath });
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath, override: true });
}

const app = express();

// ✅ ROBUST CORS FIX (handles preflight properly)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // ✅ handle preflight
  }

  next();
});

app.use(cors());
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Student Stream Classifier API is running." });
});

// ✅ Routes
const authRoutes = require("./routes/auth");
const classifyRoutes = require("./routes/classify");
const resultsRoutes = require("./routes/results");

app.use("/api/auth", authRoutes);
app.use("/api", classifyRoutes);
app.use("/api", resultsRoutes);

// ✅ Start server
async function start() {
  const mongoUri = process.env.MONGO_URI;
  const port = process.env.PORT || 5000;

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in .env");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in .env");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Endpoint not found." });
  });

  // Error handler
  app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
      success: false,
      message: err.message || "Server error.",
    });
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});