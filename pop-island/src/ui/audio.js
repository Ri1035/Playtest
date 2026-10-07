/**
 * 音效：WebAudio 程序化合成，无需任何音频文件。
 * 采用方波 + 快速衰减模拟老式游戏机的清脆音效。
 */

let audioCtx = null;
let enabled = true;

function getCtx() {
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  // 浏览器策略下音频可能处于 suspended，点击时需恢复。
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function setSound(on) {
  enabled = on;
}

export function playTone(kind) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  const presets = {
    build: { freq: 440, end: 880, duration: 0.12, type: 'square' },
    collect: { freq: 660, end: 990, duration: 0.09, type: 'square' },
    error: { freq: 220, end: 160, duration: 0.16, type: 'sawtooth' },
    pop: { freq: 880, end: 1320, duration: 0.07, type: 'triangle' },
  };
  const preset = presets[kind] || presets.collect;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = preset.type;
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(preset.freq, now);
  osc.frequency.exponentialRampToValueAtTime(preset.end, now + preset.duration);
  // 指数衰减到接近零，避免爆音。
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + preset.duration + 0.02);
}