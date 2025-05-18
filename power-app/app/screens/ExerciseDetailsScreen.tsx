import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Platform } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import * as Asset from "expo-asset";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Instructional narration per step with more detailed biomechanical information
const voiceInstructions = [
  {
    title: "Starting Position",
    description: "Feet shoulder-width apart. Hip angle about 90 degrees. Knee angle around 100 degrees. Back is flat, chest up. Grip slightly wider than shoulder-width. Shoulders slightly in front of the bar.",
    keyPoints: ["Feet shoulder-width", "Hip angle 90°", "Knee angle 100°", "Flat back"]
  },
  {
    title: "First Pull",
    description: "Extend knees to lift the bar. Knee angle opens from 100 to 140 degrees. Hip angle remains around 90 to 100 degrees. Maintain flat back angle. Bar moves vertically close to shins.",
    keyPoints: ["Knee extension", "Hip angle stable", "Bar close to body"]
  },
  {
    title: "Bar Passes Knees",
    description: "Hip angle begins to open. Hips and shoulders rise together. Hip angle increasing to about 120 degrees. Bar accelerates as it passes mid-thigh. Shoulders remain slightly in front of the bar.",
    keyPoints: ["Hips rise", "Bar acceleration", "Shoulders forward"]
  },
  {
    title: "Power Position",
    description: "Fully extend hips and knees. Hip angle reaches 180 degrees. Knee angle near 180. Shoulders shrug upward. Bar reaches maximal velocity. Full triple extension (ankles, knees, hips).",
    keyPoints: ["Triple extension", "Maximal velocity", "Shoulder shrug"]
  },
  {
    title: "Pull Under",
    description: "Begin dropping under the bar. Elbows rotate under. Hips and knees rapidly flex back to 90 and 100 degrees. Aggressive turnover of the elbows. Fast downward movement under the bar.",
    keyPoints: ["Fast drop", "Elbow rotation", "Hip/knee flexion"]
  },
  {
    title: "Catch Position",
    description: "Bar overhead. Arms locked. Shoulder angle about 180 degrees. Hips and knees in deep squat—around 60 to 90 degrees. Chest up, core braced. Bar directly over base of support.",
    keyPoints: ["Arms locked", "Deep squat", "Bar balanced"]
  },
  {
    title: "Recovery",
    description: "Stand up from the squat. Extend knees and hips to return to vertical. Hip and knee angles return to 180 degrees. Maintain bar position overhead. Finish in stable standing position.",
    keyPoints: ["Controlled stand", "Maintain balance", "Finish upright"]
  },
];

// Animation step time ranges (in seconds)
const stepRanges = [
  [0.0, 0.5],   // Starting position
  [0.5, 1.5],   // First pull
  [1.5, 2.5],   // Bar passes knees
  [2.5, 3.5],   // Power position
  [3.5, 4.5],   // Pull under
  [4.5, 5.5],   // Catch position
  [5.5, 6.5],   // Recovery
];

const AnimatedModel = ({
  modelPath,
  stepIndex,
  isSlow,
  isAutoPlay,
  onStepEnd,
}: {
  modelPath: string;
  stepIndex: number;
  isSlow: boolean;
  isAutoPlay: boolean;
  onStepEnd: () => void;
}) => {
  const gltf = useGLTF(modelPath);
  const { scene, animations } = gltf;
  const { actions, mixer } = useAnimations(animations, scene);

  const actionRef = useRef<any>(null);

  useEffect(() => {
    if (animations.length > 0) {
      const action = actions[animations[0].name];
      if (action) {
        const [start, end] = stepRanges[stepIndex];

        action.reset().play();
        action.setEffectiveTimeScale(isSlow ? 0.3 : 1);
        action.time = start;
        action.paused = false;
        actionRef.current = { action, start, end };
      }
    }
  }, [animations, actions, stepIndex, isSlow, isAutoPlay]);

  useFrame((_, delta) => {
    if (isAutoPlay && actionRef.current) {
      mixer.update(delta);
      const { action, end } = actionRef.current;
      if (action.time >= end) {
        action.paused = true;
        actionRef.current = null;
        onStepEnd();
      }
    }
  });

  return <primitive object={scene} scale={0.5} />;
};

