import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Button } from '../components/Button';
import { Colors, Typography, Layout, Spacing } from '../constants/designSystem';

interface HowToPlayProps {
  navigation: any;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ navigation }) => {
  const rules = [
    {
      title: '1. Take Turns',
      description: 'Players take turns making basketball shots. Each player must replicate the previous player\'s successful shot.',
      icon: '🏀',
    },
    {
      title: '2. Watch & Remember',
      description: 'Watch the sequence carefully. You\'ll need to repeat the exact same moves in the same order.',
      icon: '👁️',
    },
    {
      title: '3. Replicate the Shot',
      description: 'When it\'s your turn, repeat the sequence you just watched. Accuracy matters!',
      icon: '🎯',
    },
    {
      title: '4. Get Letters',
      description: 'If you miss or fail to replicate the sequence accurately, you get a letter (H-O-R-S-E).',
      icon: '📝',
    },
    {
      title: '5. Last Player Wins',
      description: 'The first player to spell "HORSE" loses. The last player standing wins!',
      icon: '🏆',
    },
  ];

  const tips = [
    'Pay attention to the sequence order',
    'Watch the player\'s movement patterns',
    'Remember the timing of each move',
    'Practice difficult sequences',
    'Stay focused during your turn',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* SVG watermark court lines */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 400 800">
          <Path d="M40 700 Q200 600 360 700" stroke="#fff" strokeWidth={2} opacity={0.04} fill="none" />
          <Path d="M80 600 Q200 500 320 600" stroke="#fff" strokeWidth={2} opacity={0.04} fill="none" />
          <Path d="M120 500 Q200 420 280 500" stroke="#fff" strokeWidth={2} opacity={0.04} fill="none" />
          <Circle cx={200} cy={420} r={40} stroke="#fff" strokeWidth={2} opacity={0.03} fill="none" />
        </Svg>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>How to Play</Text>
          <Text style={styles.subtitle}>Master the H.O.R.S.E. Challenge</Text>
        </View>

        <View style={styles.rulesContainer}>
          {rules.map((rule, index) => (
            <View key={index} style={styles.ruleCard}>
              <View style={styles.ruleHeader}>
                <Text style={styles.ruleIcon}>{rule.icon}</Text>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
              </View>
              <Text style={styles.ruleDescription}>{rule.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Start Playing"
            onPress={() => navigation.navigate('GameSetup')}
            style={styles.playButton}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenMargin,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#ffb347',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    opacity: 0.8,
  },
  rulesContainer: {
    marginBottom: 32,
  },
  ruleCard: {
    backgroundColor: 'rgba(255, 179, 71, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 71, 0.3)',
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  ruleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffb347',
    flex: 1,
  },
  ruleDescription: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    opacity: 0.9,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 179, 71, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 71, 0.2)',
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffb347',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#ffb347',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    lineHeight: 22,
    opacity: 0.9,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 220,
    height: 56,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#ffb347',
    fontSize: 16,
    fontWeight: '600',
  },
}); 