import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "snapcast",
  brand: {
    displayName: "Snapcast",
    primaryColor: "#3182F6",
    icon: "https://snapcast-gilt.vercel.app/snapcast.png",
  },
  web: {
    host: "localhost",
    port: 3000,
    commands: {
      dev: "next dev",
      build: "TOSS_BUILD=1 next build",
    },
  },
  permissions: [],
});
