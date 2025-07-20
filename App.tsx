import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import { MainMenu } from './src/screens/MainMenu';
import { GameSetup } from './src/screens/GameSetup';
import { Gameplay } from './src/screens/Gameplay';
import { Results } from './src/screens/Results';
import { Settings } from './src/screens/Settings';
import { HowToPlay } from './src/screens/HowToPlay';
import { Leaderboards } from './src/screens/Leaderboards';

// Import types
import { NavigationParamList } from './src/types';

const Stack = createStackNavigator<NavigationParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainMenu"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            }),
          }}
        >
          <Stack.Screen name="MainMenu" component={MainMenu} />
          <Stack.Screen name="GameSetup" component={GameSetup} />
          <Stack.Screen name="Gameplay" component={Gameplay} />
          <Stack.Screen name="Results" component={Results} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="HowToPlay" component={HowToPlay} />
          <Stack.Screen name="Leaderboards" component={Leaderboards} />
        </Stack.Navigator>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}