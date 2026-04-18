/**
 * Minimal WebAudio synth — no external assets required. Each sound is a short
 * envelope-shaped tone sequence so the UI feels alive without downloads.
 */

let ctx: AudioContext | null = null;
let muted = false;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted() {
  return muted;
}

interface Tone {
  freq: number;
  duration: number;
  delay?: number;
  gain?: number;
  type?: OscillatorType;
  slideTo?: number;
}

function playTones(tones: Tone[]) {
  if (muted) return;
  const ac = ensureCtx();
  if (!ac) return;
  const now = ac.currentTime;
  tones.forEach((t) => {
    const start = now + (t.delay ?? 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = t.type ?? "sine";
    osc.frequency.setValueAtTime(t.freq, start);
    if (t.slideTo !== undefined) {
      osc.frequency.linearRampToValueAtTime(t.slideTo, start + t.duration);
    }
    const peak = t.gain ?? 0.18;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + t.duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + t.duration + 0.02);
  });
}

export const sfx = {
  tap() {
    playTones([{ freq: 520, duration: 0.08, type: "triangle", gain: 0.1 }]);
  },
  hover() {
    playTones([{ freq: 700, duration: 0.05, type: "sine", gain: 0.04 }]);
  },
  wrong() {
    playTones([
      { freq: 220, duration: 0.18, type: "square", gain: 0.1 },
      { freq: 160, duration: 0.22, type: "square", gain: 0.1, delay: 0.08 },
    ]);
  },
  correct() {
    playTones([
      { freq: 523, duration: 0.12, type: "triangle", gain: 0.14 }, // C5
      { freq: 659, duration: 0.12, type: "triangle", gain: 0.14, delay: 0.1 }, // E5
      { freq: 784, duration: 0.18, type: "triangle", gain: 0.16, delay: 0.22 }, // G5
      { freq: 1047, duration: 0.3, type: "triangle", gain: 0.18, delay: 0.36 }, // C6
    ]);
  },
  fanfare() {
    playTones([
      { freq: 523, duration: 0.14, type: "sawtooth", gain: 0.1 },
      { freq: 659, duration: 0.14, type: "sawtooth", gain: 0.1, delay: 0.12 },
      { freq: 784, duration: 0.14, type: "sawtooth", gain: 0.11, delay: 0.24 },
      { freq: 1047, duration: 0.5, type: "triangle", gain: 0.14, delay: 0.36 },
      { freq: 1319, duration: 0.5, type: "triangle", gain: 0.12, delay: 0.36 },
    ]);
  },
  tick() {
    playTones([{ freq: 1200, duration: 0.04, type: "square", gain: 0.04 }]);
  },
  select() {
    playTones([
      { freq: 440, duration: 0.06, type: "triangle", gain: 0.08 },
      { freq: 660, duration: 0.1, type: "triangle", gain: 0.1, delay: 0.04 },
    ]);
  },
};
