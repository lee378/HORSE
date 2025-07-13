import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { HORSEDisplay } from '../components/HORSEDisplay';
import { Colors, Typography, Layout, Spacing } from '../constants/designSystem';
import { GameState } from '../types';

interface ResultsProps {
  navigation: any;
  route: { params: { gameState: GameState } };
}

export const Results: React.FC<ResultsProps> = ({ navigation, route }) => {
  const { gameState } = route.params;
  
  // Determine winner (player with least letters)
  const sortedPlayers = [...gameState.players].sort((a, b) => {
    if (a.letters.length === b.letters.length) {
      return b.score - a.score; // Higher score wins if same letters
    }
    return a.letters.length - b.letters.length; // Fewer letters wins
  });
  
  const winner = sortedPlayers[0];

  return (
    <SafeAreaView style={styles.container}>
      <View
        
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Game Results</Text>
            <Text style={styles.winnerText}>Winner: {winner.name}</Text>
          </View>

          <Card style={styles.resultsCard}>
            <Text style={styles.sectionTitle}>Final Standings</Text>
            {sortedPlayers.map((player, index) => (
              <View key={player.id} style={styles.playerResult}>
                <View style={styles.playerInfo}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                  <Text style={styles.playerName}>{player.name}</Text>
                </View>
                <View style={styles.playerStats}>
                  <Text style={styles.statText}>Score: {player.score}</Text>
                  <Text style={styles.statText}>Letters: {player.letters.length}/5</Text>
                </View>
              </View>
            ))}
          </Card>

          <Card style={styles.resultsCard}>
            <Text style={styles.sectionTitle}>H.O.R.S.E. Progress</Text>
            {gameState.players.map((player) => (
              <HORSEDisplay
                key={player.id}
                letters={player.letters}
                playerName={player.name}
              />
            ))}
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              title="Play Again"
              onPress={() => navigation.navigate('GameSetup')}
              style={styles.button}
            />
            <Button
              title="Main Menu"
              onPress={() => navigation.navigate('MainMenu')}
              variant="secondary"
              style={styles.button}
            />
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Layout.screenMargin,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.s,
  },
  winnerText: {
    ...Typography.h2,
    color: Colors.success,
    textAlign: 'center',
  },
  resultsCard: {
    marginBottom: Spacing.l,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },
  playerResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankText: {
    ...Typography.h3,
    color: Colors.primaryAccent,
    marginRight: Spacing.s,
  },
  playerName: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  playerStats: {
    alignItems: 'flex-end',
  },
  statText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    gap: Spacing.m,
  },
  button: {
    marginBottom: Spacing.s,
  },
});
