import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Button } from '../components/Button';
import { Colors, Typography, Layout, Spacing } from '../constants/designSystem';

interface MainMenuProps {
  navigation: any;
}

export const MainMenu: React.FC<MainMenuProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundPrimary} />
      <View
        
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>H.O.R.S.E.</Text>
            <Text style={styles.subtitle}>Basketball Challenge</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Start Game"
              onPress={() => navigation.navigate('GameSetup')}
              style={styles.button}
            />
            <Button
              title="How to Play"
              onPress={() => navigation.navigate('Settings')}
              variant="secondary"
              style={styles.button}
            />
            <Button
              title="Settings"
              onPress={() => navigation.navigate('Settings')}
              variant="secondary"
              style={styles.button}
            />
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenMargin,
    paddingVertical: Spacing.xl,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.s,
  },
  subtitle: {
    ...Typography.h3,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: Spacing.m,
  },
  button: {
    marginBottom: Spacing.s,
  },
});
