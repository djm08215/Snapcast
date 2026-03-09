"use client";

import type { TimelinePoint } from "@/lib/types";
import clsx from "clsx";

interface TimelineProps {
  timeline: TimelinePoint[];
  videoId: string;
}

export function Timeline({ timeline, videoId }: TimelineProps) {
  return (
    <div className="space-y-3">
      {timeline.map((point, i) => (
        <a
          key={i}
          href={`https://www.youtube.com/watch?v=${videoId}&t=${point.offsetSeconds}`}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "group block p-4 rounded-xl border border-gray-100",
            "border-l-4 border-l-blue-200",
            "hover:border-l-blue-500 hover:bg-blue-50/50",
            "transition-all duration-150 cursor-pointer"
          )}
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-blue-700 shrink-0 mt-0.5">
              {point.timestamp}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                {point.title}
              </h3>
              <ul className="mt-1.5 space-y-1">
                {point.keyPoints.map((kp, j) => (
                  <li key={j} className="text-xs text-gray-500 flex gap-1.5">
                    <span className="text-blue-400 shrink-0 mt-0.5">•</span>
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>
            <svg
              className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 mt-1 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </a>
      ))}
    </div>
  );
}
