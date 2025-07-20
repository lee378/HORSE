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
  Image,
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
    { id: '1', name: 'Player 1', letters: [], position: { x: 200, y: 500 }, avatar: require('../assets/avatar1.png') },
    { id: '2', name: 'AI Easy', letters: [], position: { x: 200, y: 500 }, avatar: require('../assets/avatar2.png') },
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
  const [gameWordMode, setGameWordMode] = useState<'HORSE' | 'PIG' | 'CUSTOM'>('HORSE');
  const [customGameWord, setCustomGameWord] = useState('');

  const avatarImages = [
    require('../assets/avatar1.png'),
    require('../assets/avatar2.png'),
    require('../assets/avatar3.png'),
    require('../assets/avatar4.png'),
  ];

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([
        ...players,
        { 
          id: String(players.length + 1), 
          name: `Player ${players.length + 1}`, 
          letters: [],
          position: { x: 200, y: 500 },
          avatar: avatarImages[players.length % avatarImages.length],
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
    const word = gameWordMode === 'CUSTOM' && customGameWord.trim().length > 0
      ? customGameWord.trim().toUpperCase()
      : gameWordMode;
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
      gameWord: word,
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
                
                {/* Player Type Selector */}
                <View style={styles.playerTypeContainer}>
                  <Text style={styles.playerTypeLabel}>Type:</Text>
                  <View style={styles.playerTypeOptions}>
                    <TouchableOpacity
                      style={[
                        styles.playerTypeButton,
                        !player.name.toLowerCase().includes('ai') && styles.playerTypeButtonActive
                      ]}
                      onPress={() => {
                        const newName = player.name.replace(/ai\s*(easy|medium|hard)?/i, '').trim() || `Player ${player.id}`;
                        updatePlayerName(player.id, newName);
                      }}
                    >
                      <Text style={[
                        styles.playerTypeButtonText,
                        !player.name.toLowerCase().includes('ai') && styles.playerTypeButtonTextActive
                      ]}>
                        Human
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.playerTypeButton,
                        player.name.toLowerCase().includes('ai') && styles.playerTypeButtonActive
                      ]}
                      onPress={() => {
                        const difficulty = player.name.toLowerCase().includes('hard') ? 'Hard' : 
                                        player.name.toLowerCase().includes('medium') ? 'Medium' : 'Easy';
                        const newName = `AI ${difficulty}`;
                        updatePlayerName(player.id, newName);
                      }}
                    >
                      <Text style={[
                        styles.playerTypeButtonText,
                        player.name.toLowerCase().includes('ai') && styles.playerTypeButtonTextActive
                      ]}>
                        AI
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* AI Difficulty Selector (only show for AI players) */}
                  {player.name.toLowerCase().includes('ai') && (
                    <View style={styles.aiDifficultyContainer}>
                      <Text style={styles.aiDifficultyLabel}>Difficulty:</Text>
                      <View style={styles.aiDifficultyOptions}>
                        {['Easy', 'Medium', 'Hard'].map((difficulty) => (
                          <TouchableOpacity
                            key={difficulty}
                            style={[
                              styles.aiDifficultyButton,
                              player.name.toLowerCase().includes(difficulty.toLowerCase()) && styles.aiDifficultyButtonActive
                            ]}
                            onPress={() => {
                              const newName = `AI ${difficulty}`;
                              updatePlayerName(player.id, newName);
                            }}
                          >
                            <Text style={[
                              styles.aiDifficultyButtonText,
                              player.name.toLowerCase().includes(difficulty.toLowerCase()) && styles.aiDifficultyButtonTextActive
                            ]}>
                              {difficulty}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
                
                {/* Avatar Picker */}
                <View style={styles.avatarPickerRow}>
                  {avatarImages.map((avatarPath, aIdx) => {
                    const isSelected = player.avatar === avatarPath;
                    return (
                      <TouchableOpacity
                        key={aIdx}
                        onPress={() => setPlayers(players.map(p => p.id === player.id ? { ...p, avatar: avatarPath } : p))}
                        style={[styles.avatarOption, isSelected && styles.avatarSelected]}
                      >
                        <Image source={avatarPath} style={styles.avatarImage} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
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
            <Text style={styles.sectionTitle}>Game Word</Text>
            <View style={styles.optionsContainer}>
              {['HORSE', 'PIG', 'CUSTOM'].map(mode => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.optionButton, gameWordMode === mode && styles.optionButtonActive]}
                  onPress={() => setGameWordMode(mode as 'HORSE' | 'PIG' | 'CUSTOM')}
                >
                  <Text style={[styles.optionButtonText, gameWordMode === mode && styles.optionButtonTextActive]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {gameWordMode === 'CUSTOM' && (
              <TextInput
                style={styles.playerInput}
                value={customGameWord}
                onChangeText={setCustomGameWord}
                placeholder="Enter custom word"
                placeholderTextColor={Colors.placeholder}
                autoCapitalize="characters"
                maxLength={8}
              />
            )}
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
    flexDirection: 'column', // Changed to column for avatar picker
    alignItems: 'flex-start', // Align items to the start
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
    marginBottom: Spacing.s, // Add margin below name input
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
  avatarPickerRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
  },
  avatarOption: {
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  avatarSelected: {
    borderColor: Colors.primaryAccent,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#222',
  },
  playerTypeContainer: {
    marginBottom: Spacing.s,
  },
  playerTypeLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  playerTypeOptions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  playerTypeButton: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playerTypeButtonActive: {
    backgroundColor: Colors.primaryAccent,
    borderColor: Colors.primaryAccent,
  },
  playerTypeButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  playerTypeButtonTextActive: {
    color: Colors.textPrimary,
  },
  aiDifficultyContainer: {
    marginTop: Spacing.xs,
  },
  aiDifficultyLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontSize: 12,
  },
  aiDifficultyOptions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  aiDifficultyButton: {
    flex: 1,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiDifficultyButtonActive: {
    backgroundColor: Colors.primaryAccent,
    borderColor: Colors.primaryAccent,
  },
  aiDifficultyButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 10,
  },
  aiDifficultyButtonTextActive: {
    color: Colors.textPrimary,
  },
});
