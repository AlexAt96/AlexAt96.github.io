import type { Metadata } from "next";
import { Suspense } from "react";
import FullShowroomRoute from "../FullShowroomRoute";

export const metadata: Metadata = {
  title: "Migration Compass — AA Portfolio",
  description: "Explore evidence-led architecture patterns for discovery, review, system mapping and migration planning.",
  alternates: { canonical: "/compass" },
};

export default function CompassPage() {
  return <Suspense fallback={null}><FullShowroomRoute collection="compass" /></Suspense>;
}
