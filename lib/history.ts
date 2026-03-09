import type { SummaryResult } from "./types";

export interface HistoryItem {
  id: string;
  url: string;
  videoId: string;
  result: SummaryResult;
  savedAt: number;
}

// ─── localStorage ────────────────────────────────────────────────

const STORAGE_KEY = "podcast-shortener-history";
const MAX_ITEMS = 20;

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: HistoryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function deleteHistory(id: string): HistoryItem[] {
  const updated = loadHistory().filter((h) => h.id !== id);
  writeLocal(updated);
  // Also delete from Supabase (fire-and-forget)
  import("./supabase").then(({ supabase }) =>
    supabase.from("summaries").delete().eq("id", id)
  );
  return updated;
}

export function clearHistory(): void {
  const items = loadHistory();
  localStorage.removeItem(STORAGE_KEY);
  // Delete all from Supabase (fire-and-forget)
  import("./supabase").then(({ supabase }) => {
    const ids = items.map((i) => i.id);
    if (ids.length > 0)
      supabase.from("summaries").delete().in("id", ids);
  });
}

// ─── Save (localStorage + Supabase) ──────────────────────────────

export async function saveHistory(
  item: Omit<HistoryItem, "id" | "savedAt">
): Promise<HistoryItem[]> {
  const history = loadHistory();
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    savedAt: Date.now(),
  };

  // Remove duplicate videoId
  const filtered = history.filter((h) => h.videoId !== item.videoId);
  const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
  writeLocal(updated);

  // Persist to Supabase (fire-and-forget, don't block UI)
  try {
    const { supabase } = await import("./supabase");
    await supabase.from("summaries").upsert(
      {
        id: newItem.id,
        video_id: newItem.videoId,
        url: newItem.url,
        result: newItem.result,
        saved_at: new Date(newItem.savedAt).toISOString(),
      },
      { onConflict: "video_id" }
    );
  } catch {
    // Supabase 실패해도 localStorage는 저장됨
  }

  return updated;
}
