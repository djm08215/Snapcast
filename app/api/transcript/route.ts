export const maxDuration = 60;

import { execFile } from "child_process";
import { promisify } from "util";
import { readFile, unlink, mkdir, readdir, copyFile, chmod } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { extractVideoId } from "@/lib/transcript";
import type { TranscriptSegment } from "@/lib/types";

const execFileAsync = promisify(execFile);

// On Linux (Vercel), copy the bundled binary to /tmp and make executable.
// On Windows (local dev), use the system yt-dlp via PATH or YTDLP_PATH env.
async function resolveYtdlp(): Promise<string> {
  if (process.env.YTDLP_PATH) return process.env.YTDLP_PATH;
  if (process.platform !== "linux") return "yt-dlp";

  const tmpBin = "/tmp/yt-dlp";
  if (!existsSync(tmpBin)) {
    const bundled = join(process.cwd(), "bin", "yt-dlp-linux");
    await copyFile(bundled, tmpBin);
    await chmod(tmpBin, 0o755);
  }
  return tmpBin;
}

interface Json3Event {
  tStartMs: number;
  dDurationMs?: number;
  segs?: { utf8: string }[];
}

function parseJson3(json3: { events?: Json3Event[] }): TranscriptSegment[] {
  return (json3.events ?? [])
    .filter((e) => e.segs && e.segs.length > 0)
    .map((e) => ({
      text: e.segs!.map((s) => s.utf8).join("").trim(),
      offset: e.tStartMs,
      duration: e.dDurationMs ?? 0,
    }))
    .filter((s) => s.text.length > 0);
}

async function fetchWithYtdlp(videoId: string, tmpDir: string): Promise<TranscriptSegment[]> {
  const ytdlp = await resolveYtdlp();
  const outputTemplate = join(tmpDir, `%(id)s`);

  // Clean up existing files for this video
  const existing = await readdir(tmpDir).catch(() => [] as string[]);
  for (const f of existing.filter((n) => n.startsWith(videoId))) {
    await unlink(join(tmpDir, f)).catch(() => {});
  }

  await execFileAsync(
    ytdlp,
    [
      "--write-auto-sub",
      "--skip-download",
      "--sub-format", "json3",
      "--extractor-retries", "3",
      "--sleep-requests", "1",
      "-o", outputTemplate,
      `https://www.youtube.com/watch?v=${videoId}`,
    ],
    { timeout: 60000 }
  );

  const files = (await readdir(tmpDir)).filter(
    (n) => n.startsWith(videoId) && n.endsWith(".json3")
  );
  if (files.length === 0) return [];

  const content = await readFile(join(tmpDir, files[0]), "utf-8");
  for (const f of files) await unlink(join(tmpDir, f)).catch(() => {});

  return parseJson3(JSON.parse(content));
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return Response.json({ error: "URL이 필요합니다." }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return Response.json(
        { error: "유효하지 않은 YouTube URL입니다." },
        { status: 400 }
      );
    }

    const tmpDir = join(tmpdir(), "podcast-shortener");
    if (!existsSync(tmpDir)) await mkdir(tmpDir, { recursive: true });

    const segments = await fetchWithYtdlp(videoId, tmpDir);

    if (segments.length === 0) {
      return Response.json(
        { error: "이 영상에는 자막(트랜스크립트)이 없습니다. 자막이 활성화된 영상을 시도해주세요." },
        { status: 500 }
      );
    }

    return Response.json({ segments, videoId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "트랜스크립트를 가져올 수 없습니다.";
    console.error("transcript error:", message);

    const isRateLimit = message.includes("429");
    const isNoSub = message.includes("subtitles") || message.includes("Transcript");

    return Response.json(
      {
        error: isRateLimit
          ? "YouTube 요청 한도 초과. 잠시 후 다시 시도해주세요."
          : isNoSub
          ? "이 영상에는 자막(트랜스크립트)이 없습니다."
          : message,
      },
      { status: 500 }
    );
  }
}
