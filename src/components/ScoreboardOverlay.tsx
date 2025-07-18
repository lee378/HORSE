import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScoreboardOverlayProps {
  playerNames: string[];
  playerLetters: string[][];
  activePlayerIndex: number;
  onBack: () => void;
  eliminatedPlayers?: boolean[];
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

const ScoreboardOverlay: React.FC<ScoreboardOverlayProps> = ({ playerNames, playerLetters, activePlayerIndex, onBack, eliminatedPlayers }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.overlayContainer, { paddingTop: insets.top }]}>  
      {playerNames.map((name, idx) => {
        const isActive = idx === activePlayerIndex;
        const letters = playerLetters[idx] || [];
        const isEliminated = eliminatedPlayers ? eliminatedPlayers[idx] : false;
        return (
          <View key={name} style={[styles.row, isActive && styles.activeRow, isEliminated && styles.eliminatedRow]}>  
            <Text style={[styles.playerName, isActive && styles.activePlayerName, isEliminated && styles.eliminatedText]}>{name}</Text>
            <View style={styles.lettersRow}>
              {[0,1,2,3,4].map(i => (
                <Text key={i} style={[styles.letter, letters[i] ? styles.letterOn : styles.letterOff, isEliminated && styles.eliminatedText]}>
                  {HORSE[i]}
                </Text>
              ))}
            </View>
          </View>
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
    backgroundColor: 'rgba(255, 0, 0, 1)', // TEMPORARY: Solid red for maximum visibility
    zIndex: 9999, // Very high zIndex
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: 'center',
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
});

export default ScoreboardOverlay; 