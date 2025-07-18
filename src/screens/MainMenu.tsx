import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Colors, Typography, Layout, Spacing } from '../constants/designSystem';

interface MainMenuProps {
  navigation: any;
}

export const MainMenu: React.FC<MainMenuProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundPrimary} />
      {/* SVG watermark court lines */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 400 800">
          <Path d="M40 700 Q200 600 360 700" stroke="#fff" strokeWidth={2} opacity={0.04} fill="none" />
          <Path d="M80 600 Q200 500 320 600" stroke="#fff" strokeWidth={2} opacity={0.04} fill="none" />
          <Path d="M120 500 Q200 420 280 500" stroke="#fff" strokeWidth={2} opacity={0.04} fill="none" />
          <Circle cx={200} cy={420} r={40} stroke="#fff" strokeWidth={2} opacity={0.03} fill="none" />
        </Svg>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>H.O.R.S.E.</Text>
        </View>
        <View style={styles.buttonContainer}>
          {/* Basketball-textured Play button */}
          <TouchableOpacity
            style={styles.playButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('GameSetup')}
          >
            {/* Basketball texture SVG overlay */}
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Circle cx="50%" cy="50%" r="48%" fill="none" stroke="#d2691e" strokeWidth={4} />
              <Path d="M10,60 Q50,100 90,60" stroke="#d2691e" strokeWidth={2} fill="none" />
              <Path d="M10,40 Q50,0 90,40" stroke="#d2691e" strokeWidth={2} fill="none" />
              <Path d="M50,10 Q50,50 50,90" stroke="#d2691e" strokeWidth={2} fill="none" />
              <Path d="M20,25 Q50,50 80,75" stroke="#d2691e" strokeWidth={1.5} fill="none" opacity={0.7} />
              <Path d="M80,25 Q50,50 20,75" stroke="#d2691e" strokeWidth={1.5} fill="none" opacity={0.7} />
            </Svg>
            <Text style={styles.playButtonText}>PLAY</Text>
          </TouchableOpacity>
          {/* Outlined secondary buttons */}
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('HowToPlay')}
          >
            <Text style={styles.secondaryButtonText}>HOW TO PLAY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.secondaryButtonText}>SETTINGS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Leaderboards')}
          >
            <Text style={styles.secondaryButtonText}>LEADERBOARDS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenMargin,
    paddingVertical: Spacing.xl,
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 6,
    textShadowColor: '#ffb347',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    marginBottom: 0,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 22,
  },
  playButton: {
    width: 220,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffb347', // fallback for iOS, will be replaced by SVG/texture
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#ffb347',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
    letterSpacing: 2,
    textShadowColor: '#ffb347',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  secondaryButton: {
    width: 220,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#ffb347',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 1,
  },
});
