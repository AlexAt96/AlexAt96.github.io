/* Reference extract: getBuTechReportTabHref(...) from app/src/app.js:24770-24778. */

function getBuTechReportTabHref(bu, tab) {
  return appendDocumentViewParams(documentUrl("outputs", "bu-tech-report", bu.id), {
    readonly: queryParam("readonly") || "true",
    fullReport: queryParam("fullReport") || "true",
    returnBu: queryParam("returnBu") || bu.id,
    returnTo: queryParam("returnTo") || documentUrl("outputs", "per-bu-outputs", bu.id),
    tab,
  });
}
