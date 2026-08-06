/* Reference extract: formatEvidenceProgressPercent(...) from app/src/app.js:8912-8916. */

function formatEvidenceProgressPercent(value, total) {
  if (!total) return "0%";
  const pct = (value / total) * 100;
  return pct > 0 && pct < 10 ? `${pct.toFixed(1)}%` : `${Math.round(pct)}%`;
}
