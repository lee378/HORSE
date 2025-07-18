import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Vibration, Alert, Image, TouchableOpacity } from 'react-native';
import { EngineView } from '@babylonjs/react-native';
import { ArcRotateCamera } from '@babylonjs/core';
import ScoreboardOverlay from '../components/ScoreboardOverlay';

import { HORSEDisplay } from '../components/HORSEDisplay';
import BabylonCourt from '../components/BabylonCourt';

import { Colors, Typography, Spacing, BorderRadius } from '../constants/designSystem';
import { GameState, GameSequence } from '../types';
import { GAME_SEQUENCES, generateRandomSequence } from '../constants/basketballMoves';

interface GameplayProps {
  navigation: any;
  route: { params: { gameState: GameState } };
}

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

  // Generate a new sequence when the game starts
  useEffect(() => {
    if (!gameState.currentSequence) {
      generateNewSequence();
    }
  }, []);

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

  const startSequenceDemo = () => {
    setCurrentPhase('demo');
    setGameState(prev => ({
      ...prev,
      isSequencePlaying: true,
      currentMoveIndex: 0,
    }));
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
      
      // Show instructions for replay
      Alert.alert(
        'Your Turn!',
        'Watch the sequence carefully and repeat it exactly. Tap "Start Replay" when you\'re ready.',
        [{ text: 'Start Replay', onPress: startPlayerReplay }]
      );
    } else if (currentPhase === 'replay') {
      // Player replay completed
      const accuracy = calculateAccuracy();
      setSequenceAccuracy(accuracy);
      
      if (accuracy >= 0.8) {
        // Successful replay
        Vibration.vibrate([0, 100, 50, 100]);
        Alert.alert(
          'Great Shot!',
          `You successfully replicated the sequence with ${Math.round(accuracy * 100)}% accuracy!`,
          [{ text: 'Continue', onPress: nextPlayer }]
        );
      } else {
        // Failed replay - get a letter
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        const newLetters = [...currentPlayer.letters, 'HORSE'[currentPlayer.letters.length]];
        
        const updatedPlayers = [...gameState.players];
        updatedPlayers[gameState.currentPlayerIndex] = {
          ...currentPlayer,
          letters: newLetters,
        };
        
        setGameState(prev => ({
          ...prev,
          players: updatedPlayers,
        }));
        
Vibration.vibrate([0, 200, 100, 200]);
        Alert.alert(
          'Missed!',
          `You got a letter! Current progress: ${newLetters.join('')}`,
          [{ text: 'Continue', onPress: nextPlayer }]
        );
      }
    }
  };

  const startPlayerReplay = () => {
    setGameState(prev => ({
      ...prev,
      isSequenceReplaying: true,
      currentMoveIndex: 0,
    }));
  };

  const calculateAccuracy = (): number => {
    // Simple accuracy calculation based on timing and sequence completion
    // In a real implementation, this would track actual player input
    return Math.random() * 0.4 + 0.6; // Random accuracy between 60-100%
  };

  const nextPlayer = () => {
    // Check if current player has lost (spelled HORSE)
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    let updatedPlayers = [...gameState.players];
    if (currentPlayer.letters.length >= 5) {
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

  return (
    <SafeAreaView style={styles.container}>
      
      <BabylonCourt
        currentSequence={gameState.currentSequence}
        currentMoveIndex={gameState.currentMoveIndex}
        isSequencePlaying={gameState.isSequencePlaying}
        isSequenceReplaying={gameState.isSequenceReplaying}
        onMoveComplete={handleMoveComplete}
        onSequenceComplete={handleSequenceComplete}
        camera={camera}
        onCameraInitialized={setCamera}
      />
      <ScoreboardOverlay
        playerNames={gameState.players.map(p => p.name)}
        playerLetters={gameState.players.map(p => p.letters)}
        activePlayerIndex={gameState.currentPlayerIndex}
        eliminatedPlayers={gameState.players.map(p => !!p.eliminated)}
        onBack={handleBackToMenu}
      />
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
  fabBackButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30,30,30,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  fabBackButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -2,
  },
});