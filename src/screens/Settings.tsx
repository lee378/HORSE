import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Colors, Typography, Layout, Spacing } from '../constants/designSystem';

interface SettingsProps {
  navigation: any;
}

export const Settings: React.FC<SettingsProps> = ({ navigation }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  return (
    <SafeAreaView style={styles.container}>
      <View
        
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Settings</Text>

          <Card style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Audio & Haptics</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: Colors.border, true: Colors.primaryAccent }}
                thumbColor={Colors.textPrimary}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Switch
                value={hapticEnabled}
                onValueChange={setHapticEnabled}
                trackColor={{ false: Colors.border, true: Colors.primaryAccent }}
                thumbColor={Colors.textPrimary}
              />
            </View>
          </Card>

          <Card style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Game Difficulty</Text>
            
            <View style={styles.difficultyContainer}>
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <Button
                  key={level}
                  title={level.charAt(0).toUpperCase() + level.slice(1)}
                  onPress={() => setDifficulty(level)}
                  variant={difficulty === level ? 'primary' : 'secondary'}
                  style={styles.difficultyButton}
                />
              ))}
            </View>
          </Card>

          <Card style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              H.O.R.S.E. Basketball Challenge is a mobile game where players take turns
              making basketball shots. Each player must replicate the previous player's
              successful shot, or they receive a letter. The first player to spell
              "HORSE" loses.
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </Card>

          <Button
            title="Back to Menu"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.s,
  },
  difficultyButton: {
    flex: 1,
  },
  aboutText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.m,
  },
  versionText: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  backButton: {
    marginTop: Spacing.l,
  },
});
