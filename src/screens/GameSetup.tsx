import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Colors, Typography, Layout, Spacing, BorderRadius } from '../constants/designSystem';

interface GameSetupProps {
  navigation: any;
}

export const GameSetup: React.FC<GameSetupProps> = ({ navigation }) => {
  const [players, setPlayers] = useState([
    { id: '1', name: 'Player 1', letters: [] },
    { id: '2', name: 'Player 2', letters: [] },
  ]);
  const [maxRounds, setMaxRounds] = useState(5);

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([
        ...players,
        { id: String(players.length + 1), name: `Player ${players.length + 1}`, letters: [] },
      ]);
    }
  };

  const removePlayer = (id: string) => {
    if (players.length > 2) {
      setPlayers(players.filter(player => player.id !== id));
    }
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, name } : player
    ));
  };

  const startGame = () => {
    const gameState = {
      players: players.map(player => ({
        ...player,
        score: 0,
        isCurrentPlayer: false,
      })),
      currentPlayerIndex: 0,
      gamePhase: 'gameplay' as const,
      roundNumber: 1,
      maxRounds,
      gameMode: 'multiplayer' as const,
    };
    
    gameState.players[0].isCurrentPlayer = true;
    
    navigation.navigate('Gameplay', { gameState });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Game Setup</Text>
          
          <Card style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Players</Text>
            {players.map((player, index) => (
              <View key={player.id} style={styles.playerRow}>
                <TextInput
                  style={styles.playerInput}
                  value={player.name}
                  onChangeText={(name) => updatePlayerName(player.id, name)}
                  placeholder="Player name"
                  placeholderTextColor={Colors.placeholder}
                />
                {players.length > 2 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePlayer(player.id)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {players.length < 4 && (
              <Button
                title="Add Player"
                onPress={addPlayer}
                variant="secondary"
                style={styles.addButton}
              />
            )}
          </Card>

          <Card style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Game Settings</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Max Rounds:</Text>
              <View style={styles.roundsContainer}>
                {[3, 5, 7, 10].map((rounds) => (
                  <TouchableOpacity
                    key={rounds}
                    style={[
                      styles.roundButton,
                      maxRounds === rounds && styles.roundButtonActive,
                    ]}
                    onPress={() => setMaxRounds(rounds)}
                  >
                    <Text
                      style={[
                        styles.roundButtonText,
                        maxRounds === rounds && styles.roundButtonTextActive,
                      ]}
                    >
                      {rounds}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>

          <Button
            title="Start Game"
            onPress={startGame}
            style={styles.startButton}
          />
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
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  settingsCard: {
    marginBottom: Spacing.l,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  playerInput: {
    flex: 1,
    height: Layout.inputFieldHeight,
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: BorderRadius.small,
    paddingHorizontal: Spacing.m,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.s,
  },
  removeButtonText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: Spacing.s,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  roundsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roundButtonActive: {
    backgroundColor: Colors.primaryAccent,
    borderColor: Colors.primaryAccent,
  },
  roundButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  roundButtonTextActive: {
    color: Colors.textPrimary,
  },
  startButton: {
    marginTop: Spacing.xl,
  },
});
