import { useState } from "react";
import { api } from "../api.js";

const BOARD_OPTIONS = ["CBSE", "ICSE", "State"];

function clampScoreText(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, n));
}

export default function ScoreForm({ onClassified }) {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [school, setSchool] = useState("");
  const [board, setBoard] = useState("CBSE");

  const [mathematics, setMathematics] = useState("");
  const [science, setScience] = useState("");
  const [socialScience, setSocialScience] = useState("");
  const [english, setEnglish] = useState("");
  const [hindi, setHindi] = useState("");
  const [sanskrit, setSanskrit] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!name.trim()) return "Student name is required.";
    if (!rollNumber.trim()) return "Roll number is required.";
    if (!school.trim()) return "School is required.";
    if (!BOARD_OPTIONS.includes(board)) return "Invalid board selection.";

    const requiredScores = [
      ["Mathematics", mathematics],
      ["Science", science],
      ["Social Science", socialScience],
      ["English", english],
      ["Hindi", hindi]
    ];

    for (const [label, val] of requiredScores) {
      if (val === "") return `${label} score is required.`;
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0 || n > 100) return `${label} must be between 0 and 100.`;
    }

    if (sanskrit.trim() !== "") {
      const n = Number(sanskrit);
      if (!Number.isFinite(n) || n < 0 || n > 100) return `Sanskrit must be between 0 and 100.`;
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const payload = {
        name,
        rollNumber,
        school,
        board,
        mathematics: Number(mathematics),
        science: Number(science),
        socialScience: Number(socialScience),
        english: Number(english),
        hindi: Number(hindi)
      };

      if (sanskrit.trim() !== "") {
        payload.sanskrit = Number(sanskrit);
      }

      const res = await api.post("/classify", payload);
      const result = res.data?.data?.result;
      if (!result) throw new Error("Unexpected response from server.");
      onClassified?.(result);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to classify student.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-4">Student Details & Scores</h2>

      {error ? (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Student Name</label>
          <input
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Aarav Sharma"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Roll Number</label>
          <input
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="e.g., 101"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">School</label>
          <input
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="e.g., Green Valley School"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Board</label>
          <select
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={board}
            onChange={(e) => setBoard(e.target.value)}
          >
            {BOARD_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Scores (0 to 100)</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScoreInput label="Mathematics" value={mathematics} onChange={setMathematics} />
          <ScoreInput label="Science" value={science} onChange={setScience} />
          <ScoreInput label="Social Science" value={socialScience} onChange={setSocialScience} />
          <ScoreInput label="English" value={english} onChange={setEnglish} />
          <ScoreInput label="Hindi" value={hindi} onChange={setHindi} />
          <ScoreInput label="Sanskrit (optional)" value={sanskrit} onChange={setSanskrit} optional />
        </div>
      </div>

      <button
        disabled={loading}
        type="submit"
        className="mt-6 w-full md:w-auto px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Classifying...
          </span>
        ) : (
          "Classify Stream"
        )}
      </button>
    </form>
  );
}

function ScoreInput({ label, value, onChange, optional }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label} {optional ? <span className="text-gray-400">(optional)</span> : null}
      </label>
      <input
        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        placeholder={optional ? "Leave blank" : "Enter score"}
      />
    </div>
  );
}

