import { useState } from "react";
import { Link } from "react-router-dom";
import ScoreForm from "../components/ScoreForm.jsx";
import ResultCard from "../components/ResultCard.jsx";

export default function Home() {
  const [result, setResult] = useState(null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ScoreForm
          onClassified={(r) => {
            setResult(r);
          }}
        />

        <div className="flex flex-col gap-4">
          {result ? (
            <>
              <ResultCard result={result} />
              <div className="flex gap-3">
                <Link
                  to={`/result/${result.id}`}
                  state={{ result }}
                  className="w-full px-4 py-2 rounded bg-gray-900 text-white text-center hover:bg-gray-800"
                >
                  View Full Result
                </Link>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow p-4 md:p-6">
              <h2 className="text-lg font-semibold">Live Result</h2>
              <p className="text-sm text-gray-600 mt-1">
                Enter marks and click <span className="font-medium">Classify Stream</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

