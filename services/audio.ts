
class AudioService {
  private context: AudioContext | null = null;

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1, fadeOut: boolean = true) {
    try {
      this.initContext();
      if (!this.context) return;

      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.context.currentTime);

      gain.gain.setValueAtTime(volume, this.context.currentTime);
      if (fadeOut) {
        gain.gain.exponentialRampToValueAtTime(0.00001, this.context.currentTime + duration);
      } else {
        gain.gain.setValueAtTime(volume, this.context.currentTime + duration - 0.01);
        gain.gain.linearRampToValueAtTime(0, this.context.currentTime + duration);
      }

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start();
      osc.stop(this.context.currentTime + duration);
    } catch (e) {
      console.warn("Audio play blocked or failed");
    }
  }

  // صوت خفيف جداً عند تمرير الماوس
  playHover() {
    this.playTone(1200, 'sine', 0.05, 0.02);
  }

  playTick() {
    this.playTone(400, 'sine', 0.05, 0.03);
  }

  playClick() {
    this.playTone(800, 'sine', 0.1, 0.05);
  }

  playSelect() {
    this.playTone(1000, 'sine', 0.15, 0.04);
  }

  playOpen() {
    this.playTone(300, 'triangle', 0.2, 0.08);
    setTimeout(() => this.playTone(500, 'triangle', 0.2, 0.06), 40);
  }

  playTransition() {
    this.playTone(200, 'sine', 0.5, 0.05);
    setTimeout(() => this.playTone(400, 'sine', 0.4, 0.05), 100);
  }

  playSuccess() {
    const now = this.context?.currentTime || 0;
    this.playTone(523.25, 'sine', 0.4, 0.08); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.4, 0.08), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.08), 200); // G5
  }

  playError() {
    this.playTone(180, 'sawtooth', 0.3, 0.06);
    setTimeout(() => this.playTone(120, 'sawtooth', 0.4, 0.06), 80);
  }

  playWin() {
    this.playSuccess();
    setTimeout(() => this.playSuccess(), 500);
  }
}

export const audio = new AudioService();
