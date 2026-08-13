import type { Metadata } from "next";
import PortfolioHome from "../PortfolioHome";

export const metadata: Metadata = {
  title: "Alex Atkinson — Principal Technologist",
  description:
    "Alex Atkinson's portfolio of technology strategy, systems thinking, product design, reusable interfaces, and practical AI delivery.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return <PortfolioHome />;
}
