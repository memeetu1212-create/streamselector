import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api, authHeaders, getToken } from "../api.js";
import HistoryTable from "../components/HistoryTable.jsx";

export default function History() {
  const navigate = useNavigate();
  const token = getToken();

  const [summary, setSummary] = useState({ Science: 0, Commerce: 0, Arts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/stats/summary", { headers: authHeaders() });
        const s = res.data?.data?.summary || {};
        setSummary({
          Science: s.Science || 0,
          Commerce: s.Commerce || 0,
          Arts: s.Arts || 0
        });
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [navigate, token]);

  const chartData = useMemo(
    () => [
      { stream: "Science", count: summary.Science },
      { stream: "Commerce", count: summary.Commerce },
      { stream: "Arts", count: summary.Arts }
    ],
    [summary]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <section className="bg-white rounded-xl shadow p-4 md:p-6">
        <h2 className="text-lg font-semibold">Stream Distribution</h2>
        <p className="text-sm text-gray-600 mt-1">A quick overview of classified students.</p>

        {loading ? (
          <div className="mt-4 text-sm text-gray-600">Loading chart...</div>
        ) : error ? (
          <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : (
          <div className="mt-4" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stream" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Students" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <HistoryTable />
    </div>
  );
}

