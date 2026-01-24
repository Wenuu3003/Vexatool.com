import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const fireConfetti = useCallback(() => {
    // Fire confetti from multiple angles for maximum celebration effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => 
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        onComplete?.();
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire from left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#ff69b4", "#ff1493", "#ff6b6b", "#ffd700", "#ff85a2"],
      });

      // Fire from right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#ff69b4", "#ff1493", "#ff6b6b", "#ffd700", "#ff85a2"],
      });
    }, 250);

    // Heart-shaped confetti burst from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff69b4", "#ff1493", "#e91e63", "#f44336", "#ff4081"],
      shapes: ["circle"],
      scalar: 1.2,
      zIndex: 9999,
    });
  }, [onComplete]);

  useEffect(() => {
    if (trigger) {
      fireConfetti();
    }
  }, [trigger, fireConfetti]);

  return null;
}

// Hook for playing celebration sound
export function useCelebrationSound() {
  const playSound = useCallback(() => {
    // Create a simple celebration sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a pleasant celebration chord
      const playNote = (frequency: number, delay: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = "sine";
        
        const startTime = audioContext.currentTime + delay;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play a happy ascending arpeggio (C major chord)
      playNote(523.25, 0, 0.3);      // C5
      playNote(659.25, 0.1, 0.3);    // E5
      playNote(783.99, 0.2, 0.3);    // G5
      playNote(1046.50, 0.3, 0.5);   // C6 (hold longer)
      
      // Add sparkle notes
      playNote(1318.51, 0.5, 0.2);   // E6
      playNote(1567.98, 0.6, 0.3);   // G6
    } catch (error) {
      // Silently fail if audio context is not available
      console.log("Audio not available");
    }
  }, []);

  return playSound;
}
