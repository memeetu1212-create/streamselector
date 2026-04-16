console.log("Starting server...");
console.log("MONGO_URI:", process.env.MONGO_URI);
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load env:
// 1) project root (.env) for general config like JWT_SECRET/PORT
// 2) server/.env (if present) to override MONGO_URI when you store it there
const fs = require("fs");
const rootEnvPath = path.resolve(__dirname, "..", ".env");
const serverEnvPath = path.resolve(__dirname, ".env");

dotenv.config({ path: rootEnvPath });
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath, override: true });
}

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔥 VERY IMPORTANT (handles preflight)
app.options("*", cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Student Stream Classifier API is running." });
});

const authRoutes = require("./routes/auth");
const classifyRoutes = require("./routes/classify");
const resultsRoutes = require("./routes/results");

app.use("/api/auth", authRoutes);
app.use("/api", classifyRoutes);
app.use("/api", resultsRoutes);

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

  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Endpoint not found." });
  });

  // Last-resort error handler (controllers should prefer explicit responses).
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.statusCode || err.status || 500;
    res.status(status).json({ success: false, message: err.message || "Server error." });
  });

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});

