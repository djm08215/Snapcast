import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const binDir = join(__dirname, "..", "bin");
const binPath = join(binDir, "yt-dlp-linux");

if (!existsSync(binDir)) mkdirSync(binDir, { recursive: true });

if (existsSync(binPath)) {
  console.log("yt-dlp already exists, skipping.");
  process.exit(0);
}

const URL =
  "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";

console.log("Downloading yt-dlp...");
try {
  execSync(`curl -L -o "${binPath}" "${URL}"`, { stdio: "inherit" });
  execSync(`chmod +x "${binPath}"`);
  console.log("yt-dlp ready.");
} catch (e) {
  console.error("Download failed:", e.message);
  process.exit(1);
}
