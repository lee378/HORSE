import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Text, Dimensions, Image } from 'react-native';
import { EngineView, useEngine } from '@babylonjs/react-native';
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  DirectionalLight,
  ShadowGenerator,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Texture,
  Animation,
} from '@babylonjs/core';
import { GameSequence, Player } from '../types';

interface BabylonCourtProps {
  currentSequence: GameSequence | undefined;
  currentMoveIndex: number;
  isSequencePlaying: boolean;
  isSequenceReplaying: boolean;
  onMoveComplete: (moveIndex: number) => void;
  onSequenceComplete: (success: boolean) => void;
  onCameraInitialized: (camera: ArcRotateCamera) => void;
  players: Player[];
}

export interface BabylonCourtRef {
  animateBallShot: (from: Vector3, to: Vector3, apexHeight?: number, willGoIn?: boolean) => void;
  animatePlayerMove: (playerIdx: number, from: Vector3, to: Vector3) => void;
  animatePlayerDribble: (playerIdx: number, positions: Vector3[]) => Promise<void>;
  animatePlayerJump: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerLayup: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerCrossover: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerSpin: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerStepBack: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerEuroStep: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerDrive: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerDunk: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerReverseDunk: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerWindmillDunk: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerTomahawkDunk: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerBetweenLegsDunk: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
  animatePlayerAlleyOopDunk: (playerIdx: number, from: Vector3, to: Vector3) => Promise<void>;
}

const playerColors = [
  new Color3(0.2, 0.7, 1.0), // blue
  new Color3(1.0, 0.6, 0.2), // orange
  new Color3(0.5, 1.0, 0.5), // green
  new Color3(1.0, 0.2, 0.6), // pink
  new Color3(1.0, 1.0, 0.2), // yellow
];

