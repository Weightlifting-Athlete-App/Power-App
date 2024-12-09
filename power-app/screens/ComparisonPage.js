// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';

// export default function ComparisonPage() {
//   const [video, setVideo] = useState(null);

//   const pickVideo = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Videos,
//       allowsEditing: true,
//     });
//     if (!result.canceled) setVideo(result.uri);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Compare Your Technique</Text>
//       {video ? (
//         <Video source={{ uri: video }} style={styles.video} useNativeControls />
//       ) : (
//         <TouchableOpacity style={styles.button} onPress={pickVideo}>
//           <Text style={styles.buttonText}>Upload Video</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
//   title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
//   button: { padding: 15, backgroundColor: '#007bff', borderRadius: 8 },
//   buttonText: { color: '#fff', fontSize: 18, textAlign: 'center' },
//   video: { width: '100%', height: 300, marginVertical: 20 },
// });
