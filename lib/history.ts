import type { SummaryResult } from "./types";

export interface HistoryItem {
  id: string;
  url: string;
  videoId: string;
  result: SummaryResult;
  savedAt: number; // timestamp ms
}

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

export function saveHistory(item: Omit<HistoryItem, "id" | "savedAt">): HistoryItem[] {
  const history = loadHistory();
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    savedAt: Date.now(),
  };
  // Remove duplicate videoId if exists
  const filtered = history.filter((h) => h.videoId !== item.videoId);
  const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteHistory(id: string): HistoryItem[] {
  const updated = loadHistory().filter((h) => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
