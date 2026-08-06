/* Reference extract: getPhaseDashboardOwnerFilter(...) from app/src/app.js:3360-3367. */

function getPhaseDashboardOwnerFilter(ownerFilters = []) {
  const requested = queryParam("owner");
  if (requested === "all") return "all";
  if (requested) return ownerFilters.some((filter) => filter.key === requested) ? requested : "all";
  const roleOwnerKeys = getOwnerFilterKeysForRole(getActiveRoleId());
  const matchingFilter = roleOwnerKeys.map((key) => ownerFilters.find((filter) => filter.key === key && filter.count > 0)).find(Boolean);
  return matchingFilter?.key || "all";
}
