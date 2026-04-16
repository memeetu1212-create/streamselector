const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const Student = require("./models/Student");
const Result = require("./models/Result");
const User = require("./models/User");
const { classifyStudent } = require("./utils/classificationEngine");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// If you store DB credentials in server/.env, overlay them for MONGO_URI.
const fs = require("fs");
const serverEnvPath = path.resolve(__dirname, ".env");
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath, override: true });
}

function clampScore(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function computeTotals(scores) {
  const subjectScores = [
    scores.mathematics,
    scores.science,
    scores.socialScience,
    scores.english,
    scores.hindi
  ];
  const sanskritDefined = typeof scores.sanskrit !== "undefined";
  if (sanskritDefined) subjectScores.push(scores.sanskrit);

  const totalScore = subjectScores.reduce((sum, n) => sum + n, 0);
  const percentage = (totalScore / (subjectScores.length * 100)) * 100;
  return { totalScore, percentage };
}

async function ensureAdminUser() {
  // Create a default admin user for quick testing.
  // You can change these in .env by editing the values below if you want.
  const email = "admin@example.com";
  const password = "admin123";

  const existing = await User.findOne({ email });
  if (existing) return;

  const bcrypt = require("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name: "Default Admin",
    email,
    passwordHash,
    role: "admin"
  });
}

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("Missing MONGO_URI in .env");

  if (!process.env.JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.warn("JWT_SECRET missing in .env. Seed will still run, but login may fail.");
  }

  await mongoose.connect(mongoUri);

  await ensureAdminUser();

  const sample = [
    {
      name: "Aarav Sharma",
      rollNumber: "101",
      school: "Green Valley School",
      board: "CBSE",
      scores: { mathematics: 88, science: 79, socialScience: 65, english: 76, hindi: 84 }
    },
    {
      name: "Diya Verma",
      rollNumber: "102",
      school: "Sunrise Academy",
      board: "CBSE",
      scores: { mathematics: 84, science: 82, socialScience: 58, english: 81, hindi: 73, sanskrit: 70 }
    },
    {
      name: "Kabir Singh",
      rollNumber: "103",
      school: "Blue Bird School",
      board: "ICSE",
      scores: { mathematics: 78, science: 74, socialScience: 72, english: 80, hindi: 66 }
    },
    {
      name: "Meera Joshi",
      rollNumber: "104",
      school: "Maple Grove",
      board: "State",
      scores: { mathematics: 69, science: 62, socialScience: 80, english: 74, hindi: 85, sanskrit: 88 }
    },
    {
      name: "Vihaan Patel",
      rollNumber: "105",
      school: "Orchid Public School",
      board: "CBSE",
      scores: { mathematics: 91, science: 88, socialScience: 60, english: 79, hindi: 70 }
    },
    {
      name: "Ananya Rao",
      rollNumber: "106",
      school: "North Star",
      board: "ICSE",
      scores: { mathematics: 62, science: 70, socialScience: 66, english: 72, hindi: 64 }
    },
    {
      name: "Arjun Nair",
      rollNumber: "107",
      school: "Cedar Heights",
      board: "State",
      scores: { mathematics: 58, science: 55, socialScience: 74, english: 67, hindi: 73, sanskrit: 60 }
    },
    {
      name: "Riya Gupta",
      rollNumber: "108",
      school: "Kitewood School",
      board: "CBSE",
      scores: { mathematics: 73, science: 70, socialScience: 78, english: 68, hindi: 72 }
    },
    {
      name: "Ishaan Das",
      rollNumber: "109",
      school: "Oak Ridge School",
      board: "ICSE",
      scores: { mathematics: 66, science: 60, socialScience: 82, english: 75, hindi: 68, sanskrit: 66 }
    },
    {
      name: "Saanvi Kulkarni",
      rollNumber: "110",
      school: "Silver Oak",
      board: "CBSE",
      scores: { mathematics: 61, science: 58, socialScience: 63, english: 71, hindi: 69 }
    },
    {
      name: "Tanish Mehta",
      rollNumber: "111",
      school: "Riverside School",
      board: "State",
      scores: { mathematics: 86, science: 60, socialScience: 55, english: 74, hindi: 62, sanskrit: 59 }
    },
    {
      name: "Prisha Shah",
      rollNumber: "112",
      school: "Highland Academy",
      board: "CBSE",
      scores: { mathematics: 90, science: 76, socialScience: 61, english: 67, hindi: 66 }
    },
    {
      name: "Viorel Fernandez",
      rollNumber: "113",
      school: "Kingsway School",
      board: "ICSE",
      scores: { mathematics: 70, science: 66, socialScience: 68, english: 83, hindi: 78 }
    },
    {
      name: "Neha Verma",
      rollNumber: "114",
      school: "Banyan Tree",
      board: "State",
      scores: { mathematics: 59, science: 64, socialScience: 76, english: 69, hindi: 79, sanskrit: 72 }
    },
    {
      name: "Raghav Kulkarni",
      rollNumber: "115",
      school: "Sunflower Public School",
      board: "CBSE",
      scores: { mathematics: 63, science: 57, socialScience: 61, english: 69, hindi: 71 }
    },
    {
      name: "Zara Khan",
      rollNumber: "116",
      school: "Pinewood School",
      board: "ICSE",
      scores: { mathematics: 72, science: 73, socialScience: 69, english: 66, hindi: 83 }
    },
    {
      name: "Aditya Roy",
      rollNumber: "117",
      school: "Crown Public School",
      board: "State",
      scores: { mathematics: 64, science: 61, socialScience: 71, english: 62, hindi: 85, sanskrit: 82 }
    },
    {
      name: "Anya Thomas",
      rollNumber: "118",
      school: "Maple Leaf Academy",
      board: "CBSE",
      scores: { mathematics: 68, science: 72, socialScience: 73, english: 80, hindi: 65 }
    },
    {
      name: "Hritik Joshi",
      rollNumber: "119",
      school: "Evergreen School",
      board: "ICSE",
      scores: { mathematics: 82, science: 77, socialScience: 62, english: 71, hindi: 59, sanskrit: 58 }
    },
    {
      name: "Sara Ibrahim",
      rollNumber: "120",
      school: "Vision School",
      board: "CBSE",
      scores: { mathematics: 58, science: 63, socialScience: 79, english: 74, hindi: 70, sanskrit: 66 }
    }
  ].map((s) => ({
    ...s,
    scores: {
      ...s.scores,
      mathematics: clampScore(s.scores.mathematics),
      science: clampScore(s.scores.science),
      socialScience: clampScore(s.scores.socialScience),
      english: clampScore(s.scores.english),
      hindi: clampScore(s.scores.hindi),
      sanskrit: typeof s.scores.sanskrit === "undefined" ? undefined : clampScore(s.scores.sanskrit)
    }
  }));

  for (const studentData of sample) {
    const { name, rollNumber, school, board, scores } = studentData;

    const existingStudent = await Student.findOne({ rollNumber, board });
    let student = existingStudent;
    if (!student) {
      student = await Student.create({ name, rollNumber, school, board });
    } else {
      await Student.updateOne({ _id: student._id }, { $set: { name, school, board } });
    }

    // Replace result for this student+board to keep seed stable.
    await Result.deleteMany({ studentId: student._id });

    const { totalScore, percentage } = computeTotals(scores);
    const { recommendedStream, confidenceScore, alternativeStream, reasoning } = classifyStudent({
      scores,
      totalScore,
      percentage
    });

    await Result.create({
      studentId: student._id,
      scores,
      totalScore,
      percentage,
      recommendedStream,
      confidenceScore,
      alternativeStream,
      reasoning
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seed completed successfully.");
  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", err);
    process.exit(1);
  });

