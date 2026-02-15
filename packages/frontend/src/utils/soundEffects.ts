// Simple sound effect utilities using Web Audio API

class SoundEffects {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playSuccess() {
    this.playTone(800, 0.1);
    setTimeout(() => this.playTone(1000, 0.15), 100);
  }

  playError() {
    this.playTone(200, 0.2, 'square');
  }

  playRetry() {
    this.playTone(400, 0.1);
  }

  playNotification() {
    this.playTone(600, 0.1);
  }
}

export const soundEffects = new SoundEffects();
