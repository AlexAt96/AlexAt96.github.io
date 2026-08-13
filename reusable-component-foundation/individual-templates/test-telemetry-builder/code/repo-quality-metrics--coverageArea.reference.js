/* Reference extract: coverageArea(...) from server/lib/repo-quality-metrics.js:1015-1017. */

function coverageArea(area, covered, evidence, scope) {
  return { area, covered: Boolean(covered), evidence, scope };
}
