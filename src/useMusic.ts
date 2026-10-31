import { useEffect, useMemo, useState } from "react";

interface Engine {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
}

const EIGHTH = 60 / 66 / 2;
const CHORDS = [
  [261.63, 329.63, 392, 523.25, 659.25],
  [220, 261.63, 329.63, 440, 523.25],
  [174.61, 220, 261.63, 349.23, 440],
  [196, 246.94, 293.66, 392, 493.88],
];
const PATTERN = [1, 2, 3, 4, 3, 2, 3, 2];

class SynthMusic implements Engine {
  private ac?: AudioContext;
  private master?: GainNode;
  private timer = 0;
  private step = 0;
  private nextT = 0;
  private on = false;

  private init() {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const a: AudioContext = new AC();
    const m = a.createGain();
    m.gain.value = 0;
    const delay = a.createDelay();
    delay.delayTime.value = 0.36;
    const fb = a.createGain();
    fb.gain.value = 0.4;
    const lp = a.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    m.connect(a.destination);
    m.connect(delay);
    delay.connect(lp);
    lp.connect(fb);
    fb.connect(delay);
    lp.connect(a.destination);
    this.ac = a;
    this.master = m;
  }

  private note(f: number, t: number, d: number, v: number) {
    const a = this.ac!;
    const voices: [number, OscillatorType, number][] = [[f, "triangle", v], [f * 2, "sine", v * 0.3]];
    voices.forEach(([freq, type, vol]) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0008, t + d);
      o.connect(g);
      g.connect(this.master!);
      o.start(t);
      o.stop(t + d + 0.05);
    });
  }

  private sched = () => {
    const a = this.ac!;
    while (this.nextT < a.currentTime + 0.6) {
      const chord = CHORDS[Math.floor(this.step / 8) % 4];
      const i = this.step % 8;
      if (i === 0) this.note(chord[0] / 2, this.nextT, 2.6, 0.45);
      this.note(chord[PATTERN[i]], this.nextT, 1.8, 0.32);
      this.step++;
      this.nextT += EIGHTH;
    }
  };

  start() {
    this.on = true;
    try {
      if (!this.ac) this.init();
      const a = this.ac!;
      void a.resume();
      this.nextT = a.currentTime + 0.1;
      clearInterval(this.timer);
      this.timer = window.setInterval(this.sched, 150);
      this.master!.gain.cancelScheduledValues(a.currentTime);
      this.master!.gain.setTargetAtTime(0.33, a.currentTime, 0.9);
    } catch {
      /* audio not available */
    }
  }

  stop() {
    this.on = false;
    const a = this.ac;
    if (!a) return;
    this.master!.gain.setTargetAtTime(0, a.currentTime, 0.3);
    setTimeout(() => {
      if (!this.on) {
        clearInterval(this.timer);
        void a.suspend();
      }
    }, 900);
  }

  pause() { void this.ac?.suspend(); }
  resume() { void this.ac?.resume(); }
}

class FileMusic implements Engine {
  private el: HTMLAudioElement;
  constructor(url: string) {
    this.el = new Audio(url);
    this.el.loop = true;
  }
  start() { void this.el.play().catch(() => {}); }
  stop() { this.el.pause(); }
  pause() { this.el.pause(); }
  resume() { void this.el.play().catch(() => {}); }
}

export function useMusic(musicUrl = "") {
  const [on, setOn] = useState(false);
  const engine = useMemo<Engine>(() => (musicUrl ? new FileMusic(musicUrl) : new SynthMusic()), [musicUrl]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) engine.pause();
      else if (on) engine.resume();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [engine, on]);

  const play = () => { engine.start(); setOn(true); };
  const toggle = () => {
    if (on) { engine.stop(); setOn(false); }
    else play();
  };
  return { on, play, toggle };
}
