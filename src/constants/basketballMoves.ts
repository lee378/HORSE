import { BasketballMove, GameSequence } from '../types';

// Basketball Court Dimensions (scaled for mobile)
const COURT_WIDTH = 400;
const COURT_HEIGHT = 600;
const THREE_POINT_LINE = 180;
const FREE_THROW_LINE = 120;
const BASKET_HEIGHT = 50;

// Player starting positions
const PLAYER_START_X = COURT_WIDTH / 2;
const PLAYER_START_Y = COURT_HEIGHT - 100;

// Basketball Moves Library
export const BASKETBALL_MOVES: BasketballMove[] = [
  // Basic Dribbling Moves
  {
    id: 'basic_dribble',
    name: 'Basic Dribble',
    type: 'dribble',
    duration: 1000,
    difficulty: 'easy',
    animation: {
      startPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      endPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
        { time: 0.5, position: { x: PLAYER_START_X, y: PLAYER_START_Y - 20 } },
        { time: 1, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
      ],
    },
    description: 'Simple dribble in place',
  },
  {
    id: 'crossover',
    name: 'Crossover',
    type: 'crossover',
    duration: 1500,
    difficulty: 'medium',
    animation: {
      startPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      endPosition: { x: PLAYER_START_X + 40, y: PLAYER_START_Y },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
        { time: 0.3, position: { x: PLAYER_START_X - 20, y: PLAYER_START_Y } },
        { time: 0.7, position: { x: PLAYER_START_X + 20, y: PLAYER_START_Y } },
        { time: 1, position: { x: PLAYER_START_X + 40, y: PLAYER_START_Y } },
      ],
    },
    description: 'Cross the ball from right to left hand',
  },
  {
    id: 'between_legs',
    name: 'Between Legs Dribble',
    type: 'dribble',
    duration: 1200,
    difficulty: 'medium',
    animation: {
      startPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      endPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
        { time: 0.5, position: { x: PLAYER_START_X, y: PLAYER_START_Y - 30 } },
        { time: 1, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
      ],
    },
    description: 'Dribble the ball between your legs',
  },
  {
    id: 'behind_back',
    name: 'Behind Back Dribble',
    type: 'dribble',
    duration: 1400,
    difficulty: 'hard',
    animation: {
      startPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      endPosition: { x: PLAYER_START_X + 30, y: PLAYER_START_Y },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
        { time: 0.4, position: { x: PLAYER_START_X - 15, y: PLAYER_START_Y } },
        { time: 0.8, position: { x: PLAYER_START_X + 15, y: PLAYER_START_Y } },
        { time: 1, position: { x: PLAYER_START_X + 30, y: PLAYER_START_Y } },
      ],
    },
    description: 'Dribble the ball behind your back',
  },
  {
    id: 'spin_move',
    name: 'Spin Move',
    type: 'spin',
    duration: 1800,
    difficulty: 'hard',
    animation: {
      startPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      endPosition: { x: PLAYER_START_X + 50, y: PLAYER_START_Y },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
        { time: 0.25, position: { x: PLAYER_START_X + 10, y: PLAYER_START_Y - 20 } },
        { time: 0.5, position: { x: PLAYER_START_X + 25, y: PLAYER_START_Y } },
        { time: 0.75, position: { x: PLAYER_START_X + 40, y: PLAYER_START_Y - 20 } },
        { time: 1, position: { x: PLAYER_START_X + 50, y: PLAYER_START_Y } },
      ],
    },
    description: 'Spin 360 degrees while dribbling',
  },
  
  // Shooting Moves
  {
    id: 'jump_shot',
    name: 'Jump Shot',
    type: 'shoot',
    duration: 2000,
    difficulty: 'easy',
    animation: {
      startPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      endPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
        { time: 0.3, position: { x: PLAYER_START_X, y: PLAYER_START_Y - 40 } },
        { time: 0.7, position: { x: PLAYER_START_X, y: PLAYER_START_Y - 60 } },
        { time: 1, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
      ],
    },
    description: 'Standard jump shot',
  },
  {
    id: 'layup',
    name: 'Layup',
    type: 'shoot',
    duration: 2500,
    difficulty: 'medium',
    animation: {
      startPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      endPosition: { x: PLAYER_START_X + 30, y: PLAYER_START_Y },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
        { time: 0.4, position: { x: PLAYER_START_X + 15, y: PLAYER_START_Y - 30 } },
        { time: 0.8, position: { x: PLAYER_START_X + 25, y: PLAYER_START_Y - 50 } },
        { time: 1, position: { x: PLAYER_START_X + 30, y: PLAYER_START_Y } },
      ],
    },
    description: 'Drive to the basket and lay it up',
  },
  {
    id: 'three_point_shot',
    name: 'Three Point Shot',
    type: 'shoot',
    duration: 2200,
    difficulty: 'medium',
    animation: {
      startPosition: { x: PLAYER_START_X, y: THREE_POINT_LINE },
      endPosition: { x: PLAYER_START_X, y: THREE_POINT_LINE },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: THREE_POINT_LINE } },
        { time: 0.3, position: { x: PLAYER_START_X, y: THREE_POINT_LINE - 30 } },
        { time: 0.7, position: { x: PLAYER_START_X, y: THREE_POINT_LINE - 50 } },
        { time: 1, position: { x: PLAYER_START_X, y: THREE_POINT_LINE } },
      ],
    },
    description: 'Shoot from beyond the three-point line',
  },
  {
    id: 'free_throw',
    name: 'Free Throw',
    type: 'shoot',
    duration: 1800,
    difficulty: 'easy',
    animation: {
      startPosition: { x: PLAYER_START_X, y: FREE_THROW_LINE },
      endPosition: { x: PLAYER_START_X, y: FREE_THROW_LINE },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: FREE_THROW_LINE } },
        { time: 0.5, position: { x: PLAYER_START_X, y: FREE_THROW_LINE - 20 } },
        { time: 1, position: { x: PLAYER_START_X, y: FREE_THROW_LINE } },
      ],
    },
    description: 'Shoot from the free throw line',
  },
  {
    id: 'dunk',
    name: 'Dunk',
    type: 'shoot',
    duration: 3000,
    difficulty: 'hard',
    animation: {
      startPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      endPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
        { time: 0.3, position: { x: PLAYER_START_X + 20, y: PLAYER_START_Y - 40 } },
        { time: 0.7, position: { x: PLAYER_START_X + 30, y: PLAYER_START_Y - 80 } },
        { time: 1, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
      ],
    },
    description: 'Slam dunk the basketball',
  },
  
  // Advanced Moves
  {
    id: 'euro_step',
    name: 'Euro Step',
    type: 'dribble',
    duration: 2800,
    difficulty: 'hard',
    animation: {
      startPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      endPosition: { x: PLAYER_START_X + 60, y: PLAYER_START_Y },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
        { time: 0.3, position: { x: PLAYER_START_X + 20, y: PLAYER_START_Y - 30 } },
        { time: 0.6, position: { x: PLAYER_START_X + 40, y: PLAYER_START_Y - 20 } },
        { time: 1, position: { x: PLAYER_START_X + 60, y: PLAYER_START_Y } },
      ],
    },
    description: 'Euro step around the defender',
  },
  {
    id: 'step_back',
    name: 'Step Back',
    type: 'shoot',
    duration: 2400,
    difficulty: 'hard',
    animation: {
      startPosition: { x: PLAYER_START_X, y: PLAYER_START_Y },
      endPosition: { x: PLAYER_START_X - 30, y: PLAYER_START_Y },
      keyframes: [
        { time: 0, position: { x: PLAYER_START_X, y: PLAYER_START_Y } },
        { time: 0.4, position: { x: PLAYER_START_X - 15, y: PLAYER_START_Y - 20 } },
        { time: 0.8, position: { x: PLAYER_START_X - 25, y: PLAYER_START_Y - 40 } },
        { time: 1, position: { x: PLAYER_START_X - 30, y: PLAYER_START_Y } },
      ],
    },
    description: 'Step back and shoot',
  },
];

