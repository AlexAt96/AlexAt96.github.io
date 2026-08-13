import type { Metadata } from "next";
import { Suspense } from "react";
import FullShowroomRoute from "../FullShowroomRoute";

export const metadata: Metadata = {
  title: "PoC Tracker — AA Portfolio",
  description: "Explore interactive product experiences for dependencies, gated routes, ownership and demo readiness.",
  alternates: { canonical: "/tracker" },
};

export default function TrackerPage() {
  return <Suspense fallback={null}><FullShowroomRoute collection="tracker" /></Suspense>;
}
