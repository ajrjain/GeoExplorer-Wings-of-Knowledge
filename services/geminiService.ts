import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { Landmark } from "../types";
import { pcmToGeminiBlob, decodeAudioData, base64ToUint8Array } from "./audioUtils";
import { PRELOADED_REGIONS } from "../data/regions";

// --- Grounding & Content Generation ---

export interface RegionData {
    landmarks: Omit<Landmark, 'position' | 'collected'>[];
    introText: string;
}

export const fetchLandmarksForRegion = async (region: string): Promise<RegionData> => {
  // Use preloaded data for instant loading without needing an API key!
  const preloaded = PRELOADED_REGIONS[region];
  if (preloaded) {
      return preloaded;
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate data for a kids' flight game set in ${region}.
      1. Write a short, exciting 2-sentence welcome intro from "Captain Echo" about flying over ${region}.
      2. List 5 major visually distinct landmarks in ${region} (mountains, towers, natural wonders, and definitely include famous rivers or lakes).
      
      Output strictly valid JSON with this structure:
      {
        "intro": "string",
        "landmarks": [
            { "name": "string", "description": "visual description for image prompt", "fact": "fun fact for a child" }
        ]
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    const landmarks = (data.landmarks || []).map((item: any, index: number) => ({
      id: `lm-${index}`,
      name: item.name,
      description: item.description,
      fact: item.fact
    }));

    return {
        landmarks,
        introText: data.intro || `Welcome to ${region}! Get ready for an amazing adventure!`
    };

  } catch (error) {
    console.error("Error fetching landmarks:", error);
    return {
        landmarks: [
            { id: '1', name: 'Grand Mountain', description: 'A high snowy peak', fact: 'It touches the clouds!' },
            { id: '2', name: 'Golden Tower', description: 'A shiny tall tower', fact: 'It glows at sunset.' },
        ],
        introText: `Welcome to ${region}! Let's fly around and find some treasures!`
    };
  }
};

// --- Live API (Co-pilot) ---

interface LiveClientCallbacks {
  onAudioData: (buffer: AudioBuffer) => void;
  onTranscription?: (text: string, isUser: boolean) => void;
  onClose: () => void;
}

export class GeminiLiveClient {
  private client: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext;
  private nextStartTime: number = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  
  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
    this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }

  async connect(callbacks: LiveClientCallbacks) {
    if (this.inputContext) {
        await this.inputContext.close();
    }
    this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    this.sessionPromise = this.client.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `You are 'Captain Echo', a cheerful and helpful co-pilot for a child flying a plane in a game. 
        Keep your responses short, encouraging, and fun. 
        Help them with directions (North, South, East, West). 
        When they find a treasure, celebrate with them!
        Do not give long lectures.`,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      },
      callbacks: {
        onopen: () => {
          console.log("Co-pilot connected");
          this.startAudioStream(stream);
        },
        onmessage: async (message: LiveServerMessage) => {
           // Handle Audio
           const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
           if (base64Audio) {
             const audioBuffer = await decodeAudioData(
               base64ToUint8Array(base64Audio),
               this.outputContext,
               24000,
               1
             );
             this.playAudio(audioBuffer);
           }
           
           if (message.serverContent?.outputTranscription?.text) {
             callbacks.onTranscription?.(message.serverContent.outputTranscription.text, false);
           }
           if (message.serverContent?.inputTranscription?.text) {
             callbacks.onTranscription?.(message.serverContent.inputTranscription.text, true);
           }
           
           // Handle interruptions
           if (message.serverContent?.interrupted) {
               this.stopAudio();
           }
        },
        onclose: () => {
          console.log("Co-pilot disconnected");
          callbacks.onClose();
        },
        onerror: (err) => {
          console.error("Co-pilot error:", err);
        }
      }
    });
  }

  private startAudioStream(stream: MediaStream) {
    if (!this.inputContext) return;
    
    const source = this.inputContext.createMediaStreamSource(stream);
    const processor = this.inputContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const blob = pcmToGeminiBlob(inputData, 16000);
      
      this.sessionPromise?.then(session => {
        session.sendRealtimeInput({ media: blob });
      });
    };

    source.connect(processor);
    processor.connect(this.inputContext.destination);
  }

  private playAudio(buffer: AudioBuffer) {
    const source = this.outputContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputContext.destination);
    
    const now = this.outputContext.currentTime;
    this.nextStartTime = Math.max(this.nextStartTime, now);
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
    
    source.onended = () => {
        this.activeSources.delete(source);
    };
    this.activeSources.add(source);
  }

  private stopAudio() {
      this.activeSources.forEach(s => {
          try { s.stop(); } catch(e) {}
      });
      this.activeSources.clear();
      this.nextStartTime = this.outputContext.currentTime;
  }

  async disconnect() {
    if (this.inputContext) await this.inputContext.close();
  }
}