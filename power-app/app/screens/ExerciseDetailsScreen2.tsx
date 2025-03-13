import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import * as Asset from "expo-asset";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const AnimatedModel = ({ modelPath, isPlaying }: { modelPath: string; isPlaying: boolean }) => {
  const gltf = useGLTF(modelPath);
  const { scene, animations } = gltf;
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (animations.length > 0) {
      const firstAnimation = animations[0].name;
      if (actions[firstAnimation]) {
        if (isPlaying) {
          actions[firstAnimation].reset().play();
        } else {
          actions[firstAnimation].stop();
        }
      }
    }
  }, [actions, animations, isPlaying]);

  return <primitive object={scene} scale={0.5} />;
};

export default function App() {
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    async function loadModel() {
      const asset = Asset.Asset.fromModule(require("../../assets/models/video3.glb"));
      await asset.downloadAsync();
      setModelPath(asset.localUri);
    }
    loadModel();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 2, 2]} intensity={1} />
          {modelPath && <AnimatedModel modelPath={modelPath} isPlaying={isPlaying} />}
          <OrbitControls />
        </Canvas>

        {/* Play/Pause Button */}
        <View style={styles.buttonContainer}>
          <Button title={isPlaying ? "Pause" : "Play"} onPress={() => setIsPlaying(!isPlaying)} />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 10,
    zIndex: 10,
  },
});
