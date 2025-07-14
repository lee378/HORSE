import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, Ellipse, Path, G, Defs, Pattern, Image as SvgImage } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const COURT_WIDTH = screenWidth - 32;
const COURT_HEIGHT = screenHeight * 0.5;

// Import the wood texture
const woodTexture = require('../assets/your_wood_texture.jpg'); // update path as needed

export const BasketballCourt: React.FC = () => {
  // Perspective points for court lines
  const baselineY = COURT_HEIGHT * 0.95;
  const hoopY = COURT_HEIGHT * 0.18;
  const courtCenterX = COURT_WIDTH / 2;
  const keyWidth = COURT_WIDTH * 0.22;
  const keyHeight = COURT_HEIGHT * 0.38;
  const threePointWidth = COURT_WIDTH * 0.7;
  const threePointY = COURT_HEIGHT * 0.45;

  // Pattern size (should match your wood texture image size for best tiling)
  const patternWidth = 180; // px, adjust to your image
  const patternHeight = 220; // px, adjust to your image

  return (
    <View style={styles.container}>
      <Svg width={COURT_WIDTH} height={COURT_HEIGHT}>
        <Defs>
          <Pattern
            id="wood"
            patternUnits="userSpaceOnUse"
            width={patternWidth}
            height={patternHeight}
          >
            <SvgImage
              href={woodTexture}
              width={patternWidth}
              height={patternHeight}
              preserveAspectRatio="xMidYMid slice"
            />
          </Pattern>
        </Defs>
        {/* Court floor with wood pattern */}
        <Rect x={0} y={0} width={COURT_WIDTH} height={COURT_HEIGHT} fill="url(#wood)" />
        {/* Perspective court lines */}
        {/* Baseline */}
        <Line x1={courtCenterX - threePointWidth / 2} y1={baselineY} x2={courtCenterX + threePointWidth / 2} y2={baselineY} stroke="#fff" strokeWidth={3} opacity={0.9} />
        {/* Key (rectangle) */}
        <Rect x={courtCenterX - keyWidth / 2} y={baselineY - keyHeight} width={keyWidth} height={keyHeight} stroke="#fff" strokeWidth={3} fill="none" opacity={0.9} />
        {/* Free throw line */}
        <Line x1={courtCenterX - keyWidth / 2} y1={baselineY - keyHeight} x2={courtCenterX + keyWidth / 2} y2={baselineY - keyHeight} stroke="#fff" strokeWidth={3} opacity={0.9} />
        {/* Free throw arc (perspective) */}
        <Ellipse cx={courtCenterX} cy={baselineY - keyHeight} rx={keyWidth * 0.5} ry={keyWidth * 0.18} stroke="#fff" strokeWidth={3} fill="none" opacity={0.9} />
        {/* Three-point arc (perspective) */}
        <Ellipse cx={courtCenterX} cy={threePointY} rx={threePointWidth / 2} ry={COURT_HEIGHT * 0.18} stroke="#fff" strokeWidth={3} fill="none" opacity={0.9} />
        {/* Lane lines (converging) */}
        <Line x1={courtCenterX - keyWidth / 2} y1={baselineY} x2={courtCenterX - keyWidth / 2} y2={baselineY - keyHeight} stroke="#fff" strokeWidth={3} opacity={0.9} />
        <Line x1={courtCenterX + keyWidth / 2} y1={baselineY} x2={courtCenterX + keyWidth / 2} y2={baselineY - keyHeight} stroke="#fff" strokeWidth={3} opacity={0.9} />
        {/* Perspective floor lines */}
        <Path d={`M${courtCenterX - threePointWidth / 2},${baselineY} Q${courtCenterX},${baselineY - 40} ${courtCenterX + threePointWidth / 2},${baselineY}`} stroke="#fff" strokeWidth={1} fill="none" opacity={0.08} />
        <Path d={`M${courtCenterX - threePointWidth / 2 + 20},${baselineY - 30} Q${courtCenterX},${baselineY - 60} ${courtCenterX + threePointWidth / 2 - 20},${baselineY - 30}`} stroke="#fff" strokeWidth={1} fill="none" opacity={0.08} />
        {/* Hoop and backboard (court-level) */}
        <G>
          {/* Full backboard (outer white border) */}
          <Rect x={courtCenterX - 60} y={hoopY - 30} width={120} height={60} fill="#181A1B" stroke="#fff" strokeWidth={6} rx={4} />
          {/* Backboard (inner white rectangle) */}
          <Rect x={courtCenterX - 24} y={hoopY + 6} width={48} height={24} fill="none" stroke="#fff" strokeWidth={3} />
          {/* Rim (ellipse, perspective) */}
          <Ellipse cx={courtCenterX} cy={hoopY + 30} rx={18} ry={5} fill="none" stroke="#ff3c1a" strokeWidth={4} />
          {/* Net (simple mesh) */}
          <Path d={`M${courtCenterX - 12},${hoopY + 34} Q${courtCenterX},${hoopY + 58} ${courtCenterX + 12},${hoopY + 34}`} stroke="#ccc" strokeWidth={2} fill="none" opacity={0.7} />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
  },
});  