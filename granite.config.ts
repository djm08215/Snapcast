import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "snapcast",
  brand: {
    displayName: "Snapcast",
    primaryColor: "#3182F6",
    icon: "https://snapcast.kr/snapcast.png",
  },
  web: {
    host: "localhost",
    port: 3000,
    commands: {
      dev: "next dev",
      build: "cross-env TOSS_BUILD=1 NEXT_PUBLIC_API_BASE=https://snapcast.kr next build",
    },
  },
  outdir: "out",
  permissions: [],
});
