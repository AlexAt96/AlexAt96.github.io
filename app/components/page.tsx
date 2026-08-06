import type { Metadata } from "next";
import Showcase from "../Showcase";

export const metadata: Metadata = {
  title: "Individual Components — AA Portfolio",
  description:
    "Explore reusable UI components for actions, feedback, navigation, forms, data, files, visualisation, and guided flows.",
  alternates: {
    canonical: "/components",
  },
  openGraph: {
    title: "Individual Components — AA Portfolio",
    description:
      "Explore reusable, interactive UI components organised into a clear, practical catalogue.",
  },
  twitter: {
    title: "Individual Components — AA Portfolio",
    description:
      "Explore reusable, interactive UI components organised into a clear, practical catalogue.",
  },
};

export default function IndividualComponentsPage() {
  return <Showcase initialCollection="generic" />;
}