// Predefined Game Sequences
export const GAME_SEQUENCES: GameSequence[] = [
  {
    id: 'sequence_1',
    moves: [
      BASKETBALL_MOVES.find(m => m.id === 'basic_dribble')!,
      BASKETBALL_MOVES.find(m => m.id === 'jump_shot')!,
    ],
    difficulty: 'easy',
    totalDuration: 3000,
  },
  {
    id: 'sequence_2',
    moves: [
      BASKETBALL_MOVES.find(m => m.id === 'crossover')!,
      BASKETBALL_MOVES.find(m => m.id === 'layup')!,
    ],
    difficulty: 'medium',
    totalDuration: 4000,
  },
  {
    id: 'sequence_3',
    moves: [
      BASKETBALL_MOVES.find(m => m.id === 'between_legs')!,
      BASKETBALL_MOVES.find(m => m.id === 'three_point_shot')!,
    ],
    difficulty: 'medium',
    totalDuration: 3400,
  },
  {
    id: 'sequence_4',
    moves: [
      BASKETBALL_MOVES.find(m => m.id === 'behind_back')!,
      BASKETBALL_MOVES.find(m => m.id === 'spin_move')!,
      BASKETBALL_MOVES.find(m => m.id === 'dunk')!,
    ],
    difficulty: 'hard',
    totalDuration: 6200,
  },
  {
    id: 'sequence_5',
    moves: [
      BASKETBALL_MOVES.find(m => m.id === 'euro_step')!,
      BASKETBALL_MOVES.find(m => m.id === 'step_back')!,
      BASKETBALL_MOVES.find(m => m.id === 'three_point_shot')!,
    ],
    difficulty: 'hard',
    totalDuration: 7600,
  },
];

// Helper function to generate random sequences
export const generateRandomSequence = (difficulty: 'easy' | 'medium' | 'hard', length: number): GameSequence => {
  const availableMoves = BASKETBALL_MOVES.filter(move => move.difficulty === difficulty);
  const selectedMoves: BasketballMove[] = [];
  
  for (let i = 0; i < length; i++) {
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    selectedMoves.push(randomMove);
  }
  
  return {
    id: `random_sequence_${Date.now()}`,
    moves: selectedMoves,
    difficulty,
    totalDuration: selectedMoves.reduce((total, move) => total + move.duration, 0),
  };
}; 