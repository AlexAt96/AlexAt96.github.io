"use client";

import { useSearchParams } from "next/navigation";
import Showcase from "./Showcase";
import PortfolioHome from "./PortfolioHome";

export default function HomeShowcase() {
  const searchParams = useSearchParams();
  const requestedCollection = searchParams.get("system");
  const scenario = searchParams.get("scenario") === "dcc-hackathon" ? "dcc-hackathon" : undefined;
  if (!requestedCollection && !scenario) return <PortfolioHome />;

  const collection = requestedCollection === "tracker" ? "tracker" : "compass";

  return <Showcase key={`${collection}-${scenario ?? "base"}`} initialCollection={collection} initialScenario={scenario} />;
}
