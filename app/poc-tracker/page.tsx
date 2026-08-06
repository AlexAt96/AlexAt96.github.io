import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import PoCTrackerShowcase from "./PoCTrackerShowcase";

export async function generateMetadata(): Promise<Metadata> {
  if (process.env.GITHUB_PAGES === "true") {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
    return pageMetadata(`${siteUrl}/og.png`);
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return pageMetadata(imageUrl);
}

function pageMetadata(imageUrl: string): Metadata {
  return {
    title: "PoC Tracker Showcase — AA Portfolio",
    description: "Explore seven interactive product experiences for programme insight, planning, workflow and architecture.",
    openGraph: {
      title: "PoC Tracker — AA Portfolio",
      description: "Explore dashboards, delivery planning, guided workflows, earned value and architecture in one focused showcase.",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "AA Portfolio PoC Tracker interactive showcase" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "PoC Tracker — AA Portfolio",
      description: "Explore dashboards, delivery planning, guided workflows, earned value and architecture in one focused showcase.",
      images: [imageUrl],
    },
  };
}

export default function PoCTrackerPage() {
  return (
    <Suspense fallback={null}>
      <PoCTrackerShowcase />
    </Suspense>
  );
}
