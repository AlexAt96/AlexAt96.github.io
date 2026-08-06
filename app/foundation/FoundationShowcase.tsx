"use client";

import { useSearchParams } from "next/navigation";
import FoundationGallery from "./FoundationGallery";

export default function FoundationShowcase() {
  const searchParams = useSearchParams();
  const scenario = searchParams.get("scenario") === "dcc-hackathon" ? "dcc-hackathon" : undefined;

  return <FoundationGallery key={scenario ?? "base"} initialScenario={scenario} />;
}
