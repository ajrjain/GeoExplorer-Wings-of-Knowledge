import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Game3D } from './components/Game3D';
import { EarthIntro } from './components/EarthIntro';
import { UIOverlay } from './components/UIOverlay';
import { GameState, Direction, Landmark, Weather, ControlState } from './types';
import { fetchLandmarksForRegion, GeminiLiveClient, RegionData } from './services/geminiService';

const MOCK_LANDMARKS: Omit<Landmark, 'position' | 'collected'>[] = [
    { id: 'm1', name: 'Central Plaza', description: 'The heart of the city.', fact: 'People gather here for celebrations.' },
    { id: 'm2', name: 'Grand Bridge', description: 'A massive bridge spanning the river.', fact: 'It is over 100 years old.' },
    { id: 'm3', name: 'Ancient Temple', description: 'A stone structure from the past.', fact: 'It was built without modern tools.' },
    { id: 'm4', name: 'Tall Tower', description: 'A skyscraper reaching the clouds.', fact: 'You can see the whole country from the top.' },
    { id: 'm5', name: 'National Park', description: 'A green forest reserve.', fact: 'It is home to rare birds.' },
];

const REGION_COORDS: Record<string, {lat: number, lon: number}> = {
    'France': { lat: 46.2, lon: 2.2 },
    'Germany': { lat: 51.1, lon: 10.4 },
    'Japan': { lat: 36.2, lon: 138.2 },
    'China': { lat: 35.8, lon: 104.1 },
    'India': { lat: 20.5, lon: 78.9 },
    'Russia': { lat: 61.5, lon: 105.3 },
    'Brazil': { lat: -14.2, lon: -51.9 },
    'Egypt': { lat: 26.8, lon: 30.8 },
    'USA': { lat: 37.0, lon: -95.7 },
    'Canada': { lat: 56.1, lon: -106.3 },
    'Australia': { lat: -25.2, lon: 133.7 },
    'Dubai': { lat: 25.2, lon: 55.3 },
    'Singapore': { lat: 1.3, lon: 103.8 },
    'UK': { lat: 55.3, lon: -3.4 },
    'Pacific Ocean': { lat: 0, lon: 160 },
    'Atlantic Ocean': { lat: 14.5, lon: -38.5 },
    'Indian Ocean': { lat: -20.0, lon: 80.0 },
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    screen: 'home' as any, // We will extend the type later, using any for quick add
    selectedRegion: '',
    score: 0,
    landmarks: [],
    totalLandmarks: 0,
    isPaused: false,
  });

  const [currentDirection, setCurrentDirection] = useState<Direction>('N');
  const [copilotConnected, setCopilotConnected] = useState(false);
  const [currentFact, setCurrentFact] = useState<Landmark | null>(null);
  const [lastTranscription, setLastTranscription] = useState('');
  const [currentWeather, setCurrentWeather] = useState<Weather>('sunny');
  const [introText, setIntroText] = useState('');
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const liveClientRef = useRef<GeminiLiveClient | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Shared state for controls (Keyboard + Touch)
  const controlsRef = useRef<ControlState>({
      up: false,
      down: false,
      left: false,
      right: false
  });

  const planePosRef = useRef({ x: 0, z: 0, rot: 0 });

  useEffect(() => {
    liveClientRef.current = new GeminiLiveClient();
    return () => {
        liveClientRef.current?.disconnect();
        window.speechSynthesis.cancel();
    };
  }, []);

  // Speak Intro when text is ready
  useEffect(() => {
      if (gameState.screen === 'intro' && introText && !speechRef.current) {
          const utterance = new SpeechSynthesisUtterance(introText);
          utterance.rate = 1.1;
          utterance.pitch = 1.2; // Cheerful pilot voice
          
          // Try to find a good English voice
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
          if (preferredVoice) utterance.voice = preferredVoice;

          speechRef.current = utterance;
          window.speechSynthesis.speak(utterance);
      }
  }, [introText, gameState.screen]);

  // Auto-dismiss currentFact after 3 seconds
  useEffect(() => {
      let timer: NodeJS.Timeout;
      if (currentFact) {
          timer = setTimeout(() => {
              setCurrentFact(null);
          }, 3000);
      }
      return () => {
          if (timer) clearTimeout(timer);
      };
  }, [currentFact]);

  const handleStartGame = async (region: string, selectedWeather: Weather) => {
    if (playCount >= 3) {
        setGameState(prev => ({ ...prev, screen: 'waitlist' as any }));
        return;
    }
    setPlayCount(prev => prev + 1);

    // 1. Reset State & Start Intro
    setGameState(prev => ({ ...prev, screen: 'intro', selectedRegion: region }));
    setIntroText('');
    setIsIntroComplete(false);
    setDataReady(false);
    speechRef.current = null;
    window.speechSynthesis.cancel();

    // Set user selected Weather
    setCurrentWeather(selectedWeather);

    try {
        // 2. Fetch Data (Landmarks + Intro Text)
        let data: RegionData;
        try {
             data = await fetchLandmarksForRegion(region);
        } catch (err) {
            console.warn("API fetch failed, using mock data", err);
            data = { 
                landmarks: MOCK_LANDMARKS, 
                introText: `Welcome to ${region}! I'm Captain Echo. Let's explore!` 
            };
        }

        if (!data.landmarks || data.landmarks.length === 0) {
            data.landmarks = MOCK_LANDMARKS;
        }

        setIntroText(data.introText);

        // 3. Process Landmarks
        const landmarks: Landmark[] = data.landmarks.map((lm, i) => {
            const angle = (i / data.landmarks.length) * Math.PI * 2;
            const radius = 80 + Math.random() * 100;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            return {
                ...lm,
                position: [x, 20 + Math.random() * 20, z],
                collected: false
            };
        });

        setGameState(prev => ({
            ...prev,
            landmarks,
            totalLandmarks: landmarks.length
        }));
        setDataReady(true);

    } catch (e) {
        console.error("Critical error starting game:", e);
        setGameState(prev => ({ ...prev, screen: 'start' }));
        alert("Something went wrong starting the flight. Please try again.");
    }
  };

  // Called when Earth Zoom is done
  const handleIntroAnimationComplete = () => {
      setIsIntroComplete(true);
  };

  // Check if both animation and data are ready to start playing
  useEffect(() => {
      if (gameState.screen === 'intro' && isIntroComplete && dataReady) {
          setGameState(prev => ({ ...prev, screen: 'playing' }));
      }
  }, [isIntroComplete, dataReady, gameState.screen]);

  const handleToggleCopilot = async () => {
    if (!liveClientRef.current) {
        alert("Co-pilot system not initialized (API Key missing?)");
        return;
    }

    if (copilotConnected) {
        await liveClientRef.current.disconnect();
        setCopilotConnected(false);
    } else {
        try {
            await liveClientRef.current.connect({
                onAudioData: () => {}, 
                onTranscription: (text, isUser) => {
                    if (isUser) setLastTranscription(text);
                },
                onClose: () => setCopilotConnected(false)
            });
            setCopilotConnected(true);
        } catch (e) {
            console.error("Failed to connect copilot", e);
            alert("Could not connect to AI Co-pilot. Check permissions.");
        }
    }
  };

  const handleCollect = useCallback((id: string) => {
    setGameState(prev => {
        const lmIndex = prev.landmarks.findIndex(l => l.id === id);
        if (lmIndex === -1 || prev.landmarks[lmIndex].collected) return prev;

        const newLandmarks = [...prev.landmarks];
        newLandmarks[lmIndex] = { ...newLandmarks[lmIndex], collected: true };
        
        const newScore = prev.score + 1;
        const won = newScore === prev.totalLandmarks;

        setCurrentFact(newLandmarks[lmIndex]);

        if (won) {
            setTimeout(() => {
                setGameState(gs => ({ ...gs, screen: 'summary' }));
                setCurrentFact(null);
            }, 6000); 
        }

        return {
            ...prev,
            score: newScore,
            landmarks: newLandmarks
        };
    });
  }, []);

  const handleCloseFact = () => {
      setCurrentFact(null);
      if (gameState.score === gameState.totalLandmarks) {
          setGameState(prev => ({ ...prev, screen: 'summary' }));
      }
  };

  const handleReset = () => {
      setGameState({
          screen: 'home' as any,
          selectedRegion: '',
          score: 0,
          landmarks: [],
          totalLandmarks: 0,
          isPaused: false
      });
      setCurrentFact(null);
      setCopilotConnected(false);
      liveClientRef.current?.disconnect();
      window.speechSynthesis.cancel();
  };

  const handleStartApp = () => {
      setGameState(prev => ({ ...prev, screen: 'start' }));
  };

  const handleShowWaitlist = () => {
      setGameState(prev => ({ ...prev, screen: 'waitlist' as any }));
  };

  const handleUpdateStats = useCallback((direction: Direction, speed: number) => {
      setCurrentDirection(direction);
  }, []);

  const handlePause = () => setGameState(prev => ({ ...prev, isPaused: true }));
  const handleResume = () => setGameState(prev => ({ ...prev, isPaused: false }));
  const handleReturnToMenu = () => {
      handleReset();
  };

  const selectedCoords = REGION_COORDS[gameState.selectedRegion] || { lat: 0, lon: 0 };

  return (
    <div className="w-full h-screen relative bg-slate-900 overflow-hidden">
      
      {/* 3D Layers */}
      {gameState.screen === 'intro' && (
          <div className="absolute inset-0 z-10 transition-opacity duration-1000">
              <EarthIntro 
                  targetLat={selectedCoords.lat} 
                  targetLon={selectedCoords.lon} 
                  onComplete={handleIntroAnimationComplete} 
              />
              <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
                  <div className="inline-block bg-black/60 backdrop-blur px-8 py-4 rounded-full border border-sky-500/50">
                      <p className="text-sky-300 text-xl font-mono animate-pulse">
                          {introText ? `Captain Echo: "${introText}"` : "Calibrating Sensors..."}
                      </p>
                  </div>
              </div>
          </div>
      )}

      {/* 3D Layers - Render Game3D underneath during intro so it loads textures early */}
      {(gameState.screen === 'intro' || gameState.screen === 'playing' || gameState.screen === 'summary') && (
          <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${gameState.screen === 'playing' ? 'opacity-100' : 'opacity-0'}`}>
             <Game3D 
                landmarks={gameState.landmarks} 
                onCollect={handleCollect}
                onUpdateStats={handleUpdateStats}
                region={gameState.selectedRegion}
                weather={currentWeather}
                controlsRef={controlsRef}
                planePosRef={planePosRef}
                isPaused={gameState.isPaused || gameState.screen !== 'playing'}
             />
          </div>
      )}

      {/* UI Layer */}
      <UIOverlay 
        gameState={gameState}
        currentDirection={currentDirection}
        copilotConnected={copilotConnected}
        lastTranscription={lastTranscription}
        onStartGame={handleStartGame}
        onToggleCopilot={handleToggleCopilot}
        onReset={handleReset}
        onStartApp={handleStartApp}
        onShowWaitlist={handleShowWaitlist}
        onCloseFact={handleCloseFact}
        onPause={handlePause}
        onResume={handleResume}
        onReturnToMenu={handleReturnToMenu}
        currentFact={currentFact}
        controlsRef={controlsRef}
        planePosRef={planePosRef}
      />
    </div>
  );
}