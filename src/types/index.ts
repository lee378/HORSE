// Game Types

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  letters: string[];
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
  type: 'dribble' | 'shoot' | 'pass' | 'crossover' | 'spin' | 'jump';
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
  Leaderboards: undefined;
};
