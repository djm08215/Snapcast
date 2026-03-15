"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TtsStatus = "idle" | "playing" | "paused" | "unsupported";
export type TtsRate = 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

// Heuristic: known male Korean voice name fragments
const MALE_NAME_HINTS = ["injoon", "인준", "male", "남성", "man", "seoyoon", "서윤"];

export function guessGender(voice: SpeechSynthesisVoice): "male" | "female" | "unknown" {
  const lower = voice.name.toLowerCase();
  if (MALE_NAME_HINTS.some((h) => lower.includes(h))) return "male";
  return "female"; // most Korean voices default to female
}

export function useTTS() {
  const [status, setStatus] = useState<TtsStatus>("idle");
  const [rate, setRateState] = useState<TtsRate>(1.0);
  const [currentSection, setCurrentSection] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoiceState] = useState<SpeechSynthesisVoice | null>(null);

  const sectionsRef = useRef<string[]>([]);
  const currentSectionRef = useRef(0);
  const rateRef = useRef<TtsRate>(1.0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const cancelledRef = useRef(false);

  // Load Korean voices
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) { setStatus("unsupported"); return; }

    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const korean = all.filter((v) => v.lang.startsWith("ko"));
      if (korean.length > 0) {
        setVoices(korean);
        // keep current selection valid, or default to first
        setSelectedVoiceState((prev) => prev ?? korean[0]);
        voiceRef.current = voiceRef.current ?? korean[0];
      }
    };

    load();
    window.speechSynthesis.onvoiceschanged = load;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakSection = useCallback((index: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (index >= sectionsRef.current.length) {
      setStatus("idle");
      setCurrentSection(0);
      currentSectionRef.current = 0;
      return;
    }

    cancelledRef.current = false;
    currentSectionRef.current = index;
    setCurrentSection(index);

    const utterance = new SpeechSynthesisUtterance(sectionsRef.current[index]);
    utterance.lang = "ko-KR";
    utterance.rate = rateRef.current;
    if (voiceRef.current) utterance.voice = voiceRef.current;

    utterance.onstart = () => setStatus("playing");
    utterance.onpause = () => setStatus("paused");
    utterance.onresume = () => setStatus("playing");
    utterance.onerror = () => { if (!cancelledRef.current) setStatus("idle"); };
    utterance.onend = () => { if (!cancelledRef.current) speakSection(index + 1); };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback((sections: string[], startIndex = 0) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    cancelledRef.current = true;
    window.speechSynthesis.cancel();
    sectionsRef.current = sections;
    setTimeout(() => speakSection(startIndex), 50);
  }, [speakSection]);

  const jumpTo = useCallback((index: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    cancelledRef.current = true;
    window.speechSynthesis.cancel();
    setTimeout(() => speakSection(index), 50);
  }, [speakSection]);

  const prev = useCallback(() => {
    jumpTo(Math.max(0, currentSectionRef.current - 1));
  }, [jumpTo]);

  const next = useCallback(() => {
    const target = currentSectionRef.current + 1;
    if (target < sectionsRef.current.length) jumpTo(target);
  }, [jumpTo]);

  const pause = useCallback(() => { window.speechSynthesis?.pause(); }, []);
  const resume = useCallback(() => { window.speechSynthesis?.resume(); }, []);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    window.speechSynthesis?.cancel();
    setStatus("idle");
    setCurrentSection(0);
    currentSectionRef.current = 0;
  }, []);

  const setRate = useCallback((newRate: TtsRate) => {
    rateRef.current = newRate;
    setRateState(newRate);
    if (
      typeof window !== "undefined" &&
      window.speechSynthesis &&
      (window.speechSynthesis.speaking || window.speechSynthesis.paused)
    ) {
      cancelledRef.current = true;
      window.speechSynthesis.cancel();
      setTimeout(() => speakSection(currentSectionRef.current), 50);
    }
  }, [speakSection]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    voiceRef.current = voice;
    setSelectedVoiceState(voice);
    if (
      typeof window !== "undefined" &&
      window.speechSynthesis &&
      (window.speechSynthesis.speaking || window.speechSynthesis.paused)
    ) {
      cancelledRef.current = true;
      window.speechSynthesis.cancel();
      setTimeout(() => speakSection(currentSectionRef.current), 50);
    }
  }, [speakSection]);

  return {
    status,
    rate,
    currentSection,
    voices,
    selectedVoice,
    speak,
    jumpTo,
    prev,
    next,
    pause,
    resume,
    stop,
    setRate,
    setVoice,
  };
}
