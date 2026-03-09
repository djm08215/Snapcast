export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

export interface TimelinePoint {
  timestamp: string;
  offsetSeconds: number;
  title: string;
  keyPoints: string[];
}

export interface SummaryResult {
  overallSummary: string;
  timeline: TimelinePoint[];
  videoTitle?: string;
}
