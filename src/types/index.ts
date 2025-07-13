// Game Types

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  letters: string[];
  score: number;
  isCurrentPlayer: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gamePhase: 'setup' | 'gameplay' | 'results';
  roundNumber: number;
  maxRounds: number;
  gameMode: 'single' | 'multiplayer';
}

export interface ShotResult {
  playerId: string;
  made: boolean;
  position: {
    x: number;
    y: number;
  };
  timestamp: number;
}

export interface GameSettings {
  numberOfPlayers: number;
  maxRounds: number;
  difficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export type NavigationParamList = {
  MainMenu: undefined;
  GameSetup: undefined;
  Gameplay: { gameState: GameState };
  Results: { gameState: GameState };
  Settings: undefined;
  Leaderboards: undefined;
};
