import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreboardOverlayProps {
  playerNames: string[]; // [player1, player2]
  playerLetters: string[][]; // [['H','O'], ['H','O','R']]
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

const ScoreboardOverlay: React.FC<ScoreboardOverlayProps> = ({ playerNames, playerLetters }) => {
  // Determine if either player needs small mode
  const needsSmall = playerNames.some(name => getSmallMode(name));
  return (
    <View style={styles.overlayContainer}>
      <Text style={{color: 'yellow', fontSize: 14}}>
        playerNames: {JSON.stringify(playerNames)}
        playerLetters: {JSON.stringify(playerLetters)}
      </Text>
      <Text style={{color: 'red', fontSize: 32}}>VISIBLE TEST</Text>
      <View style={{ flexDirection: 'column', width: '100%' }}>
        {/* Player 1 Row */}
        <View style={[styles.row, { marginBottom: 12 }]}> 
          {playerNames[0] && needsSmall ? (
            <View style={styles.nameAboveRow}><Text style={[styles.playerName, styles.playerNameSmall]} numberOfLines={1} ellipsizeMode="tail">{playerNames[0].length > 16 ? playerNames[0].slice(0, 15) + '…' : playerNames[0]}</Text></View>
          ) : null}
          <View style={[styles.lettersRow, playerNames[0] && needsSmall ? { marginTop: 2 } : {}]}>
            {HORSE.map((letter, i) => {
              const small = needsSmall;
              const { LED_SIZE, LED_SPACING, LETTER_WIDTH, LETTER_HEIGHT } = getLetterDims(small);
              return (
                <View key={letter + i} style={{ width: LETTER_WIDTH, height: LETTER_HEIGHT, marginHorizontal: 0 }}>
                  {DOT_MATRIX[letter].map((row, rowIdx) => (
                    <View key={rowIdx} style={{ flexDirection: 'row', justifyContent: 'center', height: LED_SIZE + 1 }}>
                      {row.map((on, colIdx) => (
                        <View
                          key={colIdx}
                          style={[
                            styles.led,
                            small ? styles.ledSmall : null,
                            playerLetters[0] && playerLetters[0].includes(letter) && on
                              ? styles.ledOn
                              : on
                              ? styles.ledOff
                              : styles.ledEmpty,
                          ]}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </View>
        {/* Player 2 Row */}
        <View style={styles.row}> 
          {playerNames[1] && needsSmall ? (
            <View style={styles.nameAboveRow}><Text style={[styles.playerName, styles.playerNameSmall]} numberOfLines={1} ellipsizeMode="tail">{playerNames[1].length > 16 ? playerNames[1].slice(0, 15) + '…' : playerNames[1]}</Text></View>
          ) : null}
          <View style={[styles.lettersRow, playerNames[1] && needsSmall ? { marginTop: 2 } : {}]}>
            {HORSE.map((letter, i) => {
              const small = needsSmall;
              const { LED_SIZE, LED_SPACING, LETTER_WIDTH, LETTER_HEIGHT } = getLetterDims(small);
              return (
                <View key={letter + i} style={{ width: LETTER_WIDTH, height: LETTER_HEIGHT, marginHorizontal: 0 }}>
                  {DOT_MATRIX[letter].map((row, rowIdx) => (
                    <View key={rowIdx} style={{ flexDirection: 'row', justifyContent: 'center', height: LED_SIZE + 1 }}>
                      {row.map((on, colIdx) => (
                        <View
                          key={colIdx}
                          style={[
                            styles.led,
                            small ? styles.ledSmall : null,
                            playerLetters[1] && playerLetters[1].includes(letter) && on
                              ? styles.ledOn
                              : on
                              ? styles.ledOff
                              : styles.ledEmpty,
                          ]}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    // position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: 'auto',
    minHeight: 220, // TEMP: ensure both rows are visible
    zIndex: 10,
    // pointerEvents: 'none',
  },
  row: {
    position: 'relative',
    left: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    // paddingHorizontal: 32, // Remove padding
    overflow: 'visible',
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
    minWidth: 80,
    textAlign: 'left',
    fontFamily: 'Menlo', // Monospace/digital look
  },
  playerNameSmall: {
    fontSize: 14,
    marginRight: 6,
    minWidth: 60,
  },
  nameAboveRow: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 0,
    marginLeft: 0,
  },
  lettersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    backgroundColor: 'rgba(0,255,0,0.1)', // TEMP: for debugging
    minHeight: 32, // TEMP: ensure enough space for letters
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
});

export default ScoreboardOverlay; 