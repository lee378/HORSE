import React, { useState, useEffect } from 'react';
import { Vibration, 
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Vibration,  Button } from '../components/Button';
import { Vibration,  HORSEDisplay } from '../components/HORSEDisplay';
import { Vibration,  Colors, Typography, Layout, Spacing, BorderRadius } from '../constants/designSystem';
import { Vibration,  GameState, Player } from '../types';

interface GameplayProps {
  navigation: any;
  route: { params: { gameState: GameState } };
}

const { width: screenWidth } = Dimensions.get('window');

export const Gameplay: React.FC<GameplayProps> = ({ navigation, route }) => {
  const { gameState: initialGameState } = route.params;
  const [gameState, setGameState] = useState(initialGameState);
  const [shotMeter, setShotMeter] = useState(0);
  const [isShooting, setIsShooting] = useState(false);
  const [shotAnimation] = useState(new Animated.Value(0));

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const handleShot = () => {
    if (isShooting) return;
    
    setIsShooting(true);
    Vibration.vibrate(100);
    
    // Simulate shot result (random for now)
    const made = Math.random() > 0.5;
    
    if (made) {
      Vibration.vibrate([0, 100, 50, 100]);
    } else {
      Vibration.vibrate([0, 200]);
    }

    // Animate shot
    Animated.sequence([
      Animated.timing(shotAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(shotAnimation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    // Update game state
    setTimeout(() => {
      const newPlayers = [...gameState.players];
      const currentPlayerIndex = gameState.currentPlayerIndex;
      
      if (made) {
        // Player made the shot, next player needs to make the same shot
        newPlayers[currentPlayerIndex].score += 1;
      } else {
        // Player missed, give them a letter
        const letters = ['H', 'O', 'R', 'S', 'E'];
        const currentLetters = newPlayers[currentPlayerIndex].letters;
        const nextLetterIndex = currentLetters.length;
        
        if (nextLetterIndex < letters.length) {
          newPlayers[currentPlayerIndex].letters.push(letters[nextLetterIndex]);
        }
      }

      // Check if game is over
      const eliminatedPlayers = newPlayers.filter(player => player.letters.length >= 5);
      if (eliminatedPlayers.length >= newPlayers.length - 1) {
        // Game over
        navigation.navigate('Results', { gameState: { ...gameState, players: newPlayers } });
        return;
      }

      // Move to next player
      const nextPlayerIndex = (currentPlayerIndex + 1) % newPlayers.length;
      newPlayers[currentPlayerIndex].isCurrentPlayer = false;
      newPlayers[nextPlayerIndex].isCurrentPlayer = true;

      setGameState({
        ...gameState,
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
      });

      setIsShooting(false);
    }, 1500);
  };

  const shotMeterAnimation = shotAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View
        
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.roundText}>Round {gameState.roundNumber}</Text>
          <Text style={styles.playerText}>{currentPlayer.name}'s Turn</Text>
        </View>

        <View style={styles.gameArea}>
          {/* Court View */}
          <View style={styles.court}>
            <View style={styles.hoop}>
              <View style={styles.rim} />
            </View>
            <Animated.View
              style={[
                styles.basketball,
                {
                  transform: [
                    {
                      translateY: shotAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -200],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* Shot Meter */}
          <View style={styles.shotMeterContainer}>
            <View style={styles.shotMeter}>
              <Animated.View
                style={[
                  styles.shotMeterFill,
                  {
                    width: shotMeterAnimation,
                  },
                ]}
              />
            </View>
            <Text style={styles.shotMeterText}>Power: {Math.round(shotMeter)}%</Text>
          </View>
        </View>

        <View style={styles.playersContainer}>
          {gameState.players.map((player) => (
            <HORSEDisplay
              key={player.id}
              letters={player.letters}
              playerName={player.name}
            />
          ))}
        </View>

        <View style={styles.controls}>
          <Button
            title="Shoot!"
            onPress={handleShot}
            disabled={isShooting}
            style={styles.shootButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.m,
  },
  roundText: {
    ...Typography.h3,
    color: Colors.textSecondary,
  },
  playerText: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  court: {
    width: screenWidth * 0.8,
    height: 300,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  hoop: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: Colors.primaryAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rim: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primaryAccent,
  },
  basketball: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryAccent,
    position: 'absolute',
    bottom: 50,
  },
  shotMeterContainer: {
    marginTop: Spacing.l,
    alignItems: 'center',
  },
  shotMeter: {
    width: 200,
    height: 20,
    backgroundColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  shotMeterFill: {
    height: '100%',
    backgroundColor: Colors.primaryAccent,
    borderRadius: 10,
  },
  shotMeterText: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  playersContainer: {
    paddingHorizontal: Layout.screenMargin,
    marginBottom: Spacing.l,
  },
  controls: {
    paddingHorizontal: Layout.screenMargin,
    paddingBottom: Spacing.l,
  },
  shootButton: {
    height: 80,
  },
});
