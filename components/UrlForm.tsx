"use client";

import { useState } from "react";
import clsx from "clsx";

interface UrlFormProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
}

export function UrlForm({ onSubmit, disabled }: UrlFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube URL을 입력하세요 (예: https://www.youtube.com/watch?v=...)"
          disabled={disabled}
          className={clsx(
            "flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white",
            "text-sm placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:cursor-not-allowed",
            "shadow-sm"
          )}
        />
        <button
          type="submit"
          disabled={disabled || !url.trim()}
          className={clsx(
            "px-6 py-3 rounded-xl font-medium text-sm",
            "bg-blue-600 text-white",
            "hover:bg-blue-700 active:bg-blue-800",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors shadow-sm whitespace-nowrap"
          )}
        >
          요약하기
        </button>
      </div>
    </form>
  );
}
