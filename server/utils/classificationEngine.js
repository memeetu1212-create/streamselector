function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function toNumber(value) {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function computeLanguageScore({ hindi, sanskrit }) {
  // Use the best available language score between Hindi and Sanskrit.
  const h = toNumber(hindi);
  const s = typeof sanskrit === "undefined" ? 0 : toNumber(sanskrit);
  return Math.max(Number.isFinite(h) ? h : 0, Number.isFinite(s) ? s : 0);
}

function formatPercent(n) {
  if (!Number.isFinite(n)) return "0%";
  return `${n.toFixed(1)}%`;
}

/**
 * Classification decision engine based on weighted formulas + thresholds.
 *
 * Input:
 *   - scores: { mathematics, science, socialScience, english, hindi, sanskrit? }
 *   - totalScore, percentage
 *
 * Output:
 *   { recommendedStream, confidenceScore, alternativeStream, reasoning }
 */
function classifyStudent({ scores, totalScore, percentage }) {
  const maths = toNumber(scores.mathematics);
  const science = toNumber(scores.science);
  const social = toNumber(scores.socialScience);
  const english = toNumber(scores.english);
  const hindi = toNumber(scores.hindi);
  const sanskrit = scores.sanskrit === undefined ? undefined : toNumber(scores.sanskrit);

  const language = computeLanguageScore({ hindi, sanskrit });

  const scienceWeighted = maths * 0.4 + science * 0.4 + english * 0.2;
  const commerceWeighted = maths * 0.35 + english * 0.35 + social * 0.3;
  const artsWeighted = social * 0.4 + language * 0.4 + english * 0.2;

  const scienceThreshold =
    maths >= 80 && science >= 75 && typeof percentage === "number" && percentage >= 75;
  const commerceThreshold = maths >= 60 && english >= 65 && social >= 60;
  const artsThreshold = social >= 70 && language >= 65 && !scienceThreshold && !commerceThreshold;

  const sciCandidate = scienceThreshold ? scienceWeighted : Number.NEGATIVE_INFINITY;
  const comCandidate = commerceThreshold ? commerceWeighted : Number.NEGATIVE_INFINITY;
  const artsCandidate = artsThreshold ? artsWeighted : Number.NEGATIVE_INFINITY;

  const candidates = [
    { stream: "Science", candidate: sciCandidate, weighted: scienceWeighted },
    { stream: "Commerce", candidate: comCandidate, weighted: commerceWeighted },
    { stream: "Arts", candidate: artsCandidate, weighted: artsWeighted }
  ];

  const sortedByCandidate = [...candidates].sort((a, b) => b.candidate - a.candidate);
  let recommended = sortedByCandidate[0];
  let alternative = sortedByCandidate[1];

  // If none of the thresholds matched, fall back to highest weighted score overall.
  if (!Number.isFinite(recommended.candidate)) {
    const sortedByWeighted = [...candidates].sort((a, b) => b.weighted - a.weighted);
    recommended = sortedByWeighted[0];
    alternative = sortedByWeighted[1];
  }

  const recommendedMeetsThreshold =
    (recommended.stream === "Science" && scienceThreshold) ||
    (recommended.stream === "Commerce" && commerceThreshold) ||
    (recommended.stream === "Arts" && artsThreshold);

  const reliability = recommendedMeetsThreshold ? 1 : 0.75;
  const confidenceScore = Math.round(clamp(recommended.weighted * reliability, 0, 100));

  const reasoning = [
    `Board percentage ${formatPercent(percentage)} | Total score ${totalScore}.`,
    `Science check: Maths>=80(${maths}), Science>=75(${science}), Percentage>=75(${percentage ? percentage.toFixed(1) : 0}) => ${
      scienceThreshold ? "PASS" : "FAIL"
    } (Weighted: ${scienceWeighted.toFixed(1)}).`,
    `Commerce check: Maths>=60(${maths}), English>=65(${english}), Social>=60(${social}) => ${
      commerceThreshold ? "PASS" : "FAIL"
    } (Weighted: ${commerceWeighted.toFixed(1)}).`,
    `Arts check: Social>=70(${social}), Language>=65(${language}) and not Science/Commerce thresholds => ${
      artsThreshold ? "PASS" : "FAIL"
    } (Weighted: ${artsWeighted.toFixed(1)}).`,
    `Recommended: ${recommended.stream}. Alternative: ${alternative.stream}. Confidence: ${confidenceScore}%.`
  ].join(" ");

  return {
    recommendedStream: recommended.stream,
    confidenceScore,
    alternativeStream: alternative.stream,
    reasoning
  };
}

module.exports = { classifyStudent };

