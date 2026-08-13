import type { Metadata } from "next";
import LibraryCatalogue from "./LibraryCatalogue";

export const metadata: Metadata = {
  title: "Component & Pattern Library — AA Portfolio",
  description:
    "Browse every implementation-level component and the reusable patterns behind Migration Compass, PoC Tracker and Agent Methods.",
  alternates: {
    canonical: "/library",
  },
  openGraph: {
    title: "Component & Pattern Library — AA Portfolio",
    description:
      "One searchable catalogue for components, product patterns and AI-assisted delivery methods.",
  },
  twitter: {
    title: "Component & Pattern Library — AA Portfolio",
    description:
      "One searchable catalogue for components, product patterns and AI-assisted delivery methods.",
  },
};

export default function LibraryPage() {
  return <LibraryCatalogue />;
}