const BabylonCourt = forwardRef<BabylonCourtRef, BabylonCourtProps>(({ onCameraInitialized, players, ...props }, ref) => {
  const engine = useEngine();
  const [scene, setScene] = useState<Scene | null>(null);
  const [camera, setCamera] = useState<ArcRotateCamera | null>(null);

  useEffect(() => {
    if (engine && !scene) {
      const newScene = new Scene(engine);
      setScene(newScene);
      console.log('Babylon scene created');

      const newCamera = new ArcRotateCamera(
        'camera',
        Math.PI / 2,
        Math.PI / 2.5,
        10,
        Vector3.Zero(),
        newScene
      );
      newCamera.attachControl(true);
      newScene.activeCamera = newCamera;
      setCamera(newCamera);
      onCameraInitialized(newCamera);
      console.log('Babylon camera created and set as active');

      // Enhanced lighting system with multiple light sources
      const ambientLight = new HemisphericLight('ambientLight', new Vector3(0, 1, 0), newScene);
      ambientLight.intensity = 0.4;
      ambientLight.groundColor = new Color3(0.1, 0.1, 0.2);
      
      // Main directional light for shadows
      const mainLight = new DirectionalLight('mainLight', new Vector3(-1, -2, -1), newScene);
      mainLight.intensity = 0.8;
      mainLight.position = new Vector3(10, 20, 10);
      
      // Secondary fill light
      const fillLight = new DirectionalLight('fillLight', new Vector3(1, -1, 1), newScene);
      fillLight.intensity = 0.3;
      fillLight.position = new Vector3(-10, 15, -10);
      
      // Enable shadows
      const shadowGenerator = new ShadowGenerator(1024, mainLight);
      shadowGenerator.useBlurExponentialShadowMap = true;
      shadowGenerator.blurKernel = 32;

      // Court surface material - wood-like texture with vertical grain lines
      const courtMaterial = new StandardMaterial('courtMaterial', newScene);
      courtMaterial.diffuseColor = new Color3(0.8, 0.6, 0.4); // Wooden court color
      courtMaterial.specularColor = new Color3(0.1, 0.1, 0.1); // Low specular for matte look

      // Accurate NBA half-court dimensions (in meters)
      const courtWidth = 15.24; // 50 ft
      const courtDepth = 14.33; // 47 ft (half-court)
      const keyWidth = 4.88; // 16 ft
      const keyHeight = 5.79; // 19 ft
      const freeThrowLineDist = 4.57; // 15 ft from backboard
      const backboardDist = 1.22; // 4 ft from baseline
      const centerCircleRadius = 1.83; // 6 ft
      const threePtRadiusTop = 7.5; // Visual blend (NBA is 7.24)
      const threePtRadiusCorner = 6.71; // 22 ft
      const lineThickness = 0.05;

      // Court surface (main playing area) - made thicker for better visibility
      const courtSurface = MeshBuilder.CreateBox('courtSurface', { width: courtWidth, height: 0.01, depth: courtDepth }, newScene);
      courtSurface.position = new Vector3(0, 0, 0);
      courtSurface.material = courtMaterial;

      // Create wood grain effect using vertical lines
      const woodGrainLines = [];
      const lineSpacing = courtWidth / 40; // 40 vertical lines across court
      for (let i = 0; i <= 40; i++) {
        const x = -courtWidth / 2 + i * lineSpacing;
        const line = MeshBuilder.CreateBox(`woodLine${i}`, { 
          width: 0.02, 
          height: 0.002, 
          depth: courtDepth 
        }, newScene);
        line.position = new Vector3(x, 0.005, 0);
        
        // Slightly darker wood color for the lines
        const lineMaterial = new StandardMaterial(`lineMaterial${i}`, newScene);
        lineMaterial.diffuseColor = new Color3(0.7, 0.5, 0.3); // Darker wood
        line.material = lineMaterial;
        woodGrainLines.push(line);
      }

      // Baseline (under hoop)
      MeshBuilder.CreateBox('baseline', { width: courtWidth, height: lineThickness, depth: lineThickness }, newScene).position = new Vector3(0, 0, courtDepth / 2);
      // Sidelines
      MeshBuilder.CreateBox('sidelineL', { width: lineThickness, height: lineThickness, depth: courtDepth }, newScene).position = new Vector3(-courtWidth / 2, 0, 0);
      MeshBuilder.CreateBox('sidelineR', { width: lineThickness, height: lineThickness, depth: courtDepth }, newScene).position = new Vector3(courtWidth / 2, 0, 0);
      // Half-court line
      MeshBuilder.CreateBox('halfCourt', { width: courtWidth, height: lineThickness, depth: lineThickness }, newScene).position = new Vector3(0, 0, -courtDepth / 2);

      // Paint area removed - let the court surface show through with wood grain

      // Key outline (white lines around the paint) - only the sides and free throw line
      // Key sides
      MeshBuilder.CreateBox('keyL', { width: lineThickness, height: lineThickness, depth: keyHeight }, newScene).position = new Vector3(-keyWidth / 2, 0.01, courtDepth / 2 - backboardDist - keyHeight / 2);
      MeshBuilder.CreateBox('keyR', { width: lineThickness, height: lineThickness, depth: keyHeight }, newScene).position = new Vector3(keyWidth / 2, 0.01, courtDepth / 2 - backboardDist - keyHeight / 2);
      // Free throw line
      MeshBuilder.CreateBox('freeThrowLine', { width: keyWidth, height: lineThickness, depth: lineThickness }, newScene).position = new Vector3(0, 0.01, courtDepth / 2 - backboardDist - keyHeight);

      // Free throw arc (top of key)
      const freeThrowArcPoints = [];
      const freeThrowCenter = new Vector3(0, 0.02, courtDepth / 2 - backboardDist - keyHeight);
      for (let i = 0; i <= 32; i++) {
        const angle = Math.PI + (i / 32) * Math.PI;
        freeThrowArcPoints.push(new Vector3(freeThrowCenter.x + centerCircleRadius * Math.cos(angle), 0.02, freeThrowCenter.z + centerCircleRadius * Math.sin(angle)));
      }
      MeshBuilder.CreateLines('freeThrowArc', { points: freeThrowArcPoints, updatable: false }, newScene).color = Color3.White();

      // Center circle (for half-court, not visible in half-court play, but included for completeness)
      const centerCirclePoints = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * 2 * Math.PI;
        centerCirclePoints.push(new Vector3(centerCircleRadius * Math.cos(angle), 0.02, -courtDepth / 2 + centerCircleRadius * Math.sin(angle)));
      }
      MeshBuilder.CreateLines('centerCircle', { points: centerCirclePoints, updatable: false }, newScene).color = Color3.White();

      // Materials for hoop, backboard, and stanchion
      const whiteMaterial = new StandardMaterial('whiteMaterial', newScene);
      whiteMaterial.diffuseColor = Color3.White();
      const redMaterial = new StandardMaterial('redMaterial', newScene);
      redMaterial.diffuseColor = Color3.Red();
      
      // Stanchion materials
      const stanchionMaterial = new StandardMaterial('stanchionMaterial', newScene);
      stanchionMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2); // Dark gray
      stanchionMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
      
      const backboardSupportMaterial = new StandardMaterial('backboardSupportMaterial', newScene);
      backboardSupportMaterial.diffuseColor = new Color3(0.3, 0.3, 0.3); // Medium gray
      backboardSupportMaterial.specularColor = new Color3(0.2, 0.2, 0.2);

      // Curved, hanging net (16 strands, smooth curve)
      const netStrands = 16;
      const netRimRadius = 0.5;
      const netBottomRadius = 0.2;
      const netHeight = 0.6;
      const netSegments = 6; // More segments = smoother curve
      for (let i = 0; i < netStrands; i++) {
        const angle = (i / netStrands) * 2 * Math.PI;
        const points = [];
        for (let j = 0; j <= netSegments; j++) {
          const t = j / netSegments;
          // Interpolate radius and height
          const radius = netRimRadius * (1 - t) + netBottomRadius * t;
          const y = 1.5 - t * netHeight; // 1.5 = rim height
          const x = radius * Math.cos(angle);
          const z = courtDepth / 2 - 1 + radius * Math.sin(angle);
          points.push(new Vector3(x, y, z));
        }
        MeshBuilder.CreateLines('netCurve' + i, { points }, newScene).color = Color3.White();
      }

      // --- NBA 3pt arc and wings (no diagonals) ---
      // Arc: only between x = ±6.71m (NBA corner 3)
      // Wings: vertical lines at x = ±6.71m from baseline to arc
      const hoopZ = courtDepth / 2 - backboardDist - 0.15;
      const arcStartAngle = Math.PI * 0.13;
      const arcEndAngle = Math.PI - Math.PI * 0.13;
      const numArcPoints = 128;
      const threePtArcPoints = [];
      for (let i = 0; i <= numArcPoints; i++) {
        const angle = arcStartAngle + (i / numArcPoints) * (arcEndAngle - arcStartAngle);
        threePtArcPoints.push(
          new Vector3(threePtRadiusTop * Math.cos(angle), 0.03, hoopZ - threePtRadiusTop * Math.sin(angle))
        );
      }
      // Find arc points where x = ±threePtRadiusCorner
      const leftWingX = -threePtRadiusCorner;
      const rightWingX = threePtRadiusCorner;
      let leftWingArcIdx = 0;
      let rightWingArcIdx = threePtArcPoints.length - 1;
      for (let i = 0; i < threePtArcPoints.length; i++) {
        if (threePtArcPoints[i].x >= leftWingX) {
          leftWingArcIdx = i;
          break;
        }
      }
      for (let i = threePtArcPoints.length - 1; i >= 0; i--) {
        if (threePtArcPoints[i].x <= rightWingX) {
          rightWingArcIdx = i;
          break;
        }
      }
      // Arc segment only between the two wing points
      const arcSegmentPoints = threePtArcPoints.slice(leftWingArcIdx, rightWingArcIdx + 1);
      MeshBuilder.CreateLines('threePtArc', { points: arcSegmentPoints, updatable: false }, newScene).color = Color3.White();
      // Wings: vertical from baseline (z = courtDepth / 2) to arc endpoint
      const baselineZ = courtDepth / 2;
      // Shared endpoints for seamless 3pt line connection
      const leftCorner = new Vector3(leftWingX, 0.03, baselineZ);
      const rightCorner = new Vector3(rightWingX, 0.03, baselineZ);
      // Left wing: vertical from baseline to arc
      MeshBuilder.CreateLines(
        'threePtLeftWing',
        {
          points: [
            leftCorner,
            new Vector3(leftWingX, 0.03, threePtArcPoints[leftWingArcIdx].z),
          ],
          updatable: false,
        },
        newScene
      ).color = Color3.White();
      // Right wing: vertical from baseline to arc
      MeshBuilder.CreateLines(
        'threePtRightWing',
        {
          points: [
            rightCorner,
            new Vector3(rightWingX, 0.03, threePtArcPoints[rightWingArcIdx].z),
          ],
          updatable: false,
        },
        newScene
      ).color = Color3.White();

      // Connect 3pt wings to sidelines at baseline (overlap sideline box center)
      const sidelineBoxCenterX = courtWidth / 2;
      MeshBuilder.CreateLines(
        'threePtLeftCorner',
        {
          points: [
            leftCorner,
            new Vector3(-sidelineBoxCenterX, 0.03, baselineZ),
          ],
          updatable: false,
        },
        newScene
      ).color = Color3.White();
      MeshBuilder.CreateLines(
        'threePtRightCorner',
        {
          points: [
            rightCorner,
            new Vector3(sidelineBoxCenterX, 0.03, baselineZ),
          ],
          updatable: false,
        },
        newScene
      ).color = Color3.White();

      // Hash marks (blocks) along the key
      // NBA: 4 hash marks per side, starting 0.91m from baseline, spaced 0.91m apart
      const hashMarkWidth = 0.15;
      const hashMarkDepth = 0.05;
      const hashMarkHeight = 0.12;
      for (let i = 0; i < 4; i++) {
        const z = courtDepth / 2 - backboardDist - 0.91 - i * 0.91;
        MeshBuilder.CreateBox('hashL' + i, { width: hashMarkWidth, height: hashMarkHeight, depth: hashMarkDepth }, newScene).position = new Vector3(-keyWidth / 2 - hashMarkWidth / 2, 0.03, z);
        MeshBuilder.CreateBox('hashR' + i, { width: hashMarkWidth, height: hashMarkHeight, depth: hashMarkDepth }, newScene).position = new Vector3(keyWidth / 2 + hashMarkWidth / 2, 0.03, z);
      }

      // Free throw circle (NBA: 6' radius = 1.83m, only within key area)
      const freeThrowCircleRadius = 1.83; // 6 feet radius
      const freeThrowCirclePoints = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * 2 * Math.PI;
        freeThrowCirclePoints.push(new Vector3(freeThrowCircleRadius * Math.cos(angle), 0.02, courtDepth / 2 - backboardDist - keyHeight + freeThrowCircleRadius * Math.sin(angle)));
      }
      MeshBuilder.CreateLines('freeThrowCircle', { points: freeThrowCirclePoints, updatable: false }, newScene).color = Color3.White();

      // Hoop (thicker circle made with multiple line rings for width)
      const hoopRadius = 0.5;
      const hoopThickness = 0.03; // 3cm thick
      const hoopSegments = 32;
      
      // Create multiple concentric circles to make the hoop thicker
      for (let ring = 0; ring <= 8; ring++) {
        const currentRadius = hoopRadius - (ring * hoopThickness / 8);
        const hoopPoints = [];
        for (let i = 0; i <= hoopSegments; i++) {
          const angle = (i / hoopSegments) * 2 * Math.PI;
          hoopPoints.push(new Vector3(currentRadius * Math.cos(angle), 1.5, courtDepth / 2 - 1 + currentRadius * Math.sin(angle)));
        }
        MeshBuilder.CreateLines('hoopRing' + ring, { points: hoopPoints, updatable: false }, newScene).color = Color3.Red();
      }

      // Backboard (simple box)
      const backboardMat = new StandardMaterial('backboardMat', newScene);
      backboardMat.diffuseColor = Color3.White();
      backboardMat.alpha = 0.3; // transparent
      const backboard = MeshBuilder.CreateBox('backboard', { width: 3, height: 2, depth: 0.1 }, newScene);
      backboard.position = new Vector3(0, 2.5, courtDepth / 2 - 0.8);
      backboard.material = backboardMat;

      // Backboard outline (white)
      const outlineMat = new StandardMaterial('backboardOutlineMat', newScene);
      outlineMat.diffuseColor = Color3.White();
      const outlineThickness = 0.08; // increased from 0.03
      const outlineDepth = 0.012;
      // Top
      const bbOutlineTop = MeshBuilder.CreateBox('bbOutlineTop', { width: 3, height: outlineThickness, depth: outlineDepth }, newScene);
      bbOutlineTop.position = new Vector3(0, 2.5 + 1 - outlineThickness / 2, courtDepth / 2 - 0.8 + 0.06);
      bbOutlineTop.material = outlineMat;
      // Bottom
      const bbOutlineBot = MeshBuilder.CreateBox('bbOutlineBot', { width: 3, height: outlineThickness, depth: outlineDepth }, newScene);
      bbOutlineBot.position = new Vector3(0, 2.5 - 1 + outlineThickness / 2, courtDepth / 2 - 0.8 + 0.06);
      bbOutlineBot.material = outlineMat;
      // Left
      const bbOutlineLeft = MeshBuilder.CreateBox('bbOutlineLeft', { width: outlineThickness, height: 2, depth: outlineDepth }, newScene);
      bbOutlineLeft.position = new Vector3(-1.5 + outlineThickness / 2, 2.5, courtDepth / 2 - 0.8 + 0.06);
      bbOutlineLeft.material = outlineMat;
      // Right
      const bbOutlineRight = MeshBuilder.CreateBox('bbOutlineRight', { width: outlineThickness, height: 2, depth: outlineDepth }, newScene);
      bbOutlineRight.position = new Vector3(1.5 - outlineThickness / 2, 2.5, courtDepth / 2 - 0.8 + 0.06);
      bbOutlineRight.material = outlineMat;

      // Backboard shooter's square (NBA: 24"x18" = 0.61m x 0.46m)
      const squareW = 0.61;
      const squareH = 0.46;
      const squareY = 2.32; // 6" (0.15m) above rim (rim at 1.5, backboard bottom at 1.5, so 2.32 is 0.15 above rim)
      const squareZ = courtDepth / 2 - 0.75; // slightly in front of backboard
      const squareMat = new StandardMaterial('squareMat', newScene);
      squareMat.diffuseColor = Color3.White(); // pure white
      // Top
      const bbSquareTop = MeshBuilder.CreateBox('bbSquareTop', { width: squareW, height: 0.03, depth: 0.01 }, newScene);
      bbSquareTop.position = new Vector3(0, squareY + squareH / 2, squareZ);
      bbSquareTop.material = squareMat;
      // Bottom
      const bbSquareBot = MeshBuilder.CreateBox('bbSquareBot', { width: squareW, height: 0.03, depth: 0.01 }, newScene);
      bbSquareBot.position = new Vector3(0, squareY - squareH / 2, squareZ);
      bbSquareBot.material = squareMat;
      // Left
      const bbSquareLeft = MeshBuilder.CreateBox('bbSquareLeft', { width: 0.03, height: squareH, depth: 0.01 }, newScene);
      bbSquareLeft.position = new Vector3(-squareW / 2, squareY, squareZ);
      bbSquareLeft.material = squareMat;
      // Right
      const bbSquareRight = MeshBuilder.CreateBox('bbSquareRight', { width: 0.03, height: squareH, depth: 0.01 }, newScene);
      bbSquareRight.position = new Vector3(squareW / 2, squareY, squareZ);
      bbSquareRight.material = squareMat;

      // Basketball Stanchion (support structure)
      // Main vertical pole
      const stanchionPole = MeshBuilder.CreateCylinder('stanchionPole', { 
        height: 4.5, 
        diameter: 0.15 
      }, newScene);
      stanchionPole.position = new Vector3(0, 2.25, courtDepth / 2 + 1.5);
      stanchionPole.material = stanchionMaterial;
      
      // Horizontal support arm (extends from pole to backboard)
      const supportArm = MeshBuilder.CreateBox('supportArm', { 
        width: 2.5, 
        height: 0.12, 
        depth: 0.12 
      }, newScene);
      supportArm.position = new Vector3(0, 3.5, courtDepth / 2 + 0.5);
      supportArm.material = backboardSupportMaterial;
      
      // Vertical support brace (connects arm to backboard)
      const supportBrace = MeshBuilder.CreateBox('supportBrace', { 
        width: 0.12, 
        height: 1.2, 
        depth: 0.12 
      }, newScene);
      supportBrace.position = new Vector3(0, 2.8, courtDepth / 2 - 0.3);
      supportBrace.material = backboardSupportMaterial;
      
      // Backboard mounting bracket (horizontal)
      const mountingBracket = MeshBuilder.CreateBox('mountingBracket', { 
        width: 3.2, 
        height: 0.08, 
        depth: 0.08 
      }, newScene);
      mountingBracket.position = new Vector3(0, 2.5, courtDepth / 2 - 0.85);
      mountingBracket.material = backboardSupportMaterial;
      
      // Diagonal support struts (for stability)
      const leftStrut = MeshBuilder.CreateBox('leftStrut', { 
        width: 0.08, 
        height: 0.08, 
        depth: 1.8 
      }, newScene);
      leftStrut.position = new Vector3(-1.2, 3.2, courtDepth / 2 + 0.2);
      leftStrut.rotation.z = Math.PI / 6; // 30 degrees
      leftStrut.material = backboardSupportMaterial;
      
      const rightStrut = MeshBuilder.CreateBox('rightStrut', { 
        width: 0.08, 
        height: 0.08, 
        depth: 1.8 
      }, newScene);
      rightStrut.position = new Vector3(1.2, 3.2, courtDepth / 2 + 0.2);
      rightStrut.rotation.z = -Math.PI / 6; // -30 degrees
      rightStrut.material = backboardSupportMaterial;
      
      // Base plate (where stanchion meets floor)
      const basePlate = MeshBuilder.CreateBox('basePlate', { 
        width: 0.8, 
        height: 0.1, 
        depth: 0.8 
      }, newScene);
      basePlate.position = new Vector3(0, 0.05, courtDepth / 2 + 1.5);
      basePlate.material = stanchionMaterial;
      
      // Enable shadows for stanchion parts
      if (shadowGenerator) {
        shadowGenerator.addShadowCaster(stanchionPole);
        shadowGenerator.addShadowCaster(supportArm);
        shadowGenerator.addShadowCaster(supportBrace);
        shadowGenerator.addShadowCaster(mountingBracket);
        shadowGenerator.addShadowCaster(leftStrut);
        shadowGenerator.addShadowCaster(rightStrut);
        shadowGenerator.addShadowCaster(basePlate);
      }

      // Paint area removed - court surface shows through with wood grain

      // Enhanced basketball with better physics
      const ball = MeshBuilder.CreateSphere('ball', { diameter: 0.5, segments: 16 }, newScene);
      ball.position = new Vector3(0, 0.3, 0);
      
      // Enhanced basketball with realistic texture and materials
      const ballMaterial = new StandardMaterial('ballMaterial', newScene);
      // Use a remote basketball texture URL
      const texture = new Texture("https://i.imgur.com/8yKXsgF.jpg", newScene, true, false);
      ballMaterial.diffuseTexture = texture;
      ballMaterial.specularColor = new Color3(0.3, 0.3, 0.3);
      ballMaterial.specularPower = 32;
      ballMaterial.ambientColor = new Color3(0.2, 0.2, 0.2);
      ball.material = ballMaterial;
      
      // Add basketball lines (seams) for realism
      const ballLines = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI;
        const points = [];
        for (let j = 0; j <= 10; j++) {
          const t = j / 10;
          const x = 0.25 * Math.cos(angle) * (1 - t);
          const y = 0.25 * Math.sin(angle) * (1 - t);
          const z = 0.25 * (2 * t - 1);
          points.push(new Vector3(x, y, z));
        }
        const line = MeshBuilder.CreateLines('ballLine' + i, { points }, newScene);
        line.color = new Color3(0.8, 0.8, 0.8); // Light gray lines
        line.parent = ball;
      }

      // Enhanced players with realistic uniforms and jerseys
      players.forEach((player, idx) => {
        const jerseyColor = playerColors[idx % playerColors.length];
        const pos = new Vector3(player.position.x, 1.1, player.position.y); // y is z on court
        
        // Player body (torso)
        const torso = MeshBuilder.CreateCapsule('playerTorso' + idx, { height: 1.2, radius: 0.3 }, newScene);
        torso.position = pos.clone();
        const jerseyMat = new StandardMaterial('jerseyMat' + idx, newScene);
        jerseyMat.diffuseColor = jerseyColor;
        jerseyMat.specularColor = new Color3(0.1, 0.1, 0.1);
        torso.material = jerseyMat;
        
        // Player head
        const head = MeshBuilder.CreateSphere('playerHead' + idx, { diameter: 0.4 }, newScene);
        head.position = new Vector3(pos.x, pos.y + 0.8, pos.z);
        const skinMat = new StandardMaterial('skinMat' + idx, newScene);
        skinMat.diffuseColor = new Color3(0.9, 0.7, 0.6); // Skin tone
        head.material = skinMat;
        head.parent = torso;
        
        // Player arms
        const leftArm = MeshBuilder.CreateCapsule('playerLeftArm' + idx, { height: 0.8, radius: 0.1 }, newScene);
        leftArm.position = new Vector3(pos.x - 0.4, pos.y + 0.2, pos.z);
        leftArm.rotation.z = Math.PI / 4;
        leftArm.material = jerseyMat;
        leftArm.parent = torso;
        
        const rightArm = MeshBuilder.CreateCapsule('playerRightArm' + idx, { height: 0.8, radius: 0.1 }, newScene);
        rightArm.position = new Vector3(pos.x + 0.4, pos.y + 0.2, pos.z);
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.material = jerseyMat;
        rightArm.parent = torso;
        
        // Player legs
        const leftLeg = MeshBuilder.CreateCapsule('playerLeftLeg' + idx, { height: 1.0, radius: 0.12 }, newScene);
        leftLeg.position = new Vector3(pos.x - 0.15, pos.y - 0.8, pos.z);
        const shortsMat = new StandardMaterial('shortsMat' + idx, newScene);
        shortsMat.diffuseColor = new Color3(0.2, 0.2, 0.2); // Dark shorts
        leftLeg.material = shortsMat;
        leftLeg.parent = torso;
        
        const rightLeg = MeshBuilder.CreateCapsule('playerRightLeg' + idx, { height: 1.0, radius: 0.12 }, newScene);
        rightLeg.position = new Vector3(pos.x + 0.15, pos.y - 0.8, pos.z);
        rightLeg.material = shortsMat;
        rightLeg.parent = torso;
        
        // Player shoes
        const leftShoe = MeshBuilder.CreateBox('playerLeftShoe' + idx, { width: 0.2, height: 0.1, depth: 0.3 }, newScene);
        leftShoe.position = new Vector3(pos.x - 0.15, pos.y - 1.3, pos.z);
        const shoeMat = new StandardMaterial('shoeMat' + idx, newScene);
        shoeMat.diffuseColor = new Color3(0.1, 0.1, 0.1); // Black shoes
        leftShoe.material = shoeMat;
        leftShoe.parent = leftLeg;
        
        const rightShoe = MeshBuilder.CreateBox('playerRightShoe' + idx, { width: 0.2, height: 0.1, depth: 0.3 }, newScene);
        rightShoe.position = new Vector3(pos.x + 0.15, pos.y - 1.3, pos.z);
        rightShoe.material = shoeMat;
        rightShoe.parent = rightLeg;
        
        // Jersey number
        const numberMat = new StandardMaterial('numberMat' + idx, newScene);
        numberMat.diffuseColor = Color3.White();
        const number = MeshBuilder.CreatePlane('playerNumber' + idx, { width: 0.2, height: 0.3 }, newScene);
        number.position = new Vector3(pos.x, pos.y + 0.1, pos.z + 0.31);
        number.material = numberMat;
        number.parent = torso;
        
        // Ball mesh parented to player
        const ball = MeshBuilder.CreateSphere('playerBall' + idx, { diameter: 0.3 }, newScene);
        ball.position = new Vector3(0.3, -0.7, 0.3); // offset to right hand
        ball.parent = rightArm;
        
        // Enable shadows for all player parts
        if (shadowGenerator) {
          shadowGenerator.addShadowCaster(torso);
          shadowGenerator.addShadowCaster(head);
          shadowGenerator.addShadowCaster(leftArm);
          shadowGenerator.addShadowCaster(rightArm);
          shadowGenerator.addShadowCaster(leftLeg);
          shadowGenerator.addShadowCaster(rightLeg);
          shadowGenerator.addShadowCaster(leftShoe);
          shadowGenerator.addShadowCaster(rightShoe);
        }
      });
      
      // Court environment - walls and bleachers
      const wallMaterial = new StandardMaterial('wallMaterial', newScene);
      wallMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8); // Light gray walls
      wallMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
      
      // Move back wall behind bleachers
      const bleacherRows = 5;
      const bleacherDepth = 1.5;
      const bleacherStartZ = courtDepth / 2 + 4;
      const backWallZ = bleacherStartZ + bleacherRows * bleacherDepth + 1; // 1m behind last bleacher
      const backWallWidth = courtWidth + 8;
      const backWall = MeshBuilder.CreateBox('backWall', { width: backWallWidth, height: 8, depth: 0.2 }, newScene);
      backWall.position = new Vector3(0, 4, backWallZ);
      backWall.material = wallMaterial;
      
      // Side walls
      const leftWall = MeshBuilder.CreateBox('leftWall', { width: 0.2, height: 8, depth: courtDepth + 4 }, newScene);
      leftWall.position = new Vector3(-courtWidth / 2 - 2, 4, 0);
      leftWall.material = wallMaterial;
      
      const rightWall = MeshBuilder.CreateBox('rightWall', { width: 0.2, height: 8, depth: courtDepth + 4 }, newScene);
      rightWall.position = new Vector3(courtWidth / 2 + 2, 4, 0);
      rightWall.material = wallMaterial;
      
      // Bleachers (seating area)
      const bleacherMaterial = new StandardMaterial('bleacherMaterial', newScene);
      bleacherMaterial.diffuseColor = new Color3(0.3, 0.3, 0.3); // Dark gray
      
      // Create bleacher sections
      for (let i = 0; i < 5; i++) {
        const bleacher = MeshBuilder.CreateBox(`bleacher${i}`, { 
          width: courtWidth + 6, 
          height: 0.3, 
          depth: 1.5 
        }, newScene);
        bleacher.position = new Vector3(0, 0.5 + i * 0.8, courtDepth / 2 + 4 + i * 1.5);
        bleacher.material = bleacherMaterial;
      }
      
      // Court ceiling/roof
      const ceilingMaterial = new StandardMaterial('ceilingMaterial', newScene);
      ceilingMaterial.diffuseColor = new Color3(0.9, 0.9, 0.9); // White ceiling
      
      const ceiling = MeshBuilder.CreateBox('ceiling', { 
        width: courtWidth + 8, 
        height: 0.2, 
        depth: courtDepth + 8 
      }, newScene);
      ceiling.position = new Vector3(0, 12, 0);
      ceiling.material = ceilingMaterial;
      
      // Scoreboard
      const scoreboardMaterial = new StandardMaterial('scoreboardMaterial', newScene);
      scoreboardMaterial.diffuseColor = new Color3(0.1, 0.1, 0.1); // Dark scoreboard
      
      const scoreboard = MeshBuilder.CreateBox('scoreboard', { 
        width: 4, 
        height: 2, 
        depth: 0.3 
      }, newScene);
      scoreboard.position = new Vector3(0, 10, 0);
      scoreboard.material = scoreboardMaterial;
      
      // Enable shadows for environment
      if (shadowGenerator) {
        shadowGenerator.addShadowCaster(backWall);
        shadowGenerator.addShadowCaster(leftWall);
        shadowGenerator.addShadowCaster(rightWall);
        shadowGenerator.addShadowCaster(ceiling);
        shadowGenerator.addShadowCaster(scoreboard);
        
        // Note: Shadow receivers are automatically handled by Babylon.js
      }
    }
  }, [engine, scene, players]);

  // Enhanced ball shot with physics and accuracy based on sequence copying
  const animateBallShot = (from: Vector3, to: Vector3, apexHeight: number = 2.5, willGoIn: boolean = true) => {
    if (!scene) return;
    const ball = scene.getMeshByName('ball');
    if (!ball) return;

    // Calculate shot trajectory with physics
    const gravity = 9.8; // m/s²
    const timeOfFlight = 1.2; // seconds
    const frames = 72; // 60fps * 1.2s
    
    // Add accuracy variation based on willGoIn
    let targetPoint = to.clone();
    if (!willGoIn) {
      // Miss the shot - add random offset
      const missOffset = new Vector3(
        (Math.random() - 0.5) * 0.8, // X offset
        0,
        (Math.random() - 0.5) * 0.8  // Z offset
      );
      targetPoint.addInPlace(missOffset);
    }

    const keys = [];
    for (let frame = 0; frame <= frames; frame++) {
      const t = frame / frames;
      
      // Parabolic trajectory with physics
      const x = from.x + (targetPoint.x - from.x) * t;
      const z = from.z + (targetPoint.z - from.z) * t;
      
      // Y position with gravity: y = y0 + v0*t - 0.5*g*t²
      const initialVelocity = (2 * apexHeight) / (timeOfFlight / 2);
      const y = from.y + initialVelocity * t - 0.5 * gravity * t * t;
      
      keys.push({ frame, value: new Vector3(x, y, z) });
    }

    const anim = new Animation('ballShot', 'position', frames, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    anim.setKeys(keys);
    ball.animations = [anim];
    
    // Add ball rotation for realism
    const rotationKeys = [];
    for (let frame = 0; frame <= frames; frame++) {
      const t = frame / frames;
      const rotationSpeed = 4; // rotations per second
      const rotationY = t * rotationSpeed * 2 * Math.PI;
      rotationKeys.push({ frame, value: rotationY });
    }
    const rotAnim = new Animation('ballRotation', 'rotation.y', frames, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    rotAnim.setKeys(rotationKeys);
    
    ball.animations = [anim, rotAnim];
    scene.beginAnimation(ball, 0, frames, false);
  };

  // Enhanced player movement with realistic walking animation
  const animatePlayerMove = (playerIdx: number, from: Vector3, to: Vector3) => {
    if (!scene) return;
    const player = scene.getMeshByName('player' + playerIdx);
    const ball = scene.getMeshByName('playerBall' + playerIdx);
    if (!player || !ball) return;
    
    const distance = Vector3.Distance(from, to);
    const duration = Math.max(30, distance * 20); // Duration based on distance
    
    // Position animation with easing
    const posKeys = [];
    for (let f = 0; f <= duration; f += 5) {
      const t = f / duration;
      // Ease in/out for more natural movement
      const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = from.x + (to.x - from.x) * easedT;
      const z = from.z + (to.z - from.z) * easedT;
      const y = from.y + Math.sin(t * Math.PI * 4) * 0.1; // Subtle bounce
      posKeys.push({ frame: f, value: new Vector3(x, y, z) });
    }
    
    // Rotation animation - player faces movement direction
    const rotKeys = [];
    const direction = to.subtract(from).normalize();
    const targetRotation = Math.atan2(direction.x, direction.z);
    
    for (let f = 0; f <= duration; f += 5) {
      const t = f / duration;
      const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const rotationY = targetRotation * easedT;
      rotKeys.push({ frame: f, value: rotationY });
    }
    
    const posAnim = new Animation('playerMovePos' + playerIdx, 'position', duration, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    posAnim.setKeys(posKeys);
    const rotAnim = new Animation('playerMoveRot' + playerIdx, 'rotation.y', duration, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    rotAnim.setKeys(rotKeys);
    
    player.animations = [posAnim, rotAnim];
    scene.beginAnimation(player, 0, duration, false);
  };

  // Enhanced dribbling animation with realistic ball physics and player movement
  const animatePlayerDribble = async (playerIdx: number, positions: Vector3[]) => {
    if (!scene) return;
    for (let i = 0; i < positions.length - 1; i++) {
      await new Promise<void>(resolve => {
        const player = scene.getMeshByName('player' + playerIdx);
        const ball = scene.getMeshByName('playerBall' + playerIdx);
        if (!player || !ball) return resolve();
        
        const from = positions[i];
        const to = positions[i + 1];
        const distance = Vector3.Distance(from, to);
        const duration = Math.max(45, distance * 15); // Duration based on distance
        
        // Player movement with realistic walking
        const playerKeys = [];
        for (let f = 0; f <= duration; f += 3) {
          const t = f / duration;
          // Ease in/out for natural movement
          const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const x = from.x + (to.x - from.x) * easedT;
          const z = from.z + (to.z - from.z) * easedT;
          const y = from.y + Math.sin(t * Math.PI * 6) * 0.05; // Subtle bounce while walking
          playerKeys.push({ frame: f, value: new Vector3(x, y, z) });
        }
        
        // Player rotation - faces movement direction
        const rotKeys = [];
        const direction = to.subtract(from).normalize();
        const targetRotation = Math.atan2(direction.x, direction.z);
        
        for (let f = 0; f <= duration; f += 3) {
          const t = f / duration;
          const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const rotationY = targetRotation * easedT;
          rotKeys.push({ frame: f, value: rotationY });
        }
        
        // Realistic ball bouncing with physics
        const ballKeys = [];
        const bounceHeight = 0.6;
        const bounceSpeed = 8; // Bounces per second
        
        for (let f = 0; f <= duration; f += 3) {
          const t = f / duration;
          const time = t * (duration / 60); // Convert to seconds
          
          // Ball follows player with realistic bouncing
          const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const ballX = from.x + (to.x - from.x) * easedT + 0.3; // Offset to right hand
          const ballZ = from.z + (to.z - from.z) * easedT + 0.3;
          
          // Realistic bounce with gravity
          const bounce = Math.abs(Math.sin(bounceSpeed * Math.PI * time));
          const ballY = from.y - 0.7 + bounce * bounceHeight;
          
          ballKeys.push({ frame: f, value: new Vector3(ballX, ballY, ballZ) });
        }
        
        const playerPosAnim = new Animation('playerDribblePos' + playerIdx, 'position', duration, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        playerPosAnim.setKeys(playerKeys);
        const playerRotAnim = new Animation('playerDribbleRot' + playerIdx, 'rotation.y', duration, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        playerRotAnim.setKeys(rotKeys);
        const ballAnim = new Animation('playerDribbleBall' + playerIdx, 'position', duration, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);
        ballAnim.setKeys(ballKeys);
        
        player.animations = [playerPosAnim, playerRotAnim];
        ball.animations = [ballAnim];
        
        scene.beginAnimation(player, 0, duration, false);
        scene.beginAnimation(ball, 0, duration, false, undefined, undefined, undefined, resolve);
        setTimeout(resolve, (duration / 60) * 1000 + 100);
      });
    }
  };
  // Enhanced shooting animation with realistic jump and shot mechanics
  const animatePlayerJump = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      const ball = scene.getMeshByName('playerBall' + playerIdx);
      if (!player || !ball) return resolve();
      
      const duration = 90; // Longer animation for more realistic shot
      
      // Position animation with realistic jump arc
      const posKeys = [];
      for (let f = 0; f <= duration; f += 3) {
        const t = f / duration;
        const x = from.x + (to.x - from.x) * t;
        const z = from.z + (to.z - from.z) * t;
        
        // Realistic jump arc with proper physics
        const jumpHeight = 1.2;
        const jumpPeak = 0.6; // Peak at 60% of animation
        let y;
        if (t < jumpPeak) {
          // Going up - ease out
          const upT = t / jumpPeak;
          y = from.y + jumpHeight * (1 - Math.pow(1 - upT, 3));
        } else {
          // Coming down - ease in
          const downT = (t - jumpPeak) / (1 - jumpPeak);
          y = from.y + jumpHeight * (1 - Math.pow(downT, 2));
        }
        posKeys.push({ frame: f, value: new Vector3(x, y, z) });
      }
      
      // Rotation animation - player faces basket during jump
      const rotKeys = [];
      const direction = to.subtract(from).normalize();
      const targetRotation = Math.atan2(direction.x, direction.z);
      
      for (let f = 0; f <= duration; f += 3) {
        const t = f / duration;
        const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const rotationY = targetRotation * easedT;
        rotKeys.push({ frame: f, value: rotationY });
      }
      
      // Ball animation - ball leaves player's hand during jump
      const ballKeys = [];
      for (let f = 0; f <= duration; f += 3) {
        const t = f / duration;
        if (t < 0.3) {
          // Ball stays with player
          ballKeys.push({ frame: f, value: new Vector3(0.3, -0.7, 0.3) });
        } else {
          // Ball leaves player's hand and goes toward basket
          const ballT = (t - 0.3) / 0.7;
          const ballX = 0.3 + (to.x - from.x) * ballT * 0.5;
          const ballZ = 0.3 + (to.z - from.z) * ballT * 0.5;
          const ballY = -0.7 + (2.5 - from.y) * ballT; // Ball goes up toward basket
          ballKeys.push({ frame: f, value: new Vector3(ballX, ballY, ballZ) });
        }
      }
      
      const posAnim = new Animation('playerJumpPos' + playerIdx, 'position', duration, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      posAnim.setKeys(posKeys);
      const rotAnim = new Animation('playerJumpRot' + playerIdx, 'rotation.y', duration, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
      rotAnim.setKeys(rotKeys);
      const ballAnim = new Animation('playerJumpBall' + playerIdx, 'position', duration, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      ballAnim.setKeys(ballKeys);
      
      player.animations = [posAnim, rotAnim];
      ball.animations = [ballAnim];
      
      scene.beginAnimation(player, 0, duration, false);
      scene.beginAnimation(ball, 0, duration, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1500);
    });
  };

  // Player layup: curved path to basket with jump at end
  const animatePlayerLayup = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      if (!player) return resolve();
      // Curved path: start → curve → basket
      const keys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Curve: x moves linearly, z curves toward basket, y jumps at end
        const x = from.x + (to.x - from.x) * t;
        const z = from.z + (to.z - from.z) * t;
        // Jump height increases toward the end
        const jumpHeight = 0.8;
        const y = from.y + (1 - 4 * Math.pow(t - 0.8, 2)) * jumpHeight; // peak at 80%
        keys.push({ frame: f, value: new Vector3(x, y, z) });
      }
      const anim = new Animation('playerLayup' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      anim.setKeys(keys);
      player.animations = [anim];
      scene.beginAnimation(player, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };
  // Player crossover: side-to-side movement
  const animatePlayerCrossover = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      const ball = scene.getMeshByName('playerBall' + playerIdx);
      if (!player || !ball) return resolve();
      // Move player from A to B
      const playerKeys = [
        { frame: 0, value: from },
        { frame: 60, value: to },
      ];
      const playerAnim = new Animation('playerCrossoverMove' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      playerAnim.setKeys(playerKeys);
      player.animations = [playerAnim];
      scene.beginAnimation(player, 0, 60, false);
      // Animate ball switching sides (crossover effect)
      const ballKeys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Ball moves from right to left hand during crossover
        const sideOffset = Math.sin(Math.PI * t) * 0.6; // -0.6 to +0.6
        ballKeys.push({ frame: f, value: 0.3 + sideOffset }); // x position
      }
      const ballAnim = new Animation('playerCrossoverBall' + playerIdx, 'position.x', 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
      ballAnim.setKeys(ballKeys);
      ball.animations = [ballAnim];
      scene.beginAnimation(ball, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };

  // Player spin: 360° rotation while moving
  const animatePlayerSpin = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      if (!player) return resolve();
      // Move player from A to B with 360° rotation
      const keys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Linear movement
        const x = from.x + (to.x - from.x) * t;
        const z = from.z + (to.z - from.z) * t;
        const y = from.y;
        keys.push({ frame: f, value: new Vector3(x, y, z) });
      }
      const posAnim = new Animation('playerSpinMove' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      posAnim.setKeys(keys);
      // Rotation animation (360° = 2π radians)
      const rotKeys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        const rotationY = t * 2 * Math.PI; // 0 to 2π
        rotKeys.push({ frame: f, value: rotationY });
      }
      const rotAnim = new Animation('playerSpinRot' + playerIdx, 'rotation.y', 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
      rotAnim.setKeys(rotKeys);
      player.animations = [posAnim, rotAnim];
      scene.beginAnimation(player, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };

  // Player step-back: backward movement with jump
  const animatePlayerStepBack = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      if (!player) return resolve();
      // Step back: move backward while jumping
      const keys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Linear movement backward
        const x = from.x + (to.x - from.x) * t;
        const z = from.z + (to.z - from.z) * t;
        // Jump height with step-back timing
        const jumpHeight = 0.6;
        const y = from.y + (1 - 4 * Math.pow(t - 0.6, 2)) * jumpHeight; // peak at 60%
        keys.push({ frame: f, value: new Vector3(x, y, z) });
      }
      const anim = new Animation('playerStepBack' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      anim.setKeys(keys);
      player.animations = [anim];
      scene.beginAnimation(player, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };

  // Player euro step: side-to-side motion while moving forward
  const animatePlayerEuroStep = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      if (!player) return resolve();
      // Euro step: forward movement with side-to-side motion
      const keys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Forward movement (z)
        const z = from.z + (to.z - from.z) * t;
        // Side-to-side motion (x) - left, right, left pattern
        const sideOffset = Math.sin(3 * Math.PI * t) * 1.5; // 3 oscillations
        const x = from.x + (to.x - from.x) * t + sideOffset;
        const y = from.y;
        keys.push({ frame: f, value: new Vector3(x, y, z) });
      }
      const anim = new Animation('playerEuroStep' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      anim.setKeys(keys);
      player.animations = [anim];
      scene.beginAnimation(player, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };

  // Player drive: fast direct movement to basket with jump at end
  const animatePlayerDrive = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      if (!player) return resolve();
      // Drive: fast movement with jump at the end
      const keys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Fast linear movement
        const x = from.x + (to.x - from.x) * t;
        const z = from.z + (to.z - from.z) * t;
        // Jump height increases toward the end (last 20% of animation)
        const jumpHeight = 0.4;
        const jumpStart = 0.8; // Start jump at 80%
        let y = from.y;
        if (t >= jumpStart) {
          const jumpT = (t - jumpStart) / (1 - jumpStart);
          y = from.y + (1 - 4 * Math.pow(jumpT - 0.5, 2)) * jumpHeight;
        }
        keys.push({ frame: f, value: new Vector3(x, y, z) });
      }
      const anim = new Animation('playerDrive' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      anim.setKeys(keys);
      player.animations = [anim];
      scene.beginAnimation(player, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };

  // Player dunk: high jump with forward movement
  const animatePlayerDunk = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      if (!player) return resolve();
      // Dunk: high jump with forward movement
      const keys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Forward movement
        const x = from.x + (to.x - from.x) * t;
        const z = from.z + (to.z - from.z) * t;
        // High jump (higher than normal) with improved curve
        const jumpHeight = 1.7; // Slightly higher
        const jumpCurve = Math.sin(t * Math.PI) * 0.2; // Subtle bounce
        const y = from.y + (1 - 4 * Math.pow(t - 0.5, 2)) * jumpHeight + jumpCurve;
        keys.push({ frame: f, value: new Vector3(x, y, z) });
      }
      const anim = new Animation('playerDunk' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      anim.setKeys(keys);
      player.animations = [anim];
      scene.beginAnimation(player, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };

  // Player reverse dunk: high jump with backward rotation
  const animatePlayerReverseDunk = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      if (!player) return resolve();
      // Reverse dunk: high jump with backward rotation
      const keys = [];
      const rotationKeys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Forward movement
        const x = from.x + (to.x - from.x) * t;
        const z = from.z + (to.z - from.z) * t;
        // High jump (higher than normal) with improved curve
        const jumpHeight = 2.0; // Even higher than regular dunk
        const jumpCurve = Math.sin(t * Math.PI) * 0.3; // More dramatic bounce
        const y = from.y + (1 - 4 * Math.pow(t - 0.5, 2)) * jumpHeight + jumpCurve;
        keys.push({ frame: f, value: new Vector3(x, y, z) });
        // Backward rotation (180 degrees) with improved timing
        const rotation = t * Math.PI; // 0 to π radians (0 to 180 degrees)
        rotationKeys.push({ frame: f, value: new Vector3(0, rotation, 0) });
      }
      const posAnim = new Animation('playerReverseDunkPos' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      posAnim.setKeys(keys);
      const rotAnim = new Animation('playerReverseDunkRot' + playerIdx, 'rotation', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      rotAnim.setKeys(rotationKeys);
      player.animations = [posAnim, rotAnim];
      scene.beginAnimation(player, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };

  // Player windmill dunk: circular arm motion with high jump
  const animatePlayerWindmillDunk = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      if (!player) return resolve();
      // Windmill: high jump with circular arm motion (360° rotation)
      const keys = [];
      const rotationKeys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Forward movement
        const x = from.x + (to.x - from.x) * t;
        const z = from.z + (to.z - from.z) * t;
        // Very high jump
        const jumpHeight = 2.0;
        const y = from.y + (1 - 4 * Math.pow(t - 0.5, 2)) * jumpHeight;
        keys.push({ frame: f, value: new Vector3(x, y, z) });
        // Full 360° rotation (windmill motion)
        const rotation = t * 2 * Math.PI; // 0 to 2π radians (0 to 360 degrees)
        rotationKeys.push({ frame: f, value: new Vector3(0, rotation, 0) });
      }
      const posAnim = new Animation('playerWindmillDunkPos' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      posAnim.setKeys(keys);
      const rotAnim = new Animation('playerWindmillDunkRot' + playerIdx, 'rotation', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      rotAnim.setKeys(rotationKeys);
      player.animations = [posAnim, rotAnim];
      scene.beginAnimation(player, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };

  // Player tomahawk dunk: overhead windmill with dramatic jump
  const animatePlayerTomahawkDunk = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      if (!player) return resolve();
      // Tomahawk: dramatic jump with overhead windmill motion
      const keys = [];
      const rotationKeys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Forward movement
        const x = from.x + (to.x - from.x) * t;
        const z = from.z + (to.z - from.z) * t;
        // Very high jump with dramatic curve
        const jumpHeight = 2.2;
        const jumpCurve = Math.sin(t * Math.PI) * 0.3; // Extra bounce
        const y = from.y + (1 - 4 * Math.pow(t - 0.5, 2)) * jumpHeight + jumpCurve;
        keys.push({ frame: f, value: new Vector3(x, y, z) });
        // Overhead windmill rotation (1.5 rotations)
        const rotation = t * 3 * Math.PI; // 0 to 3π radians (0 to 540 degrees)
        rotationKeys.push({ frame: f, value: new Vector3(0, rotation, 0) });
      }
      const posAnim = new Animation('playerTomahawkDunkPos' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      posAnim.setKeys(keys);
      const rotAnim = new Animation('playerTomahawkDunkRot' + playerIdx, 'rotation', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      rotAnim.setKeys(rotationKeys);
      player.animations = [posAnim, rotAnim];
      scene.beginAnimation(player, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };

  // Player between legs dunk: high jump with leg separation motion
  const animatePlayerBetweenLegsDunk = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      if (!player) return resolve();
      // Between legs: high jump with leg separation motion
      const keys = [];
      const rotationKeys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Forward movement
        const x = from.x + (to.x - from.x) * t;
        const z = from.z + (to.z - from.z) * t;
        // Very high jump
        const jumpHeight = 2.1;
        const y = from.y + (1 - 4 * Math.pow(t - 0.5, 2)) * jumpHeight;
        keys.push({ frame: f, value: new Vector3(x, y, z) });
        // Leg separation motion (back and forth rotation)
        const rotation = Math.sin(t * 4 * Math.PI) * 0.5; // Oscillating rotation
        rotationKeys.push({ frame: f, value: new Vector3(0, rotation, 0) });
      }
      const posAnim = new Animation('playerBetweenLegsDunkPos' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      posAnim.setKeys(keys);
      const rotAnim = new Animation('playerBetweenLegsDunkRot' + playerIdx, 'rotation', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      rotAnim.setKeys(rotationKeys);
      player.animations = [posAnim, rotAnim];
      scene.beginAnimation(player, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };

  // Player alley-oop dunk: high jump with dramatic approach
  const animatePlayerAlleyOopDunk = (playerIdx: number, from: Vector3, to: Vector3) => {
    return new Promise<void>(resolve => {
      if (!scene) return resolve();
      const player = scene.getMeshByName('player' + playerIdx);
      if (!player) return resolve();
      // Alley-oop: dramatic approach with high jump
      const keys = [];
      const rotationKeys = [];
      for (let f = 0; f <= 60; f += 5) {
        const t = f / 60;
        // Dramatic approach with curve
        const approachCurve = Math.sin(t * Math.PI) * 1.0; // Side-to-side approach
        const x = from.x + (to.x - from.x) * t + approachCurve;
        const z = from.z + (to.z - from.z) * t;
        // Very high jump
        const jumpHeight = 2.3;
        const y = from.y + (1 - 4 * Math.pow(t - 0.5, 2)) * jumpHeight;
        keys.push({ frame: f, value: new Vector3(x, y, z) });
        // Dramatic rotation during approach
        const rotation = t * Math.PI * 0.5; // 0 to π/2 radians (0 to 90 degrees)
        rotationKeys.push({ frame: f, value: new Vector3(0, rotation, 0) });
      }
      const posAnim = new Animation('playerAlleyOopDunkPos' + playerIdx, 'position', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      posAnim.setKeys(keys);
      const rotAnim = new Animation('playerAlleyOopDunkRot' + playerIdx, 'rotation', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
      rotAnim.setKeys(rotationKeys);
      player.animations = [posAnim, rotAnim];
      scene.beginAnimation(player, 0, 60, false, undefined, undefined, undefined, resolve);
      setTimeout(resolve, 1100);
    });
  };

  useImperativeHandle(ref, () => ({ 
    animateBallShot, 
    animatePlayerMove, 
    animatePlayerDribble, 
    animatePlayerJump, 
    animatePlayerLayup, 
    animatePlayerCrossover, 
    animatePlayerSpin, 
    animatePlayerStepBack, 
    animatePlayerEuroStep, 
    animatePlayerDrive, 
    animatePlayerDunk, 
    animatePlayerReverseDunk,
    animatePlayerWindmillDunk,
    animatePlayerTomahawkDunk,
    animatePlayerBetweenLegsDunk,
    animatePlayerAlleyOopDunk
  }), [scene]);

  return (
    <View style={styles.container}>
      <EngineView
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height - 1,
        }}
        camera={camera ?? undefined}
        onInitialized={() => {}}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  engineView: {
    flex: 1,
  },
  debugText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    zIndex: 10,
  },
});

export default BabylonCourt;
