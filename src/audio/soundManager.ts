class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ambientGain) {
      this.ambientGain.gain.value = this.isMuted ? 0 : 0.08;
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Tiếng cụng ly bia "Keng!" trong trẻo, chân thực
  public playGlassClink() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // First high tone
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2450, t);
    osc1.frequency.exponentialRampToValueAtTime(2200, t + 0.35);

    gain1.gain.setValueAtTime(0.4, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    // Second resonant harmonic
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(3280, t);
    osc2.frequency.exponentialRampToValueAtTime(3100, t + 0.4);

    gain2.gain.setValueAtTime(0.25, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + 0.55);
    osc2.start(t);
    osc2.stop(t + 0.65);
  }

  // Tiếng khui bia bật nắp "Póc - Xèèè"
  public playBeerCrack() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Pop sound (fast frequency drop)
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = 'triangle';
    popOsc.frequency.setValueAtTime(800, t);
    popOsc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

    popGain.gain.setValueAtTime(0.5, t);
    popGain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

    popOsc.connect(popGain);
    popGain.connect(this.ctx.destination);
    popOsc.start(t);
    popOsc.stop(t + 0.09);

    // Fizz noise (carbonation hiss)
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3500, t + 0.03);

    const fizzGain = this.ctx.createGain();
    fizzGain.gain.setValueAtTime(0.3, t + 0.02);
    fizzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noise.connect(filter);
    filter.connect(fizzGain);
    fizzGain.connect(this.ctx.destination);

    noise.start(t + 0.02);
  }

  // Tiếng "1 2 3 DZÔÔÔ!" rôm rả
  public playCheers() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.playGlassClink();
    
    // Multi-harmonic shout surge
    const t = this.ctx.currentTime + 0.05;
    const baseFreqs = [220, 277, 330, 440];
    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.25, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, t + 0.5);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08 / (idx + 1), t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + idx * 300, t);
      filter.Q.setValueAtTime(2, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.65);
    });
  }

  // Tiếng chuông gọi món ting-ting
  public playOrderChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.1);

      gain.gain.setValueAtTime(0.2, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.45);
    });
  }

  // Bật âm thanh nền thiên nhiên sông nước miền Tây & gió mát ban đêm
  public startAmbient() {
    if (this.isAmbientPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isAmbientPlaying = true;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02; // Pink-ish noise for gentle waves
      lastOut = data[i];
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    noise.start();
  }

  // Tiếng lắc xí ngầu xúc xắc
  public playDiceRoll() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 7; i++) {
      const delay = i * 0.06 + Math.random() * 0.02;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 400, t + delay);
      osc.frequency.exponentialRampToValueAtTime(150, t + delay + 0.04);

      gain.gain.setValueAtTime(0.3, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.05);
    }
  }

  // Tiếng kim vòng xoay quay tick-tick
  public playWheelClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.03);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Tiếng cá quẫy nước / ném mồi cho cá
  public playFishSplash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Low water plop
    const plop = this.ctx.createOscillator();
    const plopGain = this.ctx.createGain();
    plop.type = 'sine';
    plop.frequency.setValueAtTime(450, t);
    plop.frequency.exponentialRampToValueAtTime(120, t + 0.12);

    plopGain.gain.setValueAtTime(0.4, t);
    plopGain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    plop.connect(plopGain);
    plopGain.connect(this.ctx.destination);
    plop.start(t);
    plop.stop(t + 0.15);

    // Light water spray
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    const sprayGain = this.ctx.createGain();
    sprayGain.gain.setValueAtTime(0.25, t);
    sprayGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    noise.connect(filter);
    filter.connect(sprayGain);
    sprayGain.connect(this.ctx.destination);
    noise.start(t + 0.02);
  }

  // Điệu đờn ca tài tử Nam Bộ ngân nga (Thang âm ngũ cung: Hò, Xự, Xang, Xê, Cống)
  public playDonCaTaiTu() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Vietnamese traditional pentatonic scale: D4, F4, G4, A4, C5, D5
    const notes = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33];
    const melody = [0, 2, 3, 2, 4, 3, 5, 4, 2, 0];
    const t = this.ctx.currentTime;

    melody.forEach((noteIdx, i) => {
      if (!this.ctx) return;
      const noteTime = t + i * 0.22;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle'; // Sweet acoustic pluck like đờn kìm
      const freq = notes[noteIdx];
      osc.frequency.setValueAtTime(freq, noteTime);
      // Subtle vibrato (luyến láy Nam Bộ)
      osc.frequency.linearRampToValueAtTime(freq * 1.02, noteTime + 0.1);
      osc.frequency.linearRampToValueAtTime(freq, noteTime + 0.18);

      gain.gain.setValueAtTime(0.28, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  // Tiếng rót bia tươi sủi bọt tràn ly
  public playPourBeer() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.playBeerCrack();
    const t = this.ctx.currentTime + 0.08;

    // Bubble liquid rise sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(750, t + 0.5);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.65);
  }
}

export const soundManager = new SoundManager();
