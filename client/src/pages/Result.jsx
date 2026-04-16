import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import jsPDF from "jspdf";
import { api, authHeaders, getToken } from "../api.js";
import ResultCard from "../components/ResultCard.jsx";

function normalizeFromState(stateResult) {
  if (!stateResult) return null;
  return {
    ...stateResult,
    id: stateResult.id || stateResult._id,
    student: stateResult.student
  };
}

function normalizeFromApi(apiResult) {
  if (!apiResult) return null;
  const studentId = apiResult.studentId || {};
  return {
    id: apiResult._id,
    scores: apiResult.scores,
    totalScore: apiResult.totalScore,
    percentage: apiResult.percentage,
    recommendedStream: apiResult.recommendedStream,
    confidenceScore: apiResult.confidenceScore,
    alternativeStream: apiResult.alternativeStream,
    reasoning: apiResult.reasoning,
    createdAt: apiResult.createdAt,
    student: studentId
      ? {
          id: studentId._id,
          name: studentId.name,
          rollNumber: studentId.rollNumber,
          school: studentId.school,
          board: studentId.board
        }
      : null
  };
}

function formatNumber(n) {
  if (!Number.isFinite(n)) return "0";
  return n.toString();
}

export default function Result() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const token = getToken();

  const stateResult = location.state?.result;
  const [result, setResult] = useState(() => normalizeFromState(stateResult));
  const [loading, setLoading] = useState(!stateResult);
  const [error, setError] = useState("");

  const needsFetch = useMemo(() => {
    // We fetch if we don't have scores (useful for PDF), or if state is missing.
    if (!stateResult) return true;
    if (!stateResult.scores) return true;
    return false;
  }, [stateResult]);

  useEffect(() => {
    const run = async () => {
      if (needsFetch) {
        if (!token) {
          navigate("/login");
          return;
        }
        setLoading(true);
        setError("");
        try {
          const res = await api.get(`/api/results/${id}`, { headers: authHeaders() });
          const apiResult = res.data?.data?.result;
          if (!apiResult) throw new Error("Result not found.");
          setResult(normalizeFromApi(apiResult));
        } catch (err) {
          setError(err?.response?.data?.message || err?.message || "Failed to load result.");
        } finally {
          setLoading(false);
        }
      }
    };
    run();
  }, [id, needsFetch, navigate, stateResult, token]);

  const handleDownloadPdf = () => {
    if (!result) return;

    const student = result.student || {};
    const doc = new jsPDF();
    let y = 14;

    doc.setFontSize(16);
    doc.text("Student Stream Classification", 14, y);
    y += 10;

    doc.setFontSize(11);
    const headerLines = [
      `Name: ${student.name || "-"}`,
      `Roll No.: ${student.rollNumber || "-"}`,
      `School: ${student.school || "-"}`,
      `Board: ${student.board || "-"}`,
      `Recommended Stream: ${result.recommendedStream || "-"}`,
      `Confidence: ${formatNumber(result.confidenceScore ?? 0)}%`,
      `Alternative Stream: ${result.alternativeStream || "-"}`
    ];

    for (const line of headerLines) {
      doc.text(line, 14, y);
      y += 7;
    }

    y += 4;
    doc.setFontSize(12);
    doc.text(`Total Score: ${formatNumber(result.totalScore ?? 0)} | Percentage: ${(result.percentage ?? 0).toFixed(1)}%`, 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.text("Scores:", 14, y);
    y += 6;

    const s = result.scores || {};
    const scoreLines = [
      `Mathematics: ${formatNumber(s.mathematics ?? 0)}`,
      `Science: ${formatNumber(s.science ?? 0)}`,
      `Social Science: ${formatNumber(s.socialScience ?? 0)}`,
      `English: ${formatNumber(s.english ?? 0)}`,
      `Hindi: ${formatNumber(s.hindi ?? 0)}`,
      `Sanskrit: ${typeof s.sanskrit === "undefined" ? "-" : formatNumber(s.sanskrit)}`
    ];

    for (const line of scoreLines) {
      if (y > 270) {
        doc.addPage();
        y = 14;
      }
      doc.text(line, 14, y);
      y += 7;
    }

    y += 4;
    doc.text("Reasoning:", 14, y);
    y += 6;
    const reasoning = result.reasoning || "-";
    const maxWidth = 180;
    const lines = doc.splitTextToSize(reasoning, maxWidth);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = 14;
      }
      doc.text(line, 14, y);
      y += 7;
    }

    doc.save(
      `Stream_${student.rollNumber || "student"}_${result.recommendedStream || "Result"}.pdf`
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {loading ? (
        <div className="bg-white rounded-xl shadow p-6 text-sm text-gray-600">Loading result...</div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow p-6 text-sm text-red-800 border border-red-200 bg-red-50">
          {error} <Link className="underline" to="/history">Back to History</Link>
        </div>
      ) : result ? (
        <>
          <div className="flex items-center justify-between gap-3 flex-col md:flex-row mb-4">
            <div>
              <h1 className="text-2xl font-bold">Classification Result</h1>
              <p className="text-sm text-gray-600 mt-1">
                {result.student?.name || "Student"} • Roll No: {result.student?.rollNumber || "-"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 w-full md:w-auto"
            >
              Download PDF
            </button>
          </div>

          <ResultCard result={result} />
        </>
      ) : (
        <div className="bg-white rounded-xl shadow p-6 text-sm text-gray-600">No result found.</div>
      )}
    </div>
  );
}

