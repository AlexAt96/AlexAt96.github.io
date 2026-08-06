"use client";

import { useSearchParams } from "next/navigation";
import PoCTrackerGallery from "./PoCTrackerGallery";

export default function PoCTrackerShowcase() {
  const searchParams = useSearchParams();
  const scenario = searchParams.get("scenario") === "dcc-hackathon" ? "dcc-hackathon" : undefined;

  return <PoCTrackerGallery key={scenario ?? "base"} initialScenario={scenario} />;
}
