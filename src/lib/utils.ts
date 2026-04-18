import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function pick<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new RangeError("pick() requires a non-empty array");
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function weightedPick<T>(arr: T[], weightFn: (t: T) => number): T {
  if (arr.length === 0) {
    throw new RangeError("weightedPick() requires a non-empty array");
  }
  const weights = arr.map((item) => {
    const value = weightFn(item);
    return Number.isFinite(value) && value > 0 ? value : 0;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return pick(arr);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function speakCountryName(name: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(name);
    u.rate = 0.95;
    u.pitch = 1;
    synth.speak(u);
  } catch {
    /* noop */
  }
}
