/* Reference extract: buildTestCoverageAreas(...) from server/lib/repo-quality-metrics.js:998-1013. */

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
