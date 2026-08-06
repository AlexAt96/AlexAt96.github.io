import type { Metadata } from "next";
import { Suspense } from "react";
import HomeShowcase from "./HomeShowcase";

export const metadata: Metadata = {
  title: "Alex Atkinson — Principal Technologist",
  description:
    "Alex Atkinson's portfolio of technology strategy, systems thinking, product design, reusable interfaces, and practical AI delivery.",
};

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeShowcase />
    </Suspense>
  );
}
