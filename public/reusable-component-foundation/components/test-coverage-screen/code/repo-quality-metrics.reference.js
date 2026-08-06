/* Reference extracts from server/lib/repo-quality-metrics.js. See the full source snapshot for surrounding context. */

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

function buildTestCoverageAreas({ scripts, ciText, testFiles }) {
  const scriptText = Object.entries(scripts || {}).map(([name, command]) => `${name} ${command}`).join("\n");
  const fileText = (testFiles || []).join("\n");
  return [
    coverageArea("Repo hygiene", /check-repo-hygiene/.test(scriptText), "tools/check-repo-hygiene.cjs", "Runtime artefacts, fixture boundary, and tracked-file hygiene."),
    coverageArea("Static UI and accessibility smoke", /check-static|smoke-test/.test(scriptText), "tools/check-static.cjs / tools/smoke-test.cjs", "HTML, static app structure, and browser-smoke behaviour."),
    coverageArea("Documentation and report contracts", /check-docs|review:report/.test(scriptText), "tools/check-docs.cjs / tools/generate-code-review-report.cjs", "Docs source-of-truth and generated report checks."),
    coverageArea("System Map payload and UI", /check-system-map/.test(scriptText), "tools/check-system-map.cjs", "System Map schema, lineage, report tabs, and live payload assertions."),
    coverageArea("Consistency and UX guardrails", /check-consistency|ux-wcag-audit/.test(scriptText + fileText), "tools/check-consistency.cjs", "Consistency report, design-system signals, and UI guardrails."),
    coverageArea("Server/API smoke", /run-server-smoke|smoke:server|test:tier3/.test(scriptText), "tools/run-server-smoke.cjs", "Running server routes, persistence, and API smoke."),
    coverageArea("Platform contracts", /platform:check/.test(scriptText) && ciText.includes("npm run platform:check"), "platform/tools/check-platform.cjs", "Platform-foundation API/data/auth contracts."),
    coverageArea("Deployment contracts", /deployment:check/.test(scriptText) && ciText.includes("npm run deployment:check"), "tools/check-deployment-contract.cjs", "Deployment data model and operational contract."),
    coverageArea("Integration providers", /integration/.test(scriptText) && /\.test\.mjs/.test(fileText), "tests/*.test.mjs", "Jira / Azure DevOps provider foundation and stub tests."),
    coverageArea("Databricks runner", /runner:check/.test(scriptText), "databricks-discovery-runner", "Discovery runner package validation."),
  ];
}

function coverageArea(area, covered, evidence, scope) {
  return { area, covered: Boolean(covered), evidence, scope };
}

function testSuite(name, scriptName, command, status, coverage) {
  const normalisedStatus = status || (command ? "Configured" : "not-configured");
  return {
    name,
    script: scriptName,
    command: command || "",
    status: normalisedStatus,
    outcome: testOutcome(normalisedStatus),
    coverage,
    cadence: suiteCadence(scriptName),
  };
}
