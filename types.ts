export interface Landmark {
  id: string;
  name: string;
  description: string;
  position: [number, number, number]; // x, y, z in 3D space
  collected: boolean;
  fact: string;
}

export type PlaneType = 'propeller' | 'jet' | 'glider';

export interface GameState {
  screen: 'home' | 'start' | 'intro' | 'loading' | 'playing' | 'summary' | 'waitlist' | 'gameover';
  selectedRegion: string;
  selectedPlane: PlaneType;
  score: number;
  landmarks: Landmark[];
  totalLandmarks: number;
  isPaused: boolean;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
}

export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export type Weather = 'sunny' | 'rainy' | 'stormy' | 'snowy';

export interface ControlState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export type DialogCategory = 'start' | 'ambient' | 'collect' | 'crash';

export interface DialogMessage {
  id: string;
  category: DialogCategory;
  text: string;
  duration?: number;
}