export default function App() {
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSlow, setIsSlow] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(voiceInstructions[0]);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    async function loadModel() {
      const asset = Asset.Asset.fromModule(require("../../assets/models/snatch.glb"));
      await asset.downloadAsync();
      setModelPath(asset.localUri);
    }
    loadModel();
  }, []);

  useEffect(() => {
    setCurrentInstruction(voiceInstructions[stepIndex]);
  }, [stepIndex]);

  useEffect(() => {
    if (!isAutoPlay || !voiceInstructions[stepIndex]) return;

    const text = voiceInstructions[stepIndex].description;
    isSpeakingRef.current = true;
    setIsPlaying(true);

    Speech.speak(text, {
      onDone: () => {
        isSpeakingRef.current = false;
        setIsPlaying(false);
      },
      onStopped: () => {
        isSpeakingRef.current = false;
        setIsPlaying(false);
      },
    });

    return () => {
      Speech.stop();
    };
  }, [stepIndex, isAutoPlay]);

  const handleStepEnd = () => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        if (!isSpeakingRef.current) {
          clearInterval(interval);
          if (stepIndex < voiceInstructions.length - 1) {
            setStepIndex((prev) => prev + 1);
          } else {
            setIsAutoPlay(false);
          }
        }
      }, 200);
    }
  };

  const handleNextStep = () => {
    if (stepIndex < voiceInstructions.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const toggleAutoPlay = () => {
    if (isAutoPlay) {
      setIsAutoPlay(false);
      Speech.stop();
    } else {
      setStepIndex(0);
      setIsAutoPlay(true);
    }
  };

  const toggleSpeed = () => {
    setIsSlow(!isSlow);
  };

  const repeatInstruction = () => {
    Speech.stop();
    Speech.speak(voiceInstructions[stepIndex].description);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#1a2a3a', '#0d1219']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Olympic Snatch Tutorial</Text>
          <Text style={styles.headerSubtitle}>Professional Weightlifting Analysis</Text>
        </View>

        {/* 3D Model View */}
        <View style={styles.modelContainer}>
          <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            {modelPath && (
              <AnimatedModel
                modelPath={modelPath}
                stepIndex={stepIndex}
                isSlow={isSlow}
                isAutoPlay={isAutoPlay}
                onStepEnd={handleStepEnd}
              />
            )}
            <OrbitControls enablePan={false} />
          </Canvas>
        </View>

        {/* Current Step Info */}
        <View style={styles.stepInfoContainer}>
          <Text style={styles.stepTitle}>{currentInstruction.title}</Text>
          <Text style={styles.stepNumber}>Step {stepIndex + 1} of {voiceInstructions.length}</Text>
          
          {/* Key Points */}
          <View style={styles.keyPointsContainer}>
            {currentInstruction.keyPoints.map((point, index) => (
              <View key={index} style={styles.keyPoint}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.keyPointText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {/* Navigation Controls */}
          <View style={styles.navigationControls}>
            <TouchableOpacity 
              style={[styles.navButton, stepIndex === 0 && styles.disabledButton]}
              onPress={handlePrevStep}
              disabled={stepIndex === 0}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navButton, stepIndex === voiceInstructions.length - 1 && styles.disabledButton]}
              onPress={handleNextStep}
              disabled={stepIndex === voiceInstructions.length - 1}
            >
              <Text style={styles.navButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Playback Controls */}
          <View style={styles.playbackControls}>
            <TouchableOpacity 
              style={[styles.controlButton, isSlow && styles.activeButton]}
              onPress={toggleSpeed}
            >
              <Ionicons name={isSlow ? "speedometer" : "speedometer-outline"} size={24} color="white" />
              <Text style={styles.controlButtonText}>{isSlow ? "Slow" : "Normal"}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, styles.mainControlButton, isAutoPlay && styles.activeButton]}
              onPress={toggleAutoPlay}
            >
              <Ionicons 
                name={isAutoPlay ? "stop-circle" : "play-circle"} 
                size={36} 
                color={isAutoPlay ? "#FF5252" : "#4CAF50"} 
              />
              <Text style={[styles.controlButtonText, styles.mainControlButtonText]}>
                {isAutoPlay ? "Stop" : "Auto-Play"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={repeatInstruction}
            >
              <Ionicons name="repeat" size={24} color="white" />
              <Text style={styles.controlButtonText}>Repeat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#aaa',
    fontSize: 14,
  },
  modelContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    marginHorizontal: 15,
    marginVertical: 10,
    overflow: 'hidden',
  },
  stepInfoContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stepNumber: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 10,
  },
  keyPointsContainer: {
    marginTop: 10,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  keyPointText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  controlsContainer: {
    padding: 15,
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  navButtonText: {
    color: 'white',
    marginHorizontal: 5,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minWidth: 80,
  },
  mainControlButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  activeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  controlButtonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
  mainControlButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});