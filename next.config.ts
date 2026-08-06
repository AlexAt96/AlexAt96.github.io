import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: process.env.PAGES_BASE_PATH,
        trailingSlash: true,
        // The standard Next.js checker cannot resolve the Cloudflare Worker
        // runtime types used by the separate vinext deployment target.
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
};

export default nextConfig;
