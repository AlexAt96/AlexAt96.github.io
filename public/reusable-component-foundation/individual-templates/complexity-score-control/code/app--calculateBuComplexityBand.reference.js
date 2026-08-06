/* Reference extract: calculateBuComplexityBand(...) from app/src/app.js:11081-11083. */

function calculateBuComplexityBand(score) {
  return BU_COMPLEXITY_BANDS.find((band) => score >= band.min && score <= band.max) || BU_COMPLEXITY_BANDS[BU_COMPLEXITY_BANDS.length - 1];
}
