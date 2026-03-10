import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const isTossBuild = process.env.TOSS_BUILD === "1";

const nextConfig = {
  // Static export for Toss .ait bundle; normal build for Vercel
  ...(isTossBuild ? { output: "export", distDir: "out" } : {}),
  images: {
    // Static export requires unoptimized images
    ...(isTossBuild ? { unoptimized: true } : {}),
  },
  transpilePackages: isTossBuild ? ["@toss/tds-mobile", "@apps-in-toss/web-bridge"] : [],
  compiler: {
    emotion: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      "/api/pdf": ["./public/fonts/**"],
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas", "jsdom"];
      // Force fontkit CJS build which registers formats (ESM build doesn't)
      config.resolve.alias["fontkit"] = require.resolve("fontkit");
    }
    return config;
  },
};

export default nextConfig;
