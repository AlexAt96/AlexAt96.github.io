import type { Metadata } from "next";
import { Suspense } from "react";
import FoundationShowcase from "./FoundationShowcase";

export const metadata: Metadata = {
  title: "Compass Pattern Library — AA Portfolio",
  description:
    "Explore 26 polished, interactive Compass UI patterns for planning, collection, analysis, evidence and reporting.",
  alternates: {
    canonical: "/foundation",
  },
  openGraph: {
    title: "Compass Pattern Library — AA Portfolio",
    description:
      "Explore 26 polished, interactive patterns for planning, collection, analysis, evidence and reporting.",
  },
  twitter: {
    title: "Compass Pattern Library — AA Portfolio",
    description:
      "Explore 26 polished, interactive patterns for planning, collection, analysis, evidence and reporting.",
  },
};

export default function FoundationPage() {
  return (
    <Suspense fallback={null}>
      <FoundationShowcase />
    </Suspense>
  );
}
