import { createWriteStream, existsSync, mkdirSync, chmodSync } from "fs";
import { get } from "https";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const binDir = join(__dirname, "..", "bin");
const binPath = join(binDir, "yt-dlp-linux");

if (!existsSync(binDir)) mkdirSync(binDir, { recursive: true });

if (existsSync(binPath)) {
  console.log("yt-dlp already exists, skipping download.");
  process.exit(0);
}

const URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux";

function download(url, dest) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const file = createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        chmodSync(dest, 0o755);
        console.log("yt-dlp downloaded successfully.");
        resolve();
      });
    }).on("error", reject);
  });
}

console.log("Downloading yt-dlp Linux binary...");
download(URL, binPath).catch((e) => {
  console.error("Failed to download yt-dlp:", e.message);
  process.exit(1);
});
