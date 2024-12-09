// // screens/ExerciseDetailsScreen.js
// import React, { useRef, useEffect } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { GLView } from 'expo-gl';
// import { Renderer } from 'expo-three';
// import * as THREE from 'three';

// export default function ExerciseDetailsScreen({ route }) {
//   const { exercise } = route.params;
//   const glRef = useRef(null);

//   useEffect(() => {
//     // Create the 3D scene for each exercise
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
//     const renderer = new Renderer({ gl: glRef.current });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     scene.background = new THREE.Color(0xeeeeee);

//     // Load 3D model for the selected exercise
//     const loader = new THREE.GLTFLoader();
//     loader.load(`https://your-model-url/${exercise}.glb`, (gltf) => {
//       scene.add(gltf.scene);
//       camera.position.z = 5;
//       animate();
//     });

//     const animate = () => {
//       requestAnimationFrame(animate);
//       renderer.render(scene, camera);
//     };

//     return () => {
//       // Cleanup
//       scene.dispose();
//       renderer.dispose();
//     };
//   }, [exercise]);

//   return (
//     <View style={styles.container}>
//       <GLView style={styles.glView} ref={glRef} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//   },
//   glView: {
//     flex: 1,
//   },
// });
