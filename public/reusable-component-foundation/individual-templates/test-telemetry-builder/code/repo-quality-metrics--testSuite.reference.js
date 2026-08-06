/* Reference extract: testSuite(...) from server/lib/repo-quality-metrics.js:941-952. */

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
