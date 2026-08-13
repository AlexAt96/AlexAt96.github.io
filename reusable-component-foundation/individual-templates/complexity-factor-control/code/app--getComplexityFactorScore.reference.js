/* Reference extract: getComplexityFactorScore(...) from app/src/app.js:11089-11091. */

function getComplexityFactorScore(factor, value) {
  return Number(factor.options.find((option) => option.value === value)?.score || 0);
}
