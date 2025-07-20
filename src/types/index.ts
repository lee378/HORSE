// Game Types

export interface Player {
  name: string;
  letters: string[];
  avatar: string; // require('../assets/avatar1.png') or URI
  eliminated?: boolean;
  score: number;
  isCurrentPlayer: boolean;
  position: {
    x: number;
    y: number;
  };
}

export interface BasketballMove {
  id: string;
  name: string;
  type: 'dribble' | 'shoot' | 'pass' | 'crossover' | 'spin' | 'jump' | 'layup' | 'step-back' | 'euro-step' | 'drive' | 'dunk' | 'reverse-dunk' | 'windmill-dunk' | 'tomahawk-dunk' | 'between-legs-dunk' | 'alley-oop-dunk';
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  animation: {
    startPosition: { x: number; y: number };
    endPosition: { x: number; y: number };
    keyframes: Array<{ time: number; position: { x: number; y: number } }>;
  };
  description: string;
}

export interface GameSequence {
  id: string;
  moves: BasketballMove[];
  difficulty: 'easy' | 'medium' | 'hard';
  totalDuration: number;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gamePhase: 'setup' | 'gameplay' | 'results' | 'sequence_demo' | 'sequence_replay';
  roundNumber: number;
  maxRounds: number;
  gameMode: 'single' | 'multiplayer';
  currentSequence?: GameSequence;
  sequenceStep: number;
  isSequencePlaying: boolean;
  isSequenceReplaying: boolean;
  lastSuccessfulSequence?: GameSequence;
  currentMoveIndex: number;
  gameWord?: string;
}

export interface ShotResult {
  playerId: string;
  made: boolean;
  position: {
    x: number;
    y: number;
  };
  timestamp: number;
  sequence?: GameSequence;
  sequenceAccuracy: number;
}

export interface GameSettings {
  numberOfPlayers: number;
  maxRounds: number;
  difficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  sequenceLength: number;
  showHints: boolean;
}

export type NavigationParamList = {
  MainMenu: undefined;
  GameSetup: undefined;
  Gameplay: { gameState: GameState };
  Results: { gameState: GameState };
  Settings: undefined;
  HowToPlay: undefined;
  Leaderboards: undefined;
};
