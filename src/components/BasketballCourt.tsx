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

  // Traditional court dimensions (NBA, half-court)
  const REAL_COURT_WIDTH = 50; // feet
  const REAL_COURT_HEIGHT = 47; // feet (half-court)
  const KEY_WIDTH_FT = 16;
  const KEY_HEIGHT_FT = 19;
  const THREE_PT_RADIUS_FT = 23.75; // 23'9"
  const FREE_THROW_LINE_FT = 19; // from baseline

  // Visually balanced proportions for key and 3pt arc
  const keyWidth = COURT_WIDTH * 0.32;
  const keyHeight = COURT_HEIGHT * 0.45;
  const freeThrowLineY = hoopY + 60 + keyHeight;
  // 3pt arc with rounded corners and closer to free throw circle
  const threePtRadius = COURT_WIDTH * 0.39;
  const threePtWingY = freeThrowLineY + keyWidth * 0.13;
  const threePtStartX = courtCenterX - threePtRadius;
  const threePtEndX = courtCenterX + threePtRadius;
  const threePtArcY = threePtWingY;
  // Control points for cubic Bezier to round the arc transitions
  const leftControlX = threePtStartX + keyWidth * 0.5;
  const rightControlX = threePtEndX - keyWidth * 0.5;
  const arcControlY = threePtArcY + keyWidth * 0.7;

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
        {/* Court outline (white rectangle, now fully surrounds the wood floor) */}
        <Rect x={0} y={0} width={COURT_WIDTH} height={COURT_HEIGHT} stroke="#fff" strokeWidth={4} fill="none" />
        {/* Baseline (now at the top, under the backboard, attached to court outline) */}
        <Line x1={courtCenterX - COURT_WIDTH / 2} y1={hoopY + 60} x2={courtCenterX + COURT_WIDTH / 2} y2={hoopY + 60} stroke="#fff" strokeWidth={3} opacity={0.9} />
        {/* Key (rectangle, extends from under the hoop toward the viewer, attached to baseline) */}
        <Rect x={courtCenterX - keyWidth / 2} y={hoopY + 60} width={keyWidth} height={keyHeight} stroke="#fff" strokeWidth={3} fill="none" opacity={0.9} />
        {/* Free throw line */}
        <Line x1={courtCenterX - keyWidth / 2} y1={freeThrowLineY} x2={courtCenterX + keyWidth / 2} y2={freeThrowLineY} stroke="#fff" strokeWidth={3} opacity={0.9} />
        {/* Free throw arc (more circular) */}
        <Ellipse cx={courtCenterX} cy={freeThrowLineY} rx={keyWidth * 0.5} ry={keyWidth * 0.5} stroke="#fff" strokeWidth={3} fill="none" opacity={0.9} />
        {/* 3pt line: left straight segment (wing) */}
        <Line x1={threePtStartX} y1={hoopY + 60} x2={threePtStartX} y2={threePtWingY} stroke="#fff" strokeWidth={4} />
        {/* 3pt line: right straight segment (wing) */}
        <Line x1={threePtEndX} y1={hoopY + 60} x2={threePtEndX} y2={threePtWingY} stroke="#fff" strokeWidth={4} />
        {/* 3pt arc (rounded corners, closer to free throw circle) */}
        <Path d={`M${threePtStartX},${threePtArcY} C${leftControlX},${arcControlY} ${rightControlX},${arcControlY} ${threePtEndX},${threePtArcY}`} stroke="#fff" strokeWidth={4} fill="none" />
        {/* Lane lines (verticals on the key) */}
        <Line x1={courtCenterX - keyWidth / 2} y1={hoopY + 60} x2={courtCenterX - keyWidth / 2} y2={hoopY + 60 + keyHeight} stroke="#fff" strokeWidth={3} opacity={0.9} />
        <Line x1={courtCenterX + keyWidth / 2} y1={hoopY + 60} x2={courtCenterX + keyWidth / 2} y2={hoopY + 60 + keyHeight} stroke="#fff" strokeWidth={3} opacity={0.9} />
        {/* Perspective floor lines */}
        <Path d={`M${courtCenterX - threePtRadius},${baselineY} Q${courtCenterX},${baselineY - 40} ${courtCenterX + threePtRadius},${baselineY}`} stroke="#fff" strokeWidth={1} fill="none" opacity={0.08} />
        <Path d={`M${courtCenterX - threePtRadius + 20},${baselineY - 30} Q${courtCenterX},${baselineY - 60} ${courtCenterX + threePtRadius - 20},${baselineY - 30}`} stroke="#fff" strokeWidth={1} fill="none" opacity={0.08} />
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
        {/* Hash marks (free throw lane marks) on the key */}
        {Array.from({ length: 3 }).map((_, i) => {
          // NBA: marks are spaced about 3ft apart, starting below the free throw line
          const markSpacing = keyHeight / 5.5; // visually balanced spacing
          const markLength = keyWidth * 0.18;
          const y = freeThrowLineY - markSpacing * (i + 1);
          return (
            <>
              {/* Left side */}
              <Line key={`left-hash-${i}`} x1={courtCenterX - keyWidth / 2} y1={y} x2={courtCenterX - keyWidth / 2 - markLength} y2={y} stroke="#fff" strokeWidth={3} />
              {/* Right side */}
              <Line key={`right-hash-${i}`} x1={courtCenterX + keyWidth / 2} y1={y} x2={courtCenterX + keyWidth / 2 + markLength} y2={y} stroke="#fff" strokeWidth={3} />
            </>
          );
        })}
        {/* Blocks at the bottom of the key next to the lowest free throw hashes */}
        {(() => {
          const markSpacing = keyHeight / 5.5;
          const markLength = keyWidth * 0.18;
          const blockWidth = markLength * 0.7;
          const blockHeight = markSpacing * 0.7;
          const y = freeThrowLineY - markSpacing * 4 - blockHeight / 2;
          return (
            <>
              {/* Left block */}
              <Rect
                x={courtCenterX - keyWidth / 2 - blockWidth}
                y={y}
                width={blockWidth}
                height={blockHeight}
                fill="#fff"
                opacity={0.8}
              />
              {/* Right block */}
              <Rect
                x={courtCenterX + keyWidth / 2}
                y={y}
                width={blockWidth}
                height={blockHeight}
                fill="#fff"
                opacity={0.8}
              />
            </>
          );
        })()}
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