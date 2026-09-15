import type { NextConfig } from "next";

/**
 * The site is served from the root of l4now.com, so there is no base path and
 * no asset prefix. Both were set once, for the <user>.github.io/<repo> URL,
 * and left every /_next/ asset pointing at a repo-name folder that does not
 * exist on the custom domain — the HTML loaded and nothing else did.
 *
 * Moving back to a repo sub-path means setting `basePath` and `assetPrefix`
 * here AND prefixing every hand-written URL (Next does not rewrite those).
 */
const nextConfig: NextConfig = {
  reactCompiler: true,

  // Emits a plain folder of HTML/CSS/JS into ./out, which is what GitHub
  // Pages serves. No Node process in production.
  output: "export",

  // Static export has no image optimiser at runtime.
  images: { unoptimized: true },

  // Every route is written as a folder with an index.html, which keeps
  // GitHub Pages happy without rewrite rules.
  trailingSlash: true,
};

export default nextConfig;
