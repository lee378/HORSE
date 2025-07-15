import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Vibration, Alert, Image } from 'react-native';
import ScoreboardOverlay from '../components/ScoreboardOverlay';
import { Button } from '../components/Button';
import { HORSEDisplay } from '../components/HORSEDisplay';
import { BasketballCourt } from '../components/BasketballCourt';
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
    if (currentPlayer.letters.length >= 5) {
      // Game over - current player loses
      navigation.navigate('Results', { gameState });
      return;
    }

    // Move to next player
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    setGameState(prev => ({
      ...prev,
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
    navigation.navigate('MainMenu');
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button title="Back to Menu" onPress={handleBackToMenu} />
      </View>

      {/* Pure overlay scoreboard at the top */}
      <View style={{
        width: '100%',
        height: 120,
        backgroundColor: '#181A1B',
        borderRadius: 18,
        marginBottom: 8,
        marginTop: 8,
        alignSelf: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <ScoreboardOverlay
          playerNames={gameState.players.map(p => p.name)}
          playerLetters={gameState.players.map(p => p.letters)}
        />
      </View>

      <View style={styles.courtContainer}>
        <BasketballCourt />
      </View>

      <View style={styles.controls}>
        {currentPhase === 'waiting' && gameState.currentSequence && (
          <Button
            title="Start Sequence Demo"
            onPress={startSequenceDemo}
            style={styles.startButton}
          />
        )}
        {sequenceAccuracy > 0 && (
          <View style={styles.accuracyDisplay}>
            <Text style={styles.accuracyText}>
              Accuracy: {Math.round(sequenceAccuracy * 100)}%
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  gameInfo: {
    padding: Spacing.m,
    alignItems: 'center',
  },
  playerTurn: {
    ...Typography.h2,
    color: Colors.primaryAccent,
    marginBottom: Spacing.s,
  },
  phaseText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  courtContainer: {
    flex: 1,
    margin: Spacing.m,
  },
  controls: {
    padding: Spacing.m,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: Colors.primaryAccent,
    minWidth: 200,
  },
  accuracyDisplay: {
    marginTop: Spacing.m,
    padding: Spacing.s,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.small,
  },
  accuracyText: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
}); 