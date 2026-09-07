import React, { useEffect, useRef } from 'react';
import { Compass, Map, Trophy, Mic, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction, GameState, Landmark, ControlState } from '../types';

interface UIOverlayProps {
    gameState: GameState;
    currentDirection: Direction;
    copilotConnected: boolean;
    lastTranscription: string;
    onStartGame: (region: string, weather: import('../types').Weather, planeType: import('../types').PlaneType) => void;
    onToggleCopilot: () => void;
    onReset: () => void;
    onStartApp: () => void;
    onShowWaitlist: () => void;
    onCloseFact: () => void;
    onPause: () => void;
    onResume: () => void;
    onReturnToMenu: () => void;
    currentFact: Landmark | null;
    crashReason?: string;
    controlsRef: React.MutableRefObject<ControlState>;
    planePosRef?: React.MutableRefObject<{x: number, z: number, rot: number}>;
}

const REGIONS = [
    { name: 'France', emoji: '🇫🇷' },
    { name: 'Germany', emoji: '🇩🇪' },
    { name: 'Japan', emoji: '🇯🇵' },
    { name: 'China', emoji: '🇨🇳' },
    { name: 'India', emoji: '🇮🇳' },
    { name: 'Russia', emoji: '🇷🇺' },
    { name: 'Brazil', emoji: '🇧🇷' },
    { name: 'Egypt', emoji: '🇪🇬' },
    { name: 'USA', emoji: '🇺🇸' },
    { name: 'Canada', emoji: '🇨🇦' },
    { name: 'Australia', emoji: '🇦🇺' },
    { name: 'Dubai', emoji: '🇦🇪' },
    { name: 'Singapore', emoji: '🇸🇬' },
    { name: 'UK', emoji: '🇬🇧' },
    { name: 'Pacific Ocean', emoji: '🌊' },
    { name: 'Atlantic Ocean', emoji: '🌊' },
    { name: 'Indian Ocean', emoji: '🌊' },
];

const MiniMap = ({ 
    planePosRef, 
    landmarks, 
    mapSize = 160 
}: { 
    planePosRef: React.MutableRefObject<{x: number, z: number, rot: number}>, 
    landmarks: Landmark[], 
    mapSize?: number 
}) => {
    const playerRef = useRef<HTMLDivElement>(null);
    
    // Scale from Game Map Size (800) to Minimap Size (160)
    const GAME_MAP_SIZE = 800;
    const scale = mapSize / GAME_MAP_SIZE; 

    useEffect(() => {
        let animationFrame: number;
        const updateMap = () => {
            if (playerRef.current && planePosRef.current) {
                const { x, z, rot } = planePosRef.current;
                
                const px = (x + GAME_MAP_SIZE / 2) * scale; 
                const py = (z + GAME_MAP_SIZE / 2) * scale;
                
                const degrees = -(rot * 180 / Math.PI); 

                playerRef.current.style.transform = `translate(${px}px, ${py}px) rotate(${degrees}deg)`;
            }
            animationFrame = requestAnimationFrame(updateMap);
        };
        updateMap();
        return () => cancelAnimationFrame(animationFrame);
    }, [scale, planePosRef]);

    return (
        <div 
            className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border-2 border-slate-700 shadow-xl overflow-hidden mt-4 ml-auto pointer-events-auto"
            style={{ width: mapSize, height: mapSize }}
        >
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* Landmarks */}
            {landmarks.map(lm => {
                const lx = (lm.position[0] + GAME_MAP_SIZE / 2) * scale;
                const lz = (lm.position[2] + GAME_MAP_SIZE / 2) * scale;
                return (
                    <div 
                        key={lm.id}
                        className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${lm.collected ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}
                        style={{ left: lx, top: lz }}
                    />
                );
            })}

            {/* Player Icon (Triangle pointing up) */}
            <div 
                ref={playerRef}
                className="absolute w-6 h-6 -ml-3 -mt-3 origin-center z-10"
                style={{ top: 0, left: 0 }}
            >
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent border-b-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
        </div>
    );
};

