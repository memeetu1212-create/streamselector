import { useEffect, useMemo, useState } from "react";
import { api, authHeaders } from "../api.js";

export default function HistoryTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [searchApplied, setSearchApplied] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  useEffect(() => {
    const fetchPage = async () => {
      const res = await api.get("/api/results", {
        params: { page, limit, search: searchApplied || undefined },
        headers: authHeaders()
      });
      if (!res.data?.success) throw new Error(res.data?.message || "Failed to load results.");

      setRows(res.data.data.results || []);
      setTotal(res.data.data.total || 0);
    };

    fetchPage().catch(() => {
      // Keep UI simple; page errors will be handled in the parent if needed.
    });
  }, [page, limit, searchApplied]);

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchApplied(search.trim());
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <section className="bg-white rounded-xl shadow p-4 md:p-6 mt-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">History</h2>
          <p className="text-sm text-gray-600">Search and browse all classifications.</p>
        </div>

        <form onSubmit={applySearch} className="flex gap-2 w-full md:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or roll no."
            className="w-full md:w-72 rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800">
            Search
          </button>
        </form>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Rows</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="rounded border border-gray-300 px-2 py-1 outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-[700px] w-full border-collapse">
          <thead>
            <tr className="text-left text-sm text-gray-700">
              <th className="py-2 border-b px-3">Name</th>
              <th className="py-2 border-b px-3">Roll No.</th>
              <th className="py-2 border-b px-3">Percentage</th>
              <th className="py-2 border-b px-3">Stream</th>
              <th className="py-2 border-b px-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 px-3 text-center text-sm text-gray-600">
                  No results found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="border-b last:border-b-0 text-sm">
                  <td className="py-2 px-3">{r.studentId?.name || "-"}</td>
                  <td className="py-2 px-3">{r.studentId?.rollNumber || "-"}</td>
                  <td className="py-2 px-3">{(r.percentage ?? 0).toFixed(1)}%</td>
                  <td className="py-2 px-3">
                    <span
                      className={
                        r.recommendedStream === "Science"
                          ? "inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-1 text-xs font-medium"
                          : r.recommendedStream === "Commerce"
                            ? "inline-flex items-center rounded-full bg-green-50 text-green-700 px-2 py-1 text-xs font-medium"
                            : "inline-flex items-center rounded-full bg-orange-50 text-orange-700 px-2 py-1 text-xs font-medium"
                      }
                    >
                      {r.recommendedStream}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canPrev && setPage((p) => p - 1)}
          disabled={!canPrev}
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => canNext && setPage((p) => p + 1)}
          disabled={!canNext}
          className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}

