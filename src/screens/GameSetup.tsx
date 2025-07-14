import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Colors, Typography, Layout, Spacing, BorderRadius } from '../constants/designSystem';
import { GameSettings } from '../types';

interface GameSetupProps {
  navigation: any;
}

export const GameSetup: React.FC<GameSetupProps> = ({ navigation }) => {
  const [players, setPlayers] = useState([
    { id: '1', name: 'Player 1', letters: [], position: { x: 200, y: 500 } },
    { id: '2', name: 'Player 2', letters: [], position: { x: 200, y: 500 } },
  ]);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    numberOfPlayers: 2,
    maxRounds: 5,
    difficulty: 'medium',
    soundEnabled: true,
    hapticEnabled: true,
    sequenceLength: 3,
    showHints: true,
  });

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([
        ...players,
        { 
          id: String(players.length + 1), 
          name: `Player ${players.length + 1}`, 
          letters: [],
          position: { x: 200, y: 500 }
        },
      ]);
      setGameSettings(prev => ({ ...prev, numberOfPlayers: players.length + 1 }));
    }
  };

  const removePlayer = (id: string) => {
    if (players.length > 2) {
      setPlayers(players.filter(player => player.id !== id));
      setGameSettings(prev => ({ ...prev, numberOfPlayers: players.length - 1 }));
    }
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, name } : player
    ));
  };

  const updateGameSetting = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    setGameSettings(prev => ({ ...prev, [key]: value }));
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
      maxRounds: gameSettings.maxRounds,
      gameMode: 'multiplayer' as const,
      currentSequence: undefined,
      sequenceStep: 0,
      isSequencePlaying: false,
      isSequenceReplaying: false,
      currentMoveIndex: 0,
    };
    
    gameState.players[0].isCurrentPlayer = true;
    
    navigation.navigate('Gameplay', { gameState });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradient}>
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
              <Text style={styles.settingLabel}>Difficulty:</Text>
              <View style={styles.optionsContainer}>
                {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.optionButton,
                      gameSettings.difficulty === difficulty && styles.optionButtonActive,
                    ]}
                    onPress={() => updateGameSetting('difficulty', difficulty)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        gameSettings.difficulty === difficulty && styles.optionButtonTextActive,
                      ]}
                    >
                      {difficulty.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sequence Length:</Text>
              <View style={styles.optionsContainer}>
                {[2, 3, 4, 5].map((length) => (
                  <TouchableOpacity
                    key={length}
                    style={[
                      styles.optionButton,
                      gameSettings.sequenceLength === length && styles.optionButtonActive,
                    ]}
                    onPress={() => updateGameSetting('sequenceLength', length)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        gameSettings.sequenceLength === length && styles.optionButtonTextActive,
                      ]}
                    >
                      {length}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Max Rounds:</Text>
              <View style={styles.optionsContainer}>
                {[3, 5, 7, 10].map((rounds) => (
                  <TouchableOpacity
                    key={rounds}
                    style={[
                      styles.optionButton,
                      gameSettings.maxRounds === rounds && styles.optionButtonActive,
                    ]}
                    onPress={() => updateGameSetting('maxRounds', rounds)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        gameSettings.maxRounds === rounds && styles.optionButtonTextActive,
                      ]}
                    >
                      {rounds}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>

          <Card style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Options</Text>
            
            <View style={styles.switchRow}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Switch
                value={gameSettings.soundEnabled}
                onValueChange={(value) => updateGameSetting('soundEnabled', value)}
                trackColor={{ false: Colors.border, true: Colors.primaryAccent }}
                thumbColor={Colors.textPrimary}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Switch
                value={gameSettings.hapticEnabled}
                onValueChange={(value) => updateGameSetting('hapticEnabled', value)}
                trackColor={{ false: Colors.border, true: Colors.primaryAccent }}
                thumbColor={Colors.textPrimary}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.settingLabel}>Show Hints</Text>
              <Switch
                value={gameSettings.showHints}
                onValueChange={(value) => updateGameSetting('showHints', value)}
                trackColor={{ false: Colors.border, true: Colors.primaryAccent }}
                thumbColor={Colors.textPrimary}
              />
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
    marginBottom: Spacing.m,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  optionButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonActive: {
    backgroundColor: Colors.primaryAccent,
    borderColor: Colors.primaryAccent,
  },
  optionButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  optionButtonTextActive: {
    color: Colors.textPrimary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.m,
  },
  startButton: {
    marginTop: Spacing.xl,
  },
});