export const UIOverlay: React.FC<UIOverlayProps> = ({
    gameState,
    currentDirection,
    copilotConnected,
    lastTranscription,
    onStartGame,
    onToggleCopilot,
    onReset,
    onStartApp,
    onShowWaitlist,
    onCloseFact,
    onPause,
    onResume,
    onReturnToMenu,
    currentFact,
    crashReason,
    controlsRef,
    planePosRef
}) => {

    const [selectedWeather, setSelectedWeather] = React.useState<import('../types').Weather>('sunny');
    const [selectedPlaneUI, setSelectedPlaneUI] = React.useState<import('../types').PlaneType>('propeller');
    const [showTouchControls, setShowTouchControls] = React.useState<boolean>(
        typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    );

    // Handlers for touch controls
    const setControl = (key: keyof ControlState, active: boolean) => {
        if (controlsRef.current) {
            controlsRef.current[key] = active;
        }
    };

    if (gameState.screen === 'home') {
        return (
            <div className="absolute inset-0 bg-slate-900 bg-opacity-95 flex flex-col items-center justify-center p-4 z-50">
                <div className="max-w-2xl w-full text-center">
                    <h1 className="text-6xl md:text-8xl font-bold text-sky-400 mb-4 drop-shadow-[0_0_20px_rgba(56,189,248,0.5)] tracking-wider">GEO EXPLORER</h1>
                    <p className="text-2xl md:text-4xl text-slate-300 mb-4">Wings of Knowledge</p>
                    <p className="text-lg md:text-xl text-sky-200/80 mb-12 italic">Built by Krishvi Jain</p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button 
                            onClick={() => onStartApp()} 
                            className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 px-8 rounded-full text-2xl transition-all shadow-[0_0_30px_rgba(56,189,248,0.4)] hover:shadow-[0_0_50px_rgba(56,189,248,0.6)] hover:scale-105"
                        >
                            Play Demo
                        </button>
                        <button 
                            onClick={() => onShowWaitlist()}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-8 rounded-full text-2xl border-2 border-slate-600 transition-all hover:border-slate-500"
                        >
                            Join Waitlist
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState.screen === 'waitlist') {
        return (
            <div className="absolute inset-0 bg-slate-900 bg-opacity-95 flex flex-col items-center justify-center p-4 z-50">
                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 text-center max-w-md w-full shadow-2xl">
                    <h2 className="text-3xl font-bold text-sky-400 mb-2">Join Waitlist</h2>
                    <p className="text-slate-300 mb-6">You've reached the maximum flights for this session, or want full access! Enter your details below.</p>
                    <form 
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                            const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                            try {
                                await fetch('/api/waitlist', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ name, email })
                                });
                                alert('Thanks for joining!');
                                onReset();
                            } catch(err) {
                                alert('Error saving waitlist');
                            }
                        }}
                        className="flex flex-col gap-4"
                    >
                        <input name="name" type="text" placeholder="Your Name" required className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-white w-full" />
                        <input name="email" type="email" placeholder="Your Email" required className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-white w-full" />
                        <button type="submit" className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-full text-xl transition-colors mt-2">
                            Submit Request
                        </button>
                        <button type="button" onClick={() => onReset()} className="text-slate-400 hover:text-white mt-2">
                            Back to Home
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (gameState.screen === 'start') {
        return (
            <div className="absolute inset-0 bg-slate-900 bg-opacity-95 flex flex-col items-center justify-center p-4 pt-8 pb-12 z-50 overflow-hidden">
                <div className="max-w-4xl w-full text-center h-full flex flex-col py-4 sm:py-8">
                    <h1 className="text-4xl sm:text-6xl font-bold text-sky-400 mb-2 drop-shadow-lg tracking-wider shrink-0">GEO EXPLORER</h1>
                    <p className="text-xl sm:text-2xl text-slate-300 mb-4 shrink-0">Wings of Knowledge</p>
                    
                    <div className="mb-4 shrink-0 flex flex-col md:flex-row justify-center items-center gap-8">
                        <div>
                            <h2 className="text-lg sm:text-xl text-white mb-2">Select Weather:</h2>
                            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                                {['sunny', 'rainy', 'snowy'].map((w) => (
                                    <button
                                        key={w}
                                        onClick={() => setSelectedWeather(w as any)}
                                        className={`px-4 sm:px-6 py-2 rounded-full font-bold capitalize transition-all border-2 text-sm sm:text-base ${
                                            selectedWeather === w 
                                            ? 'bg-sky-500 border-sky-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)]' 
                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-sky-400'
                                        }`}
                                    >
                                        {w === 'sunny' ? '☀️ ' : (w === 'rainy' ? '🌧️ ' : '❄️ ')} {w}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-lg sm:text-xl text-white mb-2">Select Plane:</h2>
                            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                                {['propeller', 'jet', 'glider'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setSelectedPlaneUI(p as any)}
                                        className={`px-4 sm:px-6 py-2 rounded-full font-bold capitalize transition-all border-2 text-sm sm:text-base flex items-center gap-2 ${
                                            selectedPlaneUI === p 
                                            ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-400'
                                        }`}
                                    >
                                        {p === 'propeller' ? '🛩️' : (p === 'jet' ? '🚀' : '🪁')} {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl text-white mb-4 shrink-0">Select a Destination:</h2>
                    <div className="overflow-y-auto pr-2 pb-12 flex-1 scrollbar-thin scrollbar-thumb-sky-500 scrollbar-track-slate-800">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                            {REGIONS.map((r) => (
                                <button
                                    key={r.name}
                                    onClick={() => onStartGame(r.name, selectedWeather, selectedPlaneUI)}
                                    className="bg-slate-800 hover:bg-sky-600 transition-all duration-300 p-4 sm:p-6 rounded-xl border-2 border-slate-700 hover:border-sky-400 group flex flex-col items-center justify-center min-h-[120px]"
                                >
                                    <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform">{r.emoji}</div>
                                    <div className="text-sm sm:text-xl font-bold text-white text-center break-words w-full">{r.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState.screen === 'intro') {
        return null;
    }

    if (gameState.screen === 'loading') {
        return (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-500 border-opacity-50 mx-auto mb-4"></div>
                    <h2 className="text-2xl text-white font-bold">Loading...</h2>
                </div>
            </div>
        );
    }

    if (gameState.screen === 'summary') {
        return (
            <div className="absolute inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center z-50">
                 <div className="bg-slate-800 p-8 rounded-3xl max-w-2xl w-full text-center border-4 border-yellow-500 shadow-2xl">
                    <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
                    <h2 className="text-4xl text-white font-bold mb-4">Mission Accomplished!</h2>
                    <p className="text-xl text-slate-300 mb-8">
                        You explored <span className="text-sky-400 font-bold">{gameState.selectedRegion}</span> and found all {gameState.totalLandmarks} treasures!
                    </p>
                    <button
                        onClick={onReset}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-full text-xl transition-colors shadow-lg"
                    >
                        Play Again
                    </button>
                 </div>
            </div>
        );
    }

    if (gameState.screen === 'gameover') {
        return (
            <div className="absolute inset-0 bg-red-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-50 pointer-events-auto animate-in fade-in duration-500">
                <div className="max-w-md w-full text-center bg-slate-900/80 p-8 rounded-3xl border-2 border-red-500 shadow-2xl">
                    <h1 className="text-5xl font-black text-red-500 mb-4 animate-bounce">MAYDAY!</h1>
                    <h2 className="text-2xl font-bold text-white mb-2">You Crashed!</h2>
                    <p className="text-red-200 mb-8">{crashReason || "Flight integrity compromised."}</p>
                    
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={onReset}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-full text-xl transition-colors shadow-lg"
                        >
                            Return to Base
                        </button>
                    </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6 pb-8 sm:pb-6">
            {/* Top Bar */}
            <div className="flex justify-between items-start pointer-events-auto">
                <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-slate-700 flex gap-6 text-white shadow-lg">
                    <div className="flex items-center gap-2">
                        <Map className="text-sky-400" />
                        <span className="font-bold text-lg">{gameState.selectedRegion}</span>
                    </div>
                    <div className="w-px bg-slate-600"></div>
                    <div className="flex items-center gap-2">
                        <Trophy className="text-yellow-400" />
                        <span className="font-bold text-xl">{gameState.score} Pts</span>
                    </div>
                    <div className="w-px bg-slate-600"></div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-slate-300">
                            {gameState.landmarks.filter(l => l.collected).length} / {gameState.totalLandmarks} Found
                        </span>
                    </div>
                    <div className="w-px bg-slate-600"></div>
                    <button 
                        onClick={() => setShowTouchControls(!showTouchControls)} 
                        className={`font-bold transition-colors flex items-center ${showTouchControls ? 'text-sky-400' : 'text-slate-300 hover:text-white'}`}
                        title="Toggle Touch Controls"
                    >
                        👆 Touch
                    </button>
                    <div className="w-px bg-slate-600"></div>
                    <button 
                        onClick={onPause} 
                        className="font-bold text-slate-300 hover:text-white transition-colors flex items-center"
                    >
                        ⏸ Pause
                    </button>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <button 
                        onClick={onToggleCopilot}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg ${
                            copilotConnected 
                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                    >
                        <Mic size={20} />
                        {copilotConnected ? 'Co-pilot Active' : 'Start Co-pilot'}
                    </button>
                    {copilotConnected && (
                        <div className="bg-black/60 backdrop-blur text-white text-sm px-4 py-2 rounded-lg max-w-xs text-right">
                             {lastTranscription || "Listening..."}
                        </div>
                    )}
                    {/* Minimap rendering conditionally when playing */}
                    {gameState.screen === 'playing' && planePosRef && (
                        <MiniMap planePosRef={planePosRef} landmarks={gameState.landmarks} />
                    )}
                </div>
            </div>

            {/* Fact Panel - Top on mobile, Bottom right on desktop */}
            {currentFact && (
                <div className="absolute top-24 right-4 sm:top-auto sm:bottom-6 sm:right-6 pointer-events-auto z-50 flex animate-in slide-in-from-right duration-500 drop-shadow-2xl max-w-xs w-[calc(100%-2rem)] sm:w-full">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 w-full shadow-2xl border-l-8 border-sky-500 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-slate-800 leading-tight">{currentFact.name}</h3>
                            <button onClick={onCloseFact} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center transition-colors ml-4 shrink-0">
                                <span className="text-lg font-bold leading-none">×</span>
                            </button>
                        </div>

                        <div className="bg-sky-50 p-3 rounded-xl mb-3 border border-sky-100">
                             <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                "{currentFact.fact}"
                            </p>
                        </div>
                        <p className="text-slate-500 text-xs italic mb-3 line-clamp-2">{currentFact.description}</p>
                        <button 
                            onClick={onCloseFact}
                            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 rounded-xl transition-colors text-sm shadow-md"
                        >
                            Awesome! (+100 Pts)
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Bar - HUD */}
            <div className="flex justify-between items-end w-full">
                
                {/* Mobile Controls Left (Turn) */}
                {showTouchControls && (
                <div className="flex gap-4 pointer-events-auto">
                    <button 
                        className="bg-white/20 hover:bg-white/30 active:bg-sky-500/50 backdrop-blur-md p-6 rounded-full border border-white/20 touch-none select-none transition-colors"
                        onPointerDown={() => setControl('left', true)}
                        onPointerUp={() => setControl('left', false)}
                        onPointerLeave={() => setControl('left', false)}
                    >
                        <ArrowLeft className="text-white w-8 h-8" />
                    </button>
                    <button 
                        className="bg-white/20 hover:bg-white/30 active:bg-sky-500/50 backdrop-blur-md p-6 rounded-full border border-white/20 touch-none select-none transition-colors"
                        onPointerDown={() => setControl('right', true)}
                        onPointerUp={() => setControl('right', false)}
                        onPointerLeave={() => setControl('right', false)}
                    >
                        <ArrowRight className="text-white w-8 h-8" />
                    </button>
                </div>
                )}

                {/* Compass (Hidden on small mobile screens to save space, or just center it) */}
                <div className="hidden md:flex bg-slate-900/80 backdrop-blur rounded-full w-32 h-32 border-4 border-slate-700 items-center justify-center relative shadow-xl mx-auto">
                     <div className="absolute inset-0 flex items-center justify-center">
                         <Compass size={64} className="text-slate-500 opacity-20" />
                     </div>
                     <div className="text-4xl font-black text-sky-400 z-10">{currentDirection}</div>
                     <div className="absolute top-2 text-xs font-bold text-slate-500">N</div>
                     <div className="absolute right-3 text-xs font-bold text-slate-500">E</div>
                     <div className="absolute bottom-2 text-xs font-bold text-slate-500">S</div>
                     <div className="absolute left-3 text-xs font-bold text-slate-500">W</div>
                </div>

                {/* Mobile Controls Right (Speed) */}
                {showTouchControls && (
                 <div className="flex flex-col gap-4 pointer-events-auto">
                    <button 
                        className="bg-white/20 hover:bg-white/30 active:bg-sky-500/50 backdrop-blur-md p-6 rounded-full border border-white/20 touch-none select-none transition-colors"
                        onPointerDown={() => setControl('up', true)}
                        onPointerUp={() => setControl('up', false)}
                        onPointerLeave={() => setControl('up', false)}
                    >
                        <ArrowUp className="text-white w-8 h-8" />
                    </button>
                    <button 
                        className="bg-white/20 hover:bg-white/30 active:bg-sky-500/50 backdrop-blur-md p-6 rounded-full border border-white/20 touch-none select-none transition-colors"
                        onPointerDown={() => setControl('down', true)}
                        onPointerUp={() => setControl('down', false)}
                        onPointerLeave={() => setControl('down', false)}
                    >
                        <ArrowDown className="text-white w-8 h-8" />
                    </button>
                </div>
                )}

                {/* Desktop Instructions */}
                {!showTouchControls && (
                <div className="hidden md:block bg-slate-900/80 backdrop-blur rounded-2xl p-4 text-white text-sm">
                    <div className="flex flex-col gap-1 opacity-80">
                        <p>Controls:</p>
                        <div className="flex gap-2">
                            <kbd className="bg-slate-700 px-2 py-1 rounded">↑</kbd> <span>Speed Up</span>
                        </div>
                        <div className="flex gap-2">
                            <kbd className="bg-slate-700 px-2 py-1 rounded">←</kbd> <kbd className="bg-slate-700 px-2 py-1 rounded">→</kbd> <span>Turn</span>
                        </div>
                    </div>
                </div>
                )}
            </div>

            {/* Pause Menu */}
            {gameState.isPaused && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center pointer-events-auto">
                    <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 text-center max-w-sm w-full shadow-2xl">
                        <h2 className="text-3xl font-bold text-white mb-8">Game Paused</h2>
                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={onResume}
                                className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 rounded-full text-xl transition-colors shadow-lg"
                            >
                                Resume Flight
                            </button>
                            <button 
                                onClick={onReturnToMenu}
                                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-full text-lg transition-colors"
                            >
                                Quit to Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};