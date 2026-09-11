import type { NextConfig } from "next";

/**
 * GitHub Pages serves a project site from https://<user>.github.io/<repo>/,
 * so every asset URL needs that prefix. The deploy workflow sets this for us;
 * locally it stays empty and the site runs at "/".
 *
 * Serving from a custom domain or the repo root? Leave it unset.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Emits a plain folder of HTML/CSS/JS into ./out — which is what both the
  // nginx container and GitHub Pages serve. No Node process in production.
  output: "export",

  // Static export has no image optimiser at runtime.
  images: { unoptimized: true },

  // Every route is written as a folder with an index.html, which keeps nginx
  // and GitHub Pages happy without rewrite rules.
  trailingSlash: true,

  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
