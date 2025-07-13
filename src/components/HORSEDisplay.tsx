import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/designSystem';

interface HORSEDisplayProps {
  letters: string[];
  playerName: string;
}

export const HORSEDisplay: React.FC<HORSEDisplayProps> = ({ letters, playerName }) => {
  const horseLetters = ['H', 'O', 'R', 'S', 'E'];

  return (
    <View style={styles.container}>
      <Text style={styles.playerName}>{playerName}</Text>
      <View style={styles.lettersContainer}>
        {horseLetters.map((letter, index) => {
          const isEarned = letters.includes(letter);
          return (
            <View
              key={letter}
              style={[
                styles.letterSlot,
                isEarned ? styles.earnedLetter : styles.pendingLetter,
              ]}
            >
              <Text
                style={[
                  styles.letterText,
                  isEarned ? styles.earnedLetterText : styles.pendingLetterText,
                ]}
              >
                {letter}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.m,
  },
  playerName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  lettersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterSlot: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  earnedLetter: {
    backgroundColor: Colors.primaryAccent,
  },
  pendingLetter: {
    backgroundColor: Colors.border,
  },
  letterText: {
    ...Typography.h3,
    fontWeight: 'bold',
  },
  earnedLetterText: {
    color: Colors.textPrimary,
  },
  pendingLetterText: {
    color: Colors.textSecondary,
  },
});
