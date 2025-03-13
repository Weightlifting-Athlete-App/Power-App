import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import * as Asset from "expo-asset";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// This component assumes a valid modelPath is passed
const AnimatedModel = ({ modelPath }: { modelPath: string }) => {
  const gltf = useGLTF(modelPath);
  const { scene, animations } = gltf;
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (animations && animations.length > 0) {
      const firstAnimationName = animations[0].name;
      if (actions[firstAnimationName]) {
        actions[firstAnimationName].reset().fadeIn(0.5).play();
      }
    }
  }, [actions, animations]);

  return <primitive object={scene} scale={0.5} />;
};

export default function App() {
  const [modelPath, setModelPath] = useState<string | null>(null);

  useEffect(() => {
    async function loadModel() {
      const asset = Asset.Asset.fromModule(require("../../assets/models/snatch.glb"));
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
          {/* Render the animated model only when modelPath is available */}
          {modelPath && <AnimatedModel modelPath={modelPath} />}
          <OrbitControls />
        </Canvas>
      </View>
    </GestureHandlerRootView>
  );
}
