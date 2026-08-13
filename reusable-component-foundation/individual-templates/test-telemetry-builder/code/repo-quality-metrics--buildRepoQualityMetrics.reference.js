/* Reference extract: buildRepoQualityMetrics(...) from server/lib/repo-quality-metrics.js:181-215. */

function buildRepoQualityMetrics(options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const stats = buildMeasurableStats(options);
  const testTelemetry = buildTestTelemetry(stats);
  stats.testSuccessRatePct = testTelemetry.summary.successRatePct;
  stats.testCoveragePercent = testTelemetry.summary.coveragePercent;
  const categories = buildCategoryScorecard(stats);
  const findings = FINDINGS.map((item) => ({ ...item }));
  const commitQualityHistory = buildCommitQualityHistory(options.commitLimit, { fastHistory: options.fastHistory });
  const overallScore = roundNumber(categories.reduce((total, item) => total + Number(item.score || 0), 0) / Math.max(categories.length, 1), 1);

  return {
    generatedAt,
    source: "whole-repository tracked-file scan plus all-branch commit history and structured code-review findings",
    scoreScale: "1 = high risk, 5 = healthy and production-ready",
    overallScore,
    targetScore: 4.0,
    currentLevel: qualityLevel(overallScore),
    position: "Broad, impressive prototype coverage with serious production-readiness, maintainability, security, and repository-hygiene debt.",
    categories,
    measurableStats: stats,
    targets: buildTrackingTargets(stats),
    findings,
    platformCoordination: buildPlatformCoordination(),
    remediationRoadmap: buildRemediationRoadmap(),
    commitQualityHistory,
    testTelemetry,
    report: {
      markdownPath: path.relative(ROOT_DIR, REVIEW_REPORT_PATH).replace(/\\/g, "/"),
      updateCommand: "npm run review:report",
      systemMapView: "Repo Quality",
      note: "Run the report command after review changes or before merge to refresh the checked-in markdown snapshot. The live system map refreshes these metrics from git when /api/system-map is built.",
    },
  };
}
