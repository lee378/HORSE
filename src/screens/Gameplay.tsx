import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Vibration, Alert, Image, TouchableOpacity } from 'react-native';
import { EngineView } from '@babylonjs/react-native';
import { ArcRotateCamera } from '@babylonjs/core';
import ScoreboardOverlay from '../components/ScoreboardOverlay';

import { HORSEDisplay } from '../components/HORSEDisplay';
import BabylonCourt, { BabylonCourtRef } from '../components/BabylonCourt';

import { Colors, Typography, Spacing, BorderRadius } from '../constants/designSystem';
import { GameState, GameSequence } from '../types';
import { GAME_SEQUENCES, generateRandomSequence } from '../constants/basketballMoves';
import { Vector3 } from '@babylonjs/core';

interface GameplayProps {
  navigation: any;
  route: { params: { gameState: GameState } };
}

// AI difficulty levels and their characteristics
const AI_DIFFICULTY = {
  easy: {
    accuracyRange: [0.6, 0.8],
    thinkingTime: [2000, 4000],
    successRate: 0.7,
  },
  medium: {
    accuracyRange: [0.75, 0.9],
    thinkingTime: [1500, 3000],
    successRate: 0.8,
  },
  hard: {
    accuracyRange: [0.85, 0.95],
    thinkingTime: [1000, 2000],
    successRate: 0.9,
  },
};

