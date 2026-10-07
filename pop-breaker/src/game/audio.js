// ===== WebAudio 合成音效（零素材）=====
let ctx = null;
let master = null;
let muted = false;

function ensure() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);
}

export function unlockAudio() {
  ensure();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.22;
}

export function isMuted() {
  return muted;
}

function tone(freq, dur, { type = 'square', vol = 1, slide = 0, delay = 0 } = {}) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur, vol = 0.5, delay = 0) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + delay;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(g);
  g.connect(master);
  src.start(t0);
}

export const sfx = {
  paddle() {
    tone(220, 0.05, { type: 'triangle', vol: 0.7 });
  },
  brickHit() {
    tone(160, 0.06, { type: 'square', vol: 0.55, slide: -60 });
  },
  brickPop(combo) {
    const base = 300 + Math.min(combo, 10) * 40;
    tone(base, 0.09, { type: 'square', vol: 0.7, slide: 160 });
    noise(0.07, 0.35);
  },
  brickBreak() {
    tone(240, 0.12, { type: 'sawtooth', vol: 0.5, slide: -140 });
    noise(0.16, 0.5);
    tone(720, 0.08, { type: 'square', vol: 0.35, delay: 0.02 });
  },
  powerup() {
    [520, 660, 880].forEach((f, i) => tone(f, 0.09, { type: 'square', vol: 0.5, delay: i * 0.06 }));
  },
  levelUp() {
    [392, 523, 659, 784].forEach((f, i) => tone(f, 0.12, { type: 'square', vol: 0.55, delay: i * 0.09 }));
    tone(1046, 0.25, { type: 'triangle', vol: 0.6, delay: 0.36 });
  },
  gameOver() {
    [440, 349, 262, 196].forEach((f, i) => tone(f, 0.22, { type: 'sawtooth', vol: 0.5, delay: i * 0.16 }));
  },
  click() {
    tone(700, 0.05, { type: 'square', vol: 0.4 });
  },
  launch() {
    tone(300, 0.08, { type: 'square', vol: 0.6, slide: 240 });
  },
  lost() {
    tone(300, 0.25, { type: 'sawtooth', vol: 0.5, slide: -220 });
  },
};
