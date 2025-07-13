# H.O.R.S.E. Basketball Challenge

A React Native mobile game where players take turns making basketball shots. Each player must replicate the previous player's successful shot, or they receive a letter. The first player to spell "HORSE" loses.

## Features

- **Multiplayer Gameplay**: Support for 2-4 players
- **Customizable Settings**: Adjustable difficulty and game rounds
- **Haptic Feedback**: Tactile feedback for shot interactions
- **Modern UI**: Beautiful gradient design with smooth animations
- **Game Statistics**: Track scores and H.O.R.S.E. progress

## Game Rules

1. Players take turns shooting basketball
2. If a player makes a shot, the next player must make the same shot
3. If a player misses, they receive a letter (H-O-R-S-E)
4. The first player to spell "HORSE" loses
5. The last player standing wins!

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for screen navigation
- **Expo Haptics** for tactile feedback
- **Linear Gradient** for beautiful UI effects

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HORSE_App
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx     # Custom button component
│   ├── Card.tsx       # Card container component
│   └── HORSEDisplay.tsx # H.O.R.S.E. letters display
├── constants/          # Design system and constants
│   └── designSystem.ts # Colors, typography, spacing
├── screens/           # App screens
│   ├── MainMenu.tsx   # Main menu screen
│   ├── GameSetup.tsx  # Game configuration
│   ├── Gameplay.tsx   # Main game screen
│   ├── Results.tsx    # Game results
│   └── Settings.tsx   # App settings
├── types/             # TypeScript type definitions
│   └── index.ts       # Game state and navigation types
└── utils/             # Utility functions
```

## Game Flow

1. **Main Menu**: Start game, view settings, or learn how to play
2. **Game Setup**: Configure players (2-4) and game settings
3. **Gameplay**: Take turns shooting basketball with haptic feedback
4. **Results**: View final standings and H.O.R.S.E. progress
5. **Settings**: Customize audio, haptics, and difficulty

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Version

Current version: 1.0.0 