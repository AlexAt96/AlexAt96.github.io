"use client";

import { useSearchParams } from "next/navigation";
import Showcase from "./Showcase";
import PortfolioHome from "./PortfolioHome";

export default function HomeShowcase() {
  const searchParams = useSearchParams();
  const requestedCollection = searchParams.get("system");
  const scenario = searchParams.get("scenario") === "dcc-hackathon" ? "dcc-hackathon" : undefined;
  if (requestedCollection !== "compass" && requestedCollection !== "tracker") return <PortfolioHome />;

  return <Showcase key={`${requestedCollection}-${scenario ?? "base"}`} initialCollection={requestedCollection} initialScenario={scenario} />;
}
