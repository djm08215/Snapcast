import type { TranscriptSegment } from "./types";

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/\s]+)/,
    /youtube\.com\/embed\/([^?/\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function transcriptToText(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => `[${formatTime(s.offset / 1000)}] ${s.text}`)
    .join(" ");
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Parses YouTube JSON3 caption format into TranscriptSegment[]
export function parseJson3(json: unknown): TranscriptSegment[] {
  const data = json as {
    events?: Array<{
      tStartMs?: number;
      dDurationMs?: number;
      segs?: Array<{ utf8?: string }>;
    }>;
  };
  if (!data?.events) return [];
  const segments: TranscriptSegment[] = [];
  for (const event of data.events) {
    if (event.tStartMs == null || !event.segs) continue;
    const text = event.segs
      .map((s) => s.utf8 ?? "")
      .join("")
      .replace(/\n/g, " ")
      .trim();
    if (!text) continue;
    segments.push({ offset: event.tStartMs, duration: event.dDurationMs ?? 0, text });
  }
  return segments;
}

export function chunkTranscriptByTime(
  segments: TranscriptSegment[],
  windowMinutes = 10
): TranscriptSegment[][] {
  const windowMs = windowMinutes * 60 * 1000;
  const chunks: TranscriptSegment[][] = [];
  let current: TranscriptSegment[] = [];
  let windowStart = 0;

  for (const seg of segments) {
    if (seg.offset >= windowStart + windowMs) {
      if (current.length) chunks.push(current);
      current = [];
      windowStart = seg.offset;
    }
    current.push(seg);
  }
  if (current.length) chunks.push(current);
  return chunks;
}
