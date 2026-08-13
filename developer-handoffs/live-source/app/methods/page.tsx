import type { Metadata } from "next";
import AgentUseCases from "../AgentUseCases";

export const metadata: Metadata = {
  title: "Agent Methods — AA Portfolio",
  description:
    "Explore 30 practical, evidence-backed methods for governing AI-assisted delivery across three delivery portfolios.",
  alternates: {
    canonical: "/methods",
  },
  openGraph: {
    title: "Agent Methods — AA Portfolio",
    description:
      "Explore 30 practical methods for governing AI-assisted delivery from planning through operation and recovery.",
  },
  twitter: {
    title: "Agent Methods — AA Portfolio",
    description:
      "Explore 30 practical methods for governing AI-assisted delivery from planning through operation and recovery.",
  },
};

export default function MethodsPage() {
  return <AgentUseCases />;
}
