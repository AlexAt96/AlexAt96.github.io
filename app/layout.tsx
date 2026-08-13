import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import { Suspense } from "react";
import InstallApp from "./InstallApp";
import ShowroomPanController from "./ShowroomPanController";
import "./globals.css";
import "./install-app.css";
import "./portfolio-system.css";
import "./minimal-brand.css";
import "./showroom-classic-chrome.css";
import "./showroom-toolbar-polish.css";
import "./showroom-pan.css";

const sourceSans = localFont({
  src: [
    {
      path: "../public/fonts/SourceSans3VF-Upright.woff2",
      style: "normal",
      weight: "200 900",
    },
    {
      path: "../public/fonts/SourceSans3VF-Italic.woff2",
      style: "italic",
      weight: "200 900",
    },
  ],
  variable: "--font-source-sans",
});

export const viewport: Viewport = {
  themeColor: "#071d33",
};

export async function generateMetadata(): Promise<Metadata> {
  if (process.env.GITHUB_PAGES === "true") {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const previewUrl = `${siteUrl}/og.png`;

    return portfolioMetadata(previewUrl, siteUrl);
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const previewUrl = `${protocol}://${host}/og.png`;

  return portfolioMetadata(previewUrl, `${protocol}://${host}`);
}

function portfolioMetadata(previewUrl: string, siteUrl: string): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    applicationName: "AA Portfolio",
    title: "Alex Atkinson — Principal Technologist",
    description: "Puzzles & vibes: Alex Atkinson's interactive portfolio of architecture systems, reusable interface components, product experiences, and AI-assisted delivery methods.",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "AA Portfolio",
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icons/app-icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/app-icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title: "Alex Atkinson — Principal Technologist",
      description: "Puzzles & vibes. Architecture, product, interfaces and practical AI delivery—clever stuff, done properly.",
      images: [{ url:previewUrl, width:1200, height:630, alt:"Alex Atkinson — Principal Technologist · Puzzles & vibes" }],
    },
    twitter: {
      card:"summary_large_image",
      title:"Alex Atkinson — Principal Technologist",
      description:"Puzzles & vibes. Architecture, product, interfaces and practical AI delivery—clever stuff, done properly.",
      images:[previewUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={sourceSans.variable}>
        <Suspense fallback={null}><ShowroomPanController /></Suspense>
        <div id="aa-showroom-pan-stage">{children}</div>
        <InstallApp />
      </body>
    </html>
  );
}
