import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScoreboardOverlayProps {
  playerNames: string[];
  playerLetters: string[][];
  playerAvatars: string[];
  activePlayerIndex: number;
  onBack: () => void;
  eliminatedPlayers?: boolean[];
  gameWord: string;
  justEarnedLetters?: number[][]; // Array of arrays of indices for just-earned letters per player
}

const HORSE = ['H', 'O', 'R', 'S', 'E'];

// Dot-matrix patterns for each letter (5x7 grid, no dot row)
const DOT_MATRIX: Record<string, number[][]> = {
  'H': [
    [1,0,1],
    [1,0,1],
    [1,1,1],
    [1,0,1],
    [1,0,1],
    [0,0,0],
    [0,0,0],
  ],
  'O': [
    [0,1,0],
    [1,0,1],
    [1,0,1],
    [1,0,1],
    [0,1,0],
    [0,0,0],
    [0,0,0],
  ],
  'R': [
    [1,1,0],
    [1,0,1],
    [1,1,0],
    [1,0,1],
    [1,0,1],
    [0,0,0],
    [0,0,0],
  ],
  'S': [
    [0,1,1],
    [1,0,0],
    [0,1,0],
    [0,0,1],
    [1,1,0],
    [0,0,0],
    [0,0,0],
  ],
  'E': [
    [1,1,1],
    [1,0,0],
    [1,1,0],
    [1,0,0],
    [1,1,1],
    [0,0,0],
    [0,0,0],
  ],
};

const BASE_LED_SIZE = 7;
const BASE_LED_SPACING = 4;
const SMALL_LED_SIZE = 5;
const SMALL_LED_SPACING = 2;
const getLetterDims = (small: boolean) => {
  const LED_SIZE = small ? SMALL_LED_SIZE : BASE_LED_SIZE;
  const LED_SPACING = small ? SMALL_LED_SPACING : BASE_LED_SPACING;
  return {
    LED_SIZE,
    LED_SPACING,
    LETTER_WIDTH: 3 * (LED_SIZE + LED_SPACING),
    LETTER_HEIGHT: 7 * (LED_SIZE + 1),
  };
};

const MAX_ROW_WIDTH = 320; // Adjust as needed for your scoreboard image/overlay

const getSmallMode = (name: string) => {
  const normalDims = getLetterDims(false);
  const nameWidth = Math.max(80, name.length * 11); // rough estimate
  const normalRowWidth = nameWidth + 8 + 5 * normalDims.LETTER_WIDTH;
  return name.length > 10 || normalRowWidth > MAX_ROW_WIDTH;
};

const usePulse = (isActive: boolean) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [isActive]);
  return pulse;
};

const ScoreboardOverlay: React.FC<ScoreboardOverlayProps> = ({ playerNames, playerLetters, playerAvatars, activePlayerIndex, onBack, eliminatedPlayers, gameWord, justEarnedLetters }) => {
  const insets = useSafeAreaInsets();

  // Animated values for each player's letters
  const animRefs = useRef(playerNames.map(() => Array(gameWord.length).fill(null).map(() => new Animated.Value(0))));

  useEffect(() => {
    if (justEarnedLetters) {
      justEarnedLetters.forEach((indices, pIdx) => {
        indices.forEach(i => {
          if (animRefs.current[pIdx] && animRefs.current[pIdx][i]) {
            animRefs.current[pIdx][i].setValue(1);
            // Keep the highlight instead of fading it out
            // Animated.sequence([
            //   Animated.timing(animRefs.current[pIdx][i], { toValue: 0, duration: 600, useNativeDriver: false })
            // ]).start();
          }
        });
      });
    }
  }, [justEarnedLetters, gameWord]);

  return (
    <View style={[styles.overlayContainer, { paddingTop: insets.top }]}>  
      {playerNames.map((name, idx) => {
        const isActive = idx === activePlayerIndex;
        const letters = playerLetters[idx] || [];
        const isEliminated = eliminatedPlayers ? eliminatedPlayers[idx] : false;
        const pulse = usePulse(isActive);
        return (
          <Animated.View
            key={name}
            style={[
              styles.row,
              isActive && styles.activeRow,
              isEliminated && styles.eliminatedRow,
              isActive && { transform: [{ scale: pulse }] },
              styles.rowShadow,
            ]}
          >
            {/* Current turn indicator */}
            {isActive && <Text style={styles.turnArrow}>▶</Text>}
            <Image source={playerAvatars[idx]} style={styles.avatar} />
            <Text style={[styles.playerName, isActive && styles.activePlayerName, isEliminated && styles.eliminatedText]}>{name}</Text>
            <View style={styles.lettersRow}>
              {Array.from(gameWord).map((char, i) => {
                const earned = !!letters[i];
                const anim = animRefs.current[idx][i];
                
                // For earned letters, always use the highlight color
                const letterColor = earned ? '#FF1744' : '#EAF6FF';
                
                // Animate scale for earned letter
                const scale = anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.3],
                });
                
                return (
                  <Animated.Text
                    key={i}
                    style={[
                      styles.letter,
                      earned ? styles.letterOn : styles.letterOff,
                      isEliminated && styles.eliminatedText,
                      { color: letterColor, transform: [{ scale }] },
                    ]}
                  >
                    {char}
                  </Animated.Text>
                );
              })}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#222',
    borderBottomWidth: 3,
    borderBottomColor: '#FFD700',
    zIndex: 9999,
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EAF6FF',
    letterSpacing: 1.5,
    textShadowColor: '#222',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginRight: 8,
    textAlign: 'left',
    fontFamily: 'Menlo',
  },
  playerNameSmall: {
    fontSize: 14,
    marginRight: 6,
  },
  lettersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  led: {
    width: BASE_LED_SIZE,
    height: BASE_LED_SIZE,
    borderRadius: BASE_LED_SIZE / 2,
    marginHorizontal: 1,
    marginVertical: 0.5,
  },
  ledOn: {
    backgroundColor: '#FF2C1A',
    shadowColor: '#FF2C1A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },
  ledOff: {
    backgroundColor: '#EAF6FF',
    opacity: 0.3,
  },
  ledEmpty: {
    backgroundColor: 'transparent',
  },
  ledSmall: {
    width: SMALL_LED_SIZE,
    height: SMALL_LED_SIZE,
    borderRadius: SMALL_LED_SIZE / 2,
  },
  activeRow: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
  },
  activePlayerName: {
    color: '#FFD700',
    fontWeight: 'bold',
    textShadowColor: '#222',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  letter: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 2,
    letterSpacing: 2,
  },
  letterOn: {
    color: '#FF1744', // Neon red
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12, // Stronger glow
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  letterOff: {
    color: '#EAF6FF',
    opacity: 0.3,
  },
  eliminatedRow: {
    opacity: 0.4,
  },
  eliminatedText: {
    opacity: 0.4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#fff',
  },
  rowShadow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  turnArrow: {
    fontSize: 22,
    color: '#FFD700',
    marginRight: 6,
    fontWeight: 'bold',
    textShadowColor: '#222',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default ScoreboardOverlay; 