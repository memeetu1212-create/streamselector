export default function ResultCard({ result }) {
  if (!result) return null;

  const colorMap = {
    Science: { bar: "bg-blue-600", bg: "bg-blue-50", text: "text-blue-800" },
    Commerce: { bar: "bg-green-600", bg: "bg-green-50", text: "text-green-800" },
    Arts: { bar: "bg-orange-600", bg: "bg-orange-50", text: "text-orange-800" }
  };

  const stream = result.recommendedStream;
  const colors = colorMap[stream] || colorMap.Arts;

  return (
    <section className={`rounded-xl shadow border ${colors.bg} p-4 md:p-6`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <div className={`text-sm font-medium ${colors.text}`}>Recommended Stream</div>
          <div className="text-2xl font-bold">{stream}</div>
        </div>

        <div className="min-w-[180px]">
          <div className="text-sm font-medium text-gray-700 mb-1">Confidence</div>
          <div className="h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className={`h-2 ${colors.bar}`}
              style={{ width: `${Math.max(0, Math.min(100, result.confidenceScore ?? 0))}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {Math.max(0, Math.min(100, result.confidenceScore ?? 0))}% confidence
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/70 border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-800">Alternative Stream</div>
          <div className="text-lg font-semibold text-gray-900">{result.alternativeStream}</div>
        </div>
        <div className="rounded-lg bg-white/70 border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-800">Result Summary</div>
          <div className="text-sm text-gray-700 mt-1">
            Total Score: <span className="font-semibold">{result.totalScore}</span>
            <br />
            Percentage: <span className="font-semibold">{(result.percentage ?? 0).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium text-gray-800">Reasoning</div>
        <p className="text-sm text-gray-700 mt-1">{result.reasoning}</p>
      </div>
    </section>
  );
}

