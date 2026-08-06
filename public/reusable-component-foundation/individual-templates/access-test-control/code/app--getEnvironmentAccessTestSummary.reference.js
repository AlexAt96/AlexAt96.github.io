/* Reference extract: getEnvironmentAccessTestSummary(...) from app/src/app.js:8370-8377. */

function getEnvironmentAccessTestSummary(access = {}) {
  const status = String(access.access_test_status || "").trim();
  return {
    label: status || "Not tested",
    scheme: status === "Working" ? "success" : status === "Issue" ? "danger" : "neutral",
    meta: access.access_tested_at ? `${normaliseDateInputValue(access.access_tested_at)}${access.access_tested_by ? ` / ${access.access_tested_by}` : ""}` : "",
  };
}
