import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Layout, BorderRadius, Shadows, Spacing } from '../constants/designSystem';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'standard' | 'player' | 'stat';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'standard',
}) => {
  const cardStyle = [
    styles.card,
    variant === 'player' && styles.playerCard,
    variant === 'stat' && styles.statCard,
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.medium,
    padding: Layout.cardPadding,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playerCard: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCard: {
    minWidth: 100,
    padding: Spacing.s,
    alignItems: 'center',
  },
});
