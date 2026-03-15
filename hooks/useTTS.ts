"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TtsStatus = "idle" | "playing" | "paused" | "unsupported";

export function useTTS() {
  const [status, setStatus] = useState<TtsStatus>("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.speechSynthesis) {
      setStatus("unsupported");
    }
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setStatus("playing");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    utterance.onpause = () => setStatus("paused");
    utterance.onresume = () => setStatus("playing");

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setStatus("idle");
  }, []);

  return { status, speak, pause, resume, stop };
}
