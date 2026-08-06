import type { Metadata } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import "./globals.css";

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
    title: "AA Portfolio — Architecture, UI & AI Delivery",
    description: "Alex Atkinson's interactive portfolio of architecture systems, reusable interface components, product experiences, and AI-assisted delivery methods.",
    openGraph: {
      title: "AA Portfolio — Clever stuff. Done properly.",
      description: "Explore architecture patterns, interface components, product experiences, and practical AI-assisted delivery methods.",
      images: [{ url:previewUrl, width:1200, height:630, alt:"AA Portfolio interactive systems and interface work" }],
    },
    twitter: {
      card:"summary_large_image",
      title:"AA Portfolio — Clever stuff. Done properly.",
      description:"Explore architecture patterns, interface components, product experiences, and practical AI-assisted delivery methods.",
      images:[previewUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={sourceSans.variable}>{children}</body>
    </html>
  );
}
