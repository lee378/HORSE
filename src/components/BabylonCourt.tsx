import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, Image } from 'react-native';
import { EngineView, useEngine } from '@babylonjs/react-native';
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Texture,
} from '@babylonjs/core';
import { GameSequence } from '../types';

interface BabylonCourtProps {
  currentSequence: GameSequence | undefined;
  currentMoveIndex: number;
  isSequencePlaying: boolean;
  isSequenceReplaying: boolean;
  onMoveComplete: (moveIndex: number) => void;
  onSequenceComplete: (success: boolean) => void;
  onCameraInitialized: (camera: ArcRotateCamera) => void;
}

const BabylonCourt: React.FC<BabylonCourtProps> = ({ onCameraInitialized }) => {
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

      new HemisphericLight('light', new Vector3(0, 1, 0), newScene);

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

      // Baseline (under hoop)
      MeshBuilder.CreateBox('baseline', { width: courtWidth, height: lineThickness, depth: lineThickness }, newScene).position = new Vector3(0, 0, courtDepth / 2);
      // Sidelines
      MeshBuilder.CreateBox('sidelineL', { width: lineThickness, height: lineThickness, depth: courtDepth }, newScene).position = new Vector3(-courtWidth / 2, 0, 0);
      MeshBuilder.CreateBox('sidelineR', { width: lineThickness, height: lineThickness, depth: courtDepth }, newScene).position = new Vector3(courtWidth / 2, 0, 0);
      // Half-court line
      MeshBuilder.CreateBox('halfCourt', { width: courtWidth, height: lineThickness, depth: lineThickness }, newScene).position = new Vector3(0, 0, -courtDepth / 2);

      // Key (rectangle)
      MeshBuilder.CreateBox('key', { width: keyWidth, height: lineThickness, depth: keyHeight }, newScene).position = new Vector3(0, 0.01, courtDepth / 2 - backboardDist - keyHeight / 2);
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

      // Materials for hoop and backboard
      const whiteMaterial = new StandardMaterial('whiteMaterial', newScene);
      whiteMaterial.diffuseColor = Color3.White();
      const redMaterial = new StandardMaterial('redMaterial', newScene);
      redMaterial.diffuseColor = Color3.Red();

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

      // Hoop (simple cylinder for now)
      const hoop = MeshBuilder.CreateCylinder('hoop', { diameter: 1, height: 0.1 }, newScene);
      hoop.position = new Vector3(0, 1.5, courtDepth / 2 - 1);
      hoop.material = redMaterial;

      // Backboard (simple box)
      const backboard = MeshBuilder.CreateBox('backboard', { width: 3, height: 2, depth: 0.1 }, newScene);
      backboard.position = new Vector3(0, 2.5, courtDepth / 2 - 0.8);
      backboard.material = whiteMaterial;

      // Paint area (key fill)
      const paintMat = new StandardMaterial('paintMat', newScene);
      paintMat.diffuseColor = new Color3(0.6, 0.6, 0.6); // gray
      const paint = MeshBuilder.CreateBox('paint', { width: keyWidth, depth: keyHeight, height: 0.11 }, newScene);
      paint.position = new Vector3(0, 0.01, courtDepth / 2 - backboardDist - keyHeight / 2);
      paint.material = paintMat;

      const ball = MeshBuilder.CreateSphere('ball', { diameter: 0.5 }, newScene);
      ball.position = new Vector3(0, 0.3, 0);
    }
  }, [engine, scene]);

  return (
    <View style={styles.container}>
      <Text style={styles.debugText}>DEBUG: BabylonCourt Rendered</Text>
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
};

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
