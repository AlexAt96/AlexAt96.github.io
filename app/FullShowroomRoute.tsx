"use client";

import { useSearchParams } from "next/navigation";
import Showcase from "./Showcase";

export default function FullShowroomRoute({ collection }: { collection: "compass" | "tracker" }) {
  const searchParams = useSearchParams();
  const scenario = searchParams.get("scenario") === "dcc-hackathon" ? "dcc-hackathon" : undefined;

  return <Showcase key={`${collection}-${scenario ?? "base"}`} initialCollection={collection} initialScenario={scenario} />;
}
