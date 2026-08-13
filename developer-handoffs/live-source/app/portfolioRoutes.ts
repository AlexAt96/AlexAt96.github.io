export type ShowroomId = "compass" | "tracker" | "components" | "methods" | "library";

export const portfolioHref = "/portfolio";

export function showroomHref(id: ShowroomId, scenarioId?: string) {
  const scenario = scenarioId === "dcc-hackathon" ? "?scenario=dcc-hackathon" : "";

  if (id === "compass") return `/compass${scenario}`;
  if (id === "tracker") return `/tracker${scenario}`;
  if (id === "components") return "/components";
  if (id === "methods") return "/methods";
  return "/library";
}
