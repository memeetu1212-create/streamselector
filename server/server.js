
console.log("Starting server...");

const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");

// ✅ Load environment variables
const rootEnvPath = path.resolve(__dirname, "..", ".env");
const serverEnvPath = path.resolve(__dirname, ".env");

dotenv.config({ path: rootEnvPath });

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath, override: true });
}

console.log("MONGO_URI:", process.env.MONGO_URI);

// ✅ Initialize app
const app = express();

// ✅ Proper CORS (clean & correct)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

// ✅ Middleware
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Stream Classifier API is running.",
  });
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

  // ✅ Connect MongoDB
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("MongoDB connected");

  // ✅ 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Endpoint not found.",
    });
  });

  // ✅ Global error handler
  app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
      success: false,
      message: err.message || "Server error.",
    });
  });

  // ✅ Start listening
  app.listen(port, () => {
    console.log("Server running on port " + port);
  });
}

// ✅ Run server
start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

