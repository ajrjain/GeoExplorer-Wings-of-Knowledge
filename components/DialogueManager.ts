import { DialogMessage, DialogCategory } from '../types';

export const DIALOGUES: DialogMessage[] = [
  { id: 'start_1', category: 'start', text: "Tower to Alpha One, you are cleared for takeoff. Have a safe flight." },
  { id: 'start_2', category: 'start', text: "Systems nominal. Ready to explore the globe." },
  { id: 'start_3', category: 'start', text: "Alpha One, visibility is good. Proceed to your first waypoint." },
  { id: 'collect_1', category: 'collect', text: "Waypoint reached. Downloading geographical data." },
  { id: 'collect_2', category: 'collect', text: "Target secured. Excellent navigation, Captain." },
  { id: 'collect_3', category: 'collect', text: "Landmark identified. Adding to your flight log." },
  { id: 'ambient_1', category: 'ambient', text: "Radar shows clear skies. Enjoy the view up there." },
  { id: 'ambient_2', category: 'ambient', text: "Maintain current heading. Watch out for other aircraft in the sector." },
  { id: 'ambient_3', category: 'ambient', text: "Cruising altitude reached. Autopilot is standing by if needed." },
  { id: 'crash_1', category: 'crash', text: "MAYDAY! MAYDAY! MAYDAY! We are going down!" },
  { id: 'crash_2', category: 'crash', text: "Brace for impact! Structural integrity failing!" },
  { id: 'crash_3', category: 'crash', text: "Engine stall! Pull up, pull up!" }
];

export class DialogueSystem {
  static playRadioBeep() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn("Audio not supported or blocked", e);
    }
  }

  static speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    this.playRadioBeep();
    
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.9;
      utterance.rate = 1.1; // Slightly faster for radio chatter effect
      utterance.volume = 0.8;
      
      // Try to find a good english voice
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes('en-') && (v.name.includes('Male') || v.name.includes('Google'))) || voices[0];
      if (voice) {
        utterance.voice = voice;
      }
      
      window.speechSynthesis.speak(utterance);
    }, 250); // slight delay after beep
  }

  static getRandomDialogue(category: DialogCategory): DialogMessage {
    const options = DIALOGUES.filter(d => d.category === category);
    return options[Math.floor(Math.random() * options.length)];
  }
}