export const Gameplay: React.FC<GameplayProps> = ({ navigation, route }) => {
  const { gameState: initialGameState } = route.params;
  const [gameState, setGameState] = useState<GameState>({
    ...initialGameState,
    currentSequence: undefined,
    sequenceStep: 0,
    isSequencePlaying: false,
    isSequenceReplaying: false,
    currentMoveIndex: 0,
  });
  
  const [currentPhase, setCurrentPhase] = useState<'demo' | 'replay' | 'waiting'>('waiting');
  const [sequenceAccuracy, setSequenceAccuracy] = useState<number>(0);
  const [playerInput, setPlayerInput] = useState<GameSequence | null>(null);
  const [camera, setCamera] = useState<ArcRotateCamera | null>(null);
  const [justEarnedLetters, setJustEarnedLetters] = useState<number[][]>([]);
  const [isAITurn, setIsAITurn] = useState<boolean>(false);
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const courtRef = useRef<BabylonCourtRef>(null);

  // Check if current player is AI (name contains "AI" or "Computer")
  const isCurrentPlayerAI = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer.name.toLowerCase().includes('ai') || 
           currentPlayer.name.toLowerCase().includes('computer') ||
           currentPlayer.name.toLowerCase().includes('bot');
  };

  // Get AI difficulty based on player name or default to medium
  const getAIDifficulty = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const name = currentPlayer.name.toLowerCase();
    if (name.includes('easy')) return 'easy';
    if (name.includes('hard')) return 'hard';
    return 'medium'; // default
  };

  // Generate a new sequence when the game starts
  useEffect(() => {
    if (!gameState.currentSequence) {
      generateNewSequence();
    }
  }, []);

  // Handle AI turn
  useEffect(() => {
    if (isCurrentPlayerAI() && currentPhase === 'waiting' && gameState.currentSequence) {
      handleAITurn();
    }
  }, [currentPhase, gameState.currentSequence]);

  const handleAITurn = () => {
    setIsAITurn(true);
    setAiThinking(true);
    
    const difficulty = getAIDifficulty();
    const aiConfig = AI_DIFFICULTY[difficulty];
    const thinkingTime = Math.random() * (aiConfig.thinkingTime[1] - aiConfig.thinkingTime[0]) + aiConfig.thinkingTime[0];
    
    // AI "thinks" for a random time
    setTimeout(() => {
      setAiThinking(false);
      startAISequence();
    }, thinkingTime);
  };

  const startAISequence = () => {
    setCurrentPhase('demo');
    setGameState(prev => ({
      ...prev,
      isSequencePlaying: true,
      currentMoveIndex: 0,
    }));
    
    // AI plays the sequence
    setTimeout(() => {
      playAISequence();
    }, 500);
  };

  const playAISequence = async () => {
    const playerIdx = gameState.currentPlayerIndex;
    const sequence = gameState.currentSequence;
    if (!sequence || !courtRef.current) return;
    
    let lastPos = null;
    for (const move of sequence.moves) {
      // Convert keyframes to Vector3s (court uses x, y as x, z)
      const waypoints = move.animation.keyframes.map(kf =>
        new Vector3(kf.position.x / 40 - 5, 1.1, kf.position.y / 60 - 5) // scale and center for Babylon
      );
      if (['dribble', 'crossover', 'spin'].includes(move.type)) {
        if (move.type === 'crossover') {
          // Use start and end positions for crossover
          const from = new Vector3(move.animation.startPosition.x / 40 - 5, 1.1, move.animation.startPosition.y / 60 - 5);
          const to = new Vector3(move.animation.endPosition.x / 40 - 5, 1.1, move.animation.endPosition.y / 60 - 5);
          await courtRef.current.animatePlayerCrossover(playerIdx, from, to);
          lastPos = to;
        } else if (move.type === 'spin') {
          // Use start and end positions for spin
          const from = new Vector3(move.animation.startPosition.x / 40 - 5, 1.1, move.animation.startPosition.y / 60 - 5);
          const to = new Vector3(move.animation.endPosition.x / 40 - 5, 1.1, move.animation.endPosition.y / 60 - 5);
          await courtRef.current.animatePlayerSpin(playerIdx, from, to);
          lastPos = to;
        } else {
          await courtRef.current.animatePlayerDribble(playerIdx, waypoints);
          lastPos = waypoints[waypoints.length - 1];
        }
      } else if (['shoot', 'jump', 'layup', 'step-back', 'euro-step', 'drive', 'dunk', 'reverse-dunk', 'windmill-dunk', 'tomahawk-dunk', 'between-legs-dunk', 'alley-oop-dunk'].includes(move.type)) {
        // Use start and end positions
        const from = new Vector3(move.animation.startPosition.x / 40 - 5, 1.1, move.animation.startPosition.y / 60 - 5);
        const to = new Vector3(move.animation.endPosition.x / 40 - 5, 1.1, move.animation.endPosition.y / 60 - 5);
        if (move.type === 'layup') {
          await courtRef.current.animatePlayerLayup(playerIdx, from, to);
        } else if (move.type === 'step-back') {
          await courtRef.current.animatePlayerStepBack(playerIdx, from, to);
        } else if (move.type === 'euro-step') {
          await courtRef.current.animatePlayerEuroStep(playerIdx, from, to);
        } else if (move.type === 'drive') {
          await courtRef.current.animatePlayerDrive(playerIdx, from, to);
        } else if (move.type === 'dunk') {
          await courtRef.current.animatePlayerDunk(playerIdx, from, to);
        } else if (move.type === 'reverse-dunk') {
          await courtRef.current.animatePlayerReverseDunk(playerIdx, from, to);
        } else if (move.type === 'windmill-dunk') {
          await courtRef.current.animatePlayerWindmillDunk(playerIdx, from, to);
        } else if (move.type === 'tomahawk-dunk') {
          await courtRef.current.animatePlayerTomahawkDunk(playerIdx, from, to);
        } else if (move.type === 'between-legs-dunk') {
          await courtRef.current.animatePlayerBetweenLegsDunk(playerIdx, from, to);
        } else if (move.type === 'alley-oop-dunk') {
          await courtRef.current.animatePlayerAlleyOopDunk(playerIdx, from, to);
        } else {
          await courtRef.current.animatePlayerJump(playerIdx, from, to);
        }
        lastPos = to;
      }
      // Update player position in state after each move
      if (lastPos) {
        setGameState(prev => {
          const updatedPlayers = [...prev.players];
          updatedPlayers[playerIdx] = {
            ...updatedPlayers[playerIdx],
            position: { x: lastPos.x, y: lastPos.z },
          };
          return { ...prev, players: updatedPlayers };
        });
      }
    }
    
    // AI sequence complete - determine success/failure
    setTimeout(() => {
      handleAISequenceComplete();
    }, 1000);
  };

  const handleAISequenceComplete = () => {
    const difficulty = getAIDifficulty();
    const aiConfig = AI_DIFFICULTY[difficulty];
    const accuracy = Math.random() * (aiConfig.accuracyRange[1] - aiConfig.accuracyRange[0]) + aiConfig.accuracyRange[0];
    const success = Math.random() < aiConfig.successRate;
    
    setSequenceAccuracy(accuracy);
    
    if (success) {
      // AI succeeded
      Vibration.vibrate([0, 100, 50, 100]);
      setJustEarnedLetters([]);
      Alert.alert(
        'AI Success!',
        `${gameState.players[gameState.currentPlayerIndex].name} successfully completed the sequence with ${Math.round(accuracy * 100)}% accuracy!`,
        [{ text: 'Continue', onPress: () => {
          setIsAITurn(false);
          nextPlayer();
        }}]
      );
    } else {
      // AI failed - gets a letter
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const newLetterIdx = currentPlayer.letters.length;
      const newLetters = [...currentPlayer.letters, gameState.gameWord[newLetterIdx]];
      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayerIndex] = {
        ...currentPlayer,
        letters: newLetters,
      };
      
      // Mark just earned letter for animation
      const jel = gameState.players.map((p, idx) => idx === gameState.currentPlayerIndex ? [newLetterIdx] : []);
      setJustEarnedLetters(jel);
      
      Alert.alert(
        'AI Failed!',
        `${gameState.players[gameState.currentPlayerIndex].name} failed the sequence with ${Math.round(accuracy * 100)}% accuracy and earned a letter!`,
        [{ text: 'Continue', onPress: () => {
          setIsAITurn(false);
          setGameState(prev => ({
            ...prev,
            players: updatedPlayers,
          }));
          nextPlayer();
        }}]
      );
    }
  };

  const generateNewSequence = () => {
    const difficulty = gameState.players[gameState.currentPlayerIndex].letters.length === 0 ? 'easy' : 
                     gameState.players[gameState.currentPlayerIndex].letters.length <= 2 ? 'medium' : 'hard';
    const sequenceLength = Math.min(2 + Math.floor(gameState.players[gameState.currentPlayerIndex].letters.length / 2), 5);
    
    const newSequence = generateRandomSequence(difficulty, sequenceLength);
    setGameState(prev => ({
      ...prev,
      currentSequence: newSequence,
      currentMoveIndex: 0,
      isSequencePlaying: false,
      isSequenceReplaying: false,
    }));
  };

  const playSequenceDemo = async () => {
    const playerIdx = gameState.currentPlayerIndex;
    const sequence = gameState.currentSequence;
    if (!sequence || !courtRef.current) return;
    let lastPos = null;
    for (const move of sequence.moves) {
      // Convert keyframes to Vector3s (court uses x, y as x, z)
      const waypoints = move.animation.keyframes.map(kf =>
        new Vector3(kf.position.x / 40 - 5, 1.1, kf.position.y / 60 - 5) // scale and center for Babylon
      );
      if (['dribble', 'crossover', 'spin'].includes(move.type)) {
        if (move.type === 'crossover') {
          // Use start and end positions for crossover
          const from = new Vector3(move.animation.startPosition.x / 40 - 5, 1.1, move.animation.startPosition.y / 60 - 5);
          const to = new Vector3(move.animation.endPosition.x / 40 - 5, 1.1, move.animation.endPosition.y / 60 - 5);
          await courtRef.current.animatePlayerCrossover(playerIdx, from, to);
          lastPos = to;
        } else if (move.type === 'spin') {
          // Use start and end positions for spin
          const from = new Vector3(move.animation.startPosition.x / 40 - 5, 1.1, move.animation.startPosition.y / 60 - 5);
          const to = new Vector3(move.animation.endPosition.x / 40 - 5, 1.1, move.animation.endPosition.y / 60 - 5);
          await courtRef.current.animatePlayerSpin(playerIdx, from, to);
          lastPos = to;
        } else {
          await courtRef.current.animatePlayerDribble(playerIdx, waypoints);
          lastPos = waypoints[waypoints.length - 1];
        }
      } else if (['shoot', 'jump', 'layup', 'step-back', 'euro-step', 'drive', 'dunk', 'reverse-dunk', 'windmill-dunk', 'tomahawk-dunk', 'between-legs-dunk', 'alley-oop-dunk'].includes(move.type)) {
        // Use start and end positions
        const from = new Vector3(move.animation.startPosition.x / 40 - 5, 1.1, move.animation.startPosition.y / 60 - 5);
        const to = new Vector3(move.animation.endPosition.x / 40 - 5, 1.1, move.animation.endPosition.y / 60 - 5);
        if (move.type === 'layup') {
          await courtRef.current.animatePlayerLayup(playerIdx, from, to);
        } else if (move.type === 'step-back') {
          await courtRef.current.animatePlayerStepBack(playerIdx, from, to);
        } else if (move.type === 'euro-step') {
          await courtRef.current.animatePlayerEuroStep(playerIdx, from, to);
        } else if (move.type === 'drive') {
          await courtRef.current.animatePlayerDrive(playerIdx, from, to);
        } else if (move.type === 'dunk') {
          await courtRef.current.animatePlayerDunk(playerIdx, from, to);
        } else if (move.type === 'reverse-dunk') {
          await courtRef.current.animatePlayerReverseDunk(playerIdx, from, to);
        } else if (move.type === 'windmill-dunk') {
          await courtRef.current.animatePlayerWindmillDunk(playerIdx, from, to);
        } else if (move.type === 'tomahawk-dunk') {
          await courtRef.current.animatePlayerTomahawkDunk(playerIdx, from, to);
        } else if (move.type === 'between-legs-dunk') {
          await courtRef.current.animatePlayerBetweenLegsDunk(playerIdx, from, to);
        } else if (move.type === 'alley-oop-dunk') {
          await courtRef.current.animatePlayerAlleyOopDunk(playerIdx, from, to);
        } else {
          await courtRef.current.animatePlayerJump(playerIdx, from, to);
        }
        lastPos = to;
      }
      // Update player position in state after each move
      if (lastPos) {
        setGameState(prev => {
          const updatedPlayers = [...prev.players];
          updatedPlayers[playerIdx] = {
            ...updatedPlayers[playerIdx],
            position: { x: lastPos.x, y: lastPos.z },
          };
          return { ...prev, players: updatedPlayers };
        });
      }
    }
    // After demo, call handleSequenceComplete(true)
    handleSequenceComplete(true);
  };

  const startSequenceDemo = () => {
    setCurrentPhase('demo');
    setGameState(prev => ({
      ...prev,
      isSequencePlaying: true,
      currentMoveIndex: 0,
    }));
    // Start the animation
    setTimeout(playSequenceDemo, 500); // slight delay for UI update
  };

  const handleMoveComplete = (moveIndex: number) => {
    setGameState(prev => ({
      ...prev,
      currentMoveIndex: moveIndex + 1,
    }));
  };

  const handleSequenceComplete = (success: boolean) => {
    if (currentPhase === 'demo') {
      // Demo completed, now player needs to replay
      setCurrentPhase('replay');
      setGameState(prev => ({
        ...prev,
        isSequencePlaying: false,
        currentMoveIndex: 0,
      }));
      
      // TODO: Add back alert dialog for production
      // Alert.alert(
      //   'Your Turn!',
      //   'Watch the sequence carefully and repeat it exactly. Tap "Start Replay" when you\'re ready.',
      //   [{ text: 'Start Replay', onPress: startPlayerReplay }]
      // );
      
      // Auto-start replay for testing
      setTimeout(() => {
        startPlayerReplay();
      }, 500);
    } else if (currentPhase === 'replay') {
      // Player replay completed
      const accuracy = calculateAccuracy();
      setSequenceAccuracy(accuracy);
      
      if (accuracy >= 0.8) {
        // Successful replay
        Vibration.vibrate([0, 100, 50, 100]);
        setJustEarnedLetters([]); // No new letter earned
        Alert.alert(
          'Great Shot!',
          `You successfully replicated the sequence with ${Math.round(accuracy * 100)}% accuracy!`,
          [{ text: 'Continue', onPress: nextPlayer }]
        );
      } else {
        // Failed replay - get a letter
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        const newLetterIdx = currentPlayer.letters.length;
        const newLetters = [...currentPlayer.letters, gameState.gameWord[newLetterIdx]];
        const updatedPlayers = [...gameState.players];
        updatedPlayers[gameState.currentPlayerIndex] = {
          ...currentPlayer,
          letters: newLetters,
        };
        // Mark just earned letter for animation
        const jel = gameState.players.map((p, idx) => idx === gameState.currentPlayerIndex ? [newLetterIdx] : []);
        setJustEarnedLetters(jel);
        setGameState(prev => ({
          ...prev,
          players: updatedPlayers,
        }));
        Vibration.vibrate([0, 200, 100, 200]);
        Alert.alert(
          'Missed!',
          `You got a letter! Current progress: ${newLetters.join('')}`,
          [{ text: 'Continue', onPress: () => { setJustEarnedLetters([]); nextPlayer(); } }]
        );
      }
    }
  };

  const playSequenceReplay = async () => {
    const playerIdx = gameState.currentPlayerIndex;
    const sequence = gameState.currentSequence;
    if (!sequence || !courtRef.current) return;
    let lastPos = null;
    for (const move of sequence.moves) {
      // Convert keyframes to Vector3s (court uses x, y as x, z)
      const waypoints = move.animation.keyframes.map(kf =>
        new Vector3(kf.position.x / 40 - 5, 1.1, kf.position.y / 60 - 5)
      );
      if (['dribble', 'crossover', 'spin'].includes(move.type)) {
        if (move.type === 'crossover') {
          // Use start and end positions for crossover
          const from = new Vector3(move.animation.startPosition.x / 40 - 5, 1.1, move.animation.startPosition.y / 60 - 5);
          const to = new Vector3(move.animation.endPosition.x / 40 - 5, 1.1, move.animation.endPosition.y / 60 - 5);
          await courtRef.current.animatePlayerCrossover(playerIdx, from, to);
          lastPos = to;
        } else if (move.type === 'spin') {
          // Use start and end positions for spin
          const from = new Vector3(move.animation.startPosition.x / 40 - 5, 1.1, move.animation.startPosition.y / 60 - 5);
          const to = new Vector3(move.animation.endPosition.x / 40 - 5, 1.1, move.animation.endPosition.y / 60 - 5);
          await courtRef.current.animatePlayerSpin(playerIdx, from, to);
          lastPos = to;
        } else {
          await courtRef.current.animatePlayerDribble(playerIdx, waypoints);
          lastPos = waypoints[waypoints.length - 1];
        }
      } else if (['shoot', 'jump', 'layup', 'step-back', 'euro-step', 'drive', 'dunk', 'reverse-dunk', 'windmill-dunk', 'tomahawk-dunk', 'between-legs-dunk', 'alley-oop-dunk'].includes(move.type)) {
        const from = new Vector3(move.animation.startPosition.x / 40 - 5, 1.1, move.animation.startPosition.y / 60 - 5);
        const to = new Vector3(move.animation.endPosition.x / 40 - 5, 1.1, move.animation.endPosition.y / 60 - 5);
        if (move.type === 'layup') {
          await courtRef.current.animatePlayerLayup(playerIdx, from, to);
        } else if (move.type === 'step-back') {
          await courtRef.current.animatePlayerStepBack(playerIdx, from, to);
        } else if (move.type === 'euro-step') {
          await courtRef.current.animatePlayerEuroStep(playerIdx, from, to);
        } else if (move.type === 'drive') {
          await courtRef.current.animatePlayerDrive(playerIdx, from, to);
        } else if (move.type === 'dunk') {
          await courtRef.current.animatePlayerDunk(playerIdx, from, to);
        } else if (move.type === 'reverse-dunk') {
          await courtRef.current.animatePlayerReverseDunk(playerIdx, from, to);
        } else if (move.type === 'windmill-dunk') {
          await courtRef.current.animatePlayerWindmillDunk(playerIdx, from, to);
        } else if (move.type === 'tomahawk-dunk') {
          await courtRef.current.animatePlayerTomahawkDunk(playerIdx, from, to);
        } else if (move.type === 'between-legs-dunk') {
          await courtRef.current.animatePlayerBetweenLegsDunk(playerIdx, from, to);
        } else if (move.type === 'alley-oop-dunk') {
          await courtRef.current.animatePlayerAlleyOopDunk(playerIdx, from, to);
        } else {
          await courtRef.current.animatePlayerJump(playerIdx, from, to);
        }
        lastPos = to;
      }
      // Update player position in state after each move
      if (lastPos) {
        setGameState(prev => {
          const updatedPlayers = [...prev.players];
          updatedPlayers[playerIdx] = {
            ...updatedPlayers[playerIdx],
            position: { x: lastPos.x, y: lastPos.z },
          };
          return { ...prev, players: updatedPlayers };
        });
      }
    }
    // After replay, call handleSequenceComplete(true) for now
    handleSequenceComplete(true);
  };

  const startPlayerReplay = () => {
    setGameState(prev => ({
      ...prev,
      isSequenceReplaying: true,
      currentMoveIndex: 0,
    }));
    // Start the replay animation
    setTimeout(playSequenceReplay, 500);
  };

  const calculateAccuracy = (): number => {
    // Simple accuracy calculation based on timing and sequence completion
    // In a real implementation, this would track actual player input
    return Math.random() * 0.4 + 0.6; // Random accuracy between 60-100%
  };

  const nextPlayer = () => {
    // Check if current player has lost (spelled gameWord)
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    let updatedPlayers = [...gameState.players];
    if (currentPlayer.letters.length >= gameState.gameWord.length) {
      // Mark player as eliminated
      updatedPlayers[gameState.currentPlayerIndex] = {
        ...currentPlayer,
        eliminated: true,
      };
    }
    // Check for game over (only one player not eliminated)
    const activePlayers = updatedPlayers.filter(p => !p.eliminated);
    if (activePlayers.length === 1) {
      // Game over - only one player remains
      navigation.navigate('Results', { gameState: { ...gameState, players: updatedPlayers } });
      return;
    }
    // Move to next non-eliminated player
    let nextPlayerIndex = gameState.currentPlayerIndex;
    do {
      nextPlayerIndex = (nextPlayerIndex + 1) % updatedPlayers.length;
    } while (updatedPlayers[nextPlayerIndex].eliminated);
    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
      currentSequence: undefined,
      currentMoveIndex: 0,
      isSequencePlaying: false,
      isSequenceReplaying: false,
    }));
    setCurrentPhase('waiting');
    setSequenceAccuracy(0);
    // Generate new sequence for next player
    setTimeout(() => {
      generateNewSequence();
    }, 1000);
  };

  const handleBackToMenu = () => {
    navigation.navigate('GameSetup', { gameState });
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Example positions for testing
  const ballStart = { x: 0, y: 0.3, z: 0 };
  const hoopPos = { x: 0, y: 1.5, z: 6.11 }; // courtDepth / 2 - 1

  return (
    <SafeAreaView style={styles.container}>
      
      <BabylonCourt
        ref={courtRef}
        currentSequence={gameState.currentSequence}
        currentMoveIndex={gameState.currentMoveIndex}
        isSequencePlaying={gameState.isSequencePlaying}
        isSequenceReplaying={gameState.isSequenceReplaying}
        onMoveComplete={handleMoveComplete}
        onSequenceComplete={handleSequenceComplete}
        camera={camera}
        onCameraInitialized={setCamera}
        players={gameState.players}
      />
      <ScoreboardOverlay
        playerNames={gameState.players.map(p => p.name)}
        playerLetters={gameState.players.map(p => p.letters)}
        playerAvatars={gameState.players.map(p => p.avatar)}
        activePlayerIndex={gameState.currentPlayerIndex}
        eliminatedPlayers={gameState.players.map(p => !!p.eliminated)}
        gameWord={gameState.gameWord || 'HORSE'}
        justEarnedLetters={justEarnedLetters}
        onBack={handleBackToMenu}
      />
      
      {/* AI Status Overlay */}
      {isAITurn && (
        <View style={styles.aiStatusContainer}>
          <View style={styles.aiStatusContent}>
            <Text style={styles.aiStatusText}>
              {aiThinking ? 'AI is thinking...' : 'AI is playing...'}
            </Text>
            {aiThinking && (
              <View style={styles.aiThinkingIndicator}>
                <Text style={styles.aiThinkingDots}>...</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Game Controls */}
      <View style={styles.gameControls}>
        {currentPhase === 'waiting' && !isAITurn && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startSequenceDemo}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Sequence</Text>
          </TouchableOpacity>
        )}
        
        {currentPhase === 'waiting' && isAITurn && (
          <View style={styles.aiWaitingContainer}>
            <Text style={styles.aiWaitingText}>
              {aiThinking ? 'AI is thinking...' : 'AI is playing...'}
            </Text>
          </View>
        )}
        
        {currentPhase === 'replay' && (
          <View style={styles.replayControls}>
            <TouchableOpacity
              style={styles.replayButton}
              onPress={startPlayerReplay}
              activeOpacity={0.8}
            >
              <Text style={styles.replayButtonText}>Replay Sequence</Text>
            </TouchableOpacity>
            <Text style={styles.instructionText}>
              Watch the sequence and repeat it exactly!
            </Text>
          </View>
        )}
      </View>

      {/* Development Test Buttons */}
      <View style={styles.testButtonsContainer}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            generateNewSequence();
            setTimeout(() => {
              startSequenceDemo();
            }, 1000);
          }}
        >
          <Text style={styles.testButtonText}>Test Full Flow</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            const from = new Vector3(-3, 1.1, 4);
            const to = new Vector3(0, 1.1, 6);
            courtRef.current?.animatePlayerDunk(0, from, to);
          }}
        >
          <Text style={styles.testButtonText}>Test Dunk</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            const positions = [
              new Vector3(-6, 1.1, 5),
              new Vector3(-2, 1.1, 4),
              new Vector3(2, 1.1, 4),
              new Vector3(6, 1.1, 5),
            ];
            courtRef.current?.animatePlayerDribble(0, positions);
          }}
        >
          <Text style={styles.testButtonText}>Test Dribble</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            const from = new Vector3(-3, 1.1, 4);
            const to = new Vector3(3, 1.1, 4);
            courtRef.current?.animatePlayerCrossover(0, from, to);
          }}
        >
          <Text style={styles.testButtonText}>Test Crossover</Text>
        </TouchableOpacity>
      </View>
      
      {/* Floating back-to-menu button */}
      <TouchableOpacity
        style={styles.fabBackButton}
        onPress={handleBackToMenu}
        activeOpacity={0.7}
      >
        <Text style={styles.fabBackButtonText}>←</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  gameControls: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  startButton: {
    backgroundColor: '#ffb347',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#ffb347',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  replayControls: {
    alignItems: 'center',
    gap: 12,
  },
  replayButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  replayButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  testButtonsContainer: {
    position: 'absolute',
    bottom: 220,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 9999,
  },
  testButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffb347',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fabBackButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30,30,30,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 9999,
  },
  fabBackButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -2,
  },
  aiStatusContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1001,
  },
  aiStatusContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiStatusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aiThinkingIndicator: {
    flexDirection: 'row',
  },
  aiThinkingDots: {
    color: '#ffb347',
    fontSize: 20,
    fontWeight: 'bold',
  },
  aiWaitingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
  },
  aiWaitingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});