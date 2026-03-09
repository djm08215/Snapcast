/** @type {import('next').NextConfig} */
const isTossBuild = process.env.TOSS_BUILD === "1";

const nextConfig = {
  // Static export for Toss .ait bundle; normal build for Vercel
  ...(isTossBuild ? { output: "export", distDir: "out" } : {}),
  images: {
    // Static export requires unoptimized images
    ...(isTossBuild ? { unoptimized: true } : {}),
  },
  transpilePackages: ["@toss/tds-mobile", "@apps-in-toss/web-bridge"],
  compiler: {
    emotion: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas", "jsdom"];
    }
    return config;
  },
};

export default nextConfig;
