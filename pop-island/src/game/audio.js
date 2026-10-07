/**
 * 音效模块：WebAudio 程序化合成，零外部资源。
 * 所有声音在用户首次交互后解锁 AudioContext。
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = localStorage.getItem('popIslandMuted') === '1';
  }

  /** 用户手势后调用，创建音频上下文 */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
  }

  /** 基础方波/三角波音调 */
  tone(freq, dur, type = 'square', vol = 0.18, slideTo = 0, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /** 短噪声（碰撞/爆炸感） */
  noise(dur, vol = 0.2, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(gain);
    gain.connect(this.master);
    src.start(t0);
  }

  /** 收集音，音高随连击数上升 */
  pop(combo) {
    const base = 420 + Math.min(combo, 9) * 55;
    this.tone(base, 0.09, 'square', 0.16, base * 1.6);
    this.tone(base * 0.5, 0.1, 'triangle', 0.1);
  }

  /** 被海鸥撞到 */
  hit() {
    this.tone(150, 0.22, 'sawtooth', 0.22, 70);
    this.noise(0.16, 0.18);
  }

  /** 升级号角 */
  level() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => this.tone(f, 0.16, 'square', 0.15, 0, i * 0.09));
  }

  /** 吃到道具 */
  power() {
    this.tone(660, 0.08, 'square', 0.15, 900);
    this.tone(990, 0.12, 'square', 0.13, 0, 0.08);
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('popIslandMuted', this.muted ? '1' : '0');
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }
}

export const sound = new SoundManager();
