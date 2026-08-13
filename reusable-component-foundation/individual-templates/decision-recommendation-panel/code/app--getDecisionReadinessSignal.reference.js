/* Reference extract: getDecisionReadinessSignal(...) from app/src/app.js:27141-27150. */

function getDecisionReadinessSignal(model = {}, contribution = {}) {
  const confidence = getDecisionReadinessConfidence(model, contribution);
  const appetite = getDecisionAppetiteSignal(model);
  return {
    confidence,
    confidenceLabel: Number.isFinite(confidence) ? `${formatNumber(confidence)}%` : "Not captured",
    confidenceTone: !Number.isFinite(confidence) ? "unknown" : confidence >= 70 ? "high" : confidence >= 45 ? "medium" : "low",
    appetite,
  };
}
