import React from 'react';
import Svg, { G, Circle, Line } from 'react-native-svg';

interface PlayerProps {
  x: number;
  y: number;
  pose: 'idle' | 'dribble' | 'jumpShot' | 'layup';
  direction?: 'left' | 'right';
}

const HEAD_RADIUS = 10;
const BODY_LENGTH = 28;
const ARM_LENGTH = 18;
const LEG_LENGTH = 20;

const Player: React.FC<PlayerProps> = ({ x, y, pose, direction = 'right' }) => {
  // Basic stick figure coordinates
  // Head center: (x, y)
  // Body: (x, y+HEAD_RADIUS) to (x, y+HEAD_RADIUS+BODY_LENGTH)
  // Arms: from (x, y+HEAD_RADIUS+8) out to left/right
  // Legs: from (x, y+HEAD_RADIUS+BODY_LENGTH) out to left/right

  // Pose variations
  let leftArm, rightArm, leftLeg, rightLeg;
  if (pose === 'dribble') {
    // Dribble pose: right arm down, left arm out
    leftArm = [x, y + HEAD_RADIUS + 8, x - ARM_LENGTH, y + HEAD_RADIUS + 18];
    rightArm = [x, y + HEAD_RADIUS + 8, x + ARM_LENGTH, y + HEAD_RADIUS + 28];
    leftLeg = [x, y + HEAD_RADIUS + BODY_LENGTH, x - LEG_LENGTH, y + HEAD_RADIUS + BODY_LENGTH + LEG_LENGTH];
    rightLeg = [x, y + HEAD_RADIUS + BODY_LENGTH, x + LEG_LENGTH, y + HEAD_RADIUS + BODY_LENGTH + LEG_LENGTH - 6];
  } else {
    // Idle pose: arms out, legs relaxed
    leftArm = [x, y + HEAD_RADIUS + 8, x - ARM_LENGTH, y + HEAD_RADIUS + 8];
    rightArm = [x, y + HEAD_RADIUS + 8, x + ARM_LENGTH, y + HEAD_RADIUS + 8];
    leftLeg = [x, y + HEAD_RADIUS + BODY_LENGTH, x - LEG_LENGTH, y + HEAD_RADIUS + BODY_LENGTH + LEG_LENGTH];
    rightLeg = [x, y + HEAD_RADIUS + BODY_LENGTH, x + LEG_LENGTH, y + HEAD_RADIUS + BODY_LENGTH + LEG_LENGTH];
  }

  // Flip for direction
  const flip = direction === 'left' ? -1 : 1;

  return (
    <Svg x={x - 20} y={y - 20} width={50} height={70}>
      <G scaleX={flip} originX={25}>
        {/* Head */}
        <Circle cx={25} cy={HEAD_RADIUS} r={HEAD_RADIUS} fill="#222" />
        {/* Body */}
        <Line x1={25} y1={HEAD_RADIUS * 2} x2={25} y2={HEAD_RADIUS * 2 + BODY_LENGTH} stroke="#222" strokeWidth={3} />
        {/* Arms */}
        <Line x1={leftArm[0] - x + 25} y1={leftArm[1] - y + 0} x2={leftArm[2] - x + 25} y2={leftArm[3] - y + 0} stroke="#222" strokeWidth={3} />
        <Line x1={rightArm[0] - x + 25} y1={rightArm[1] - y + 0} x2={rightArm[2] - x + 25} y2={rightArm[3] - y + 0} stroke="#222" strokeWidth={3} />
        {/* Legs */}
        <Line x1={25} y1={HEAD_RADIUS * 2 + BODY_LENGTH} x2={leftLeg[2] - x + 25} y2={leftLeg[3] - y + 0} stroke="#222" strokeWidth={3} />
        <Line x1={25} y1={HEAD_RADIUS * 2 + BODY_LENGTH} x2={rightLeg[2] - x + 25} y2={rightLeg[3] - y + 0} stroke="#222" strokeWidth={3} />
      </G>
    </Svg>
  );
};

export default Player; 