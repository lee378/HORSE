import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Button } from '../components/Button';
import { Colors, Typography, Layout, Spacing } from '../constants/designSystem';

interface LeaderboardsProps {
  navigation: any;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: any;
  wins: number;
  totalGames: number;
  bestAccuracy: number;
  longestWinStreak: number;
  averageSequenceLength: number;
}

export const Leaderboards: React.FC<LeaderboardsProps> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<'wins' | 'accuracy' | 'streak'>('wins');
  
  // Mock data - in a real app, this would come from storage/API
  const leaderboardData: LeaderboardEntry[] = [
    {
      id: '1',
      name: 'Basketball Pro',
      avatar: require('../assets/avatar1.png'),
      wins: 15,
      totalGames: 20,
      bestAccuracy: 95,
      longestWinStreak: 8,
      averageSequenceLength: 4.2,
    },
    {
      id: '2',
      name: 'Court Master',
      avatar: require('../assets/avatar2.png'),
      wins: 12,
      totalGames: 18,
      bestAccuracy: 92,
      longestWinStreak: 6,
      averageSequenceLength: 3.8,
    },
    {
      id: '3',
      name: 'Hoop Legend',
      avatar: require('../assets/avatar3.png'),
      wins: 10,
      totalGames: 15,
      bestAccuracy: 88,
      longestWinStreak: 5,
      averageSequenceLength: 3.5,
    },
    {
      id: '4',
      name: 'Dunk King',
      avatar: require('../assets/avatar4.png'),
      wins: 8,
      totalGames: 12,
      bestAccuracy: 85,
      longestWinStreak: 4,
      averageSequenceLength: 3.2,
    },
    {
      id: '5',
      name: 'Rookie Baller',
      avatar: require('../assets/avatar1.png'),
      wins: 5,
      totalGames: 10,
      bestAccuracy: 78,
      longestWinStreak: 3,
      averageSequenceLength: 2.8,
    },
  ];

  const getSortedData = () => {
    switch (selectedTab) {
      case 'wins':
        return [...leaderboardData].sort((a, b) => b.wins - a.wins);
      case 'accuracy':
        return [...leaderboardData].sort((a, b) => b.bestAccuracy - a.bestAccuracy);
      case 'streak':
        return [...leaderboardData].sort((a, b) => b.longestWinStreak - a.longestWinStreak);
      default:
        return leaderboardData;
    }
  };

  const getTabTitle = () => {
    switch (selectedTab) {
      case 'wins':
        return 'Most Wins';
      case 'accuracy':
        return 'Best Accuracy';
      case 'streak':
        return 'Longest Streak';
      default:
        return 'Leaderboards';
    }
  };

  const getTabValue = (entry: LeaderboardEntry) => {
    switch (selectedTab) {
      case 'wins':
        return `${entry.wins} wins`;
      case 'accuracy':
        return `${entry.bestAccuracy}%`;
      case 'streak':
        return `${entry.longestWinStreak} games`;
      default:
        return '';
    }
  };

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${index + 1}`;
    }
  };

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
          <Text style={styles.title}>Leaderboards</Text>
          <Text style={styles.subtitle}>Top Players & Achievements</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'wins' && styles.tabActive]}
            onPress={() => setSelectedTab('wins')}
          >
            <Text style={[styles.tabText, selectedTab === 'wins' && styles.tabTextActive]}>
              Wins
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'accuracy' && styles.tabActive]}
            onPress={() => setSelectedTab('accuracy')}
          >
            <Text style={[styles.tabText, selectedTab === 'accuracy' && styles.tabTextActive]}>
              Accuracy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'streak' && styles.tabActive]}
            onPress={() => setSelectedTab('streak')}
          >
            <Text style={[styles.tabText, selectedTab === 'streak' && styles.tabTextActive]}>
              Streak
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>{getTabTitle()}</Text>
          
          {getSortedData().map((entry, index) => (
            <View key={entry.id} style={styles.leaderboardRow}>
              <View style={styles.rankContainer}>
                <Text style={styles.medalIcon}>{getMedalIcon(index)}</Text>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              
              <Image source={entry.avatar} style={styles.playerAvatar} />
              
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{entry.name}</Text>
                <Text style={styles.playerStats}>
                  {entry.totalGames} games • {Math.round((entry.wins / entry.totalGames) * 100)}% win rate
                </Text>
              </View>
              
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreValue}>{getTabValue(entry)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementsTitle}>🏆 Recent Achievements</Text>
          
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>🎯</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>Perfect Sequence</Text>
              <Text style={styles.achievementDescription}>
                Basketball Pro completed a 5-move sequence with 100% accuracy
              </Text>
            </View>
          </View>
          
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>🔥</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>Win Streak</Text>
              <Text style={styles.achievementDescription}>
                Court Master won 6 games in a row
              </Text>
            </View>
          </View>
          
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>⚡</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>Speed Demon</Text>
              <Text style={styles.achievementDescription}>
                Hoop Legend completed a sequence in under 10 seconds
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Play Now"
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 179, 71, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#ffb347',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  tabTextActive: {
    color: '#131313',
  },
  leaderboardContainer: {
    marginBottom: 32,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffb347',
    marginBottom: 16,
    textAlign: 'center',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 179, 71, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 71, 0.2)',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  medalIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  rankText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '600',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  playerStats: {
    fontSize: 12,
    color: '#ccc',
    opacity: 0.8,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffb347',
  },
  achievementsContainer: {
    marginBottom: 32,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffb347',
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 179, 71, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 71, 0.2)',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
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