import { execSync } from "child_process";

process.env.TOSS_BUILD = "1";
process.env.NEXT_PUBLIC_API_BASE = "https://snapcast-gilt.vercel.app";

execSync("next build", { stdio: "inherit" });
