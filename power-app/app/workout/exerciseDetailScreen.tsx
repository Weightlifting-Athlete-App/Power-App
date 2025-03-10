import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Button 
} from 'react-native';
import { Video } from 'expo-av';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { useRoute } from '@react-navigation/native';

export default function ExerciseDetailScreen() {
  const route = useRoute();
  const { exercise } = route.params; // The exercise object from ExerciseListScreen

  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, requestAudioPermission] = useMicrophonePermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const cameraRef = useRef<any>(null);

  const [recording, setRecording] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use a single endpoint for all exercises.
  const endpoint = 'http://192.168.1.108:5000/processVideo';

  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      console.log('Camera permission status:', status);
      await requestAudioPermission();
    })();
  }, []);

  const onCameraReady = () => {
    setCameraReady(true);
    console.log("Camera is ready");
  };

  const startRecording = async () => {
    if (cameraRef.current && !recording && cameraReady) {
      console.log("Starting recording...");
      setRecording(true);
      try {
        // Wait 2 seconds to allow the camera to stabilize.
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Record a video for exactly 5 seconds.
        const videoData = await cameraRef.current.recordAsync({
          base64: false,
          mute: true, // disable audio
        });
        console.log("Recording finished. Video URI:", videoData.uri);
        setRecording(false);
        if (!videoData || !videoData.uri) {
          console.error("No video data captured");
          return;
        }
        // Convert the recorded video file to a base64 string.
        const base64Video = await FileSystem.readAsStringAsync(videoData.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await sendVideoToBackend(base64Video);
      } catch (error) {
        console.error("Error during recording:", error);
        setRecording(false);
      }
    } else {
      console.log("Camera not ready or already recording");
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && recording) {
      console.log("Stopping recording...");
      cameraRef.current.stopRecording();
    }
  };

  const sendVideoToBackend = async (base64Video: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video: base64Video,
          exercise: exercise.id,
        }),
      });
      const data = await response.json();
      console.log("Backend response:", data);
      setCorrectCount(data.correct_reps);
      setIncorrectCount(data.incorrect_reps);
      setProcessedVideo(data.annotated_video);
    } catch (error) {
      console.error("Error sending video:", error);
    }
    setIsProcessing(false);
  };

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exercise.name}</Text>
      <Text style={styles.subtitle}>{exercise.description}</Text>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>Correct: {correctCount}</Text>
        <Text style={styles.countText}>Incorrect: {incorrectCount}</Text>
      </View>

      <View style={styles.cameraContainer}>
        {processedVideo ? (
          // Play the processed video using the Video component from expo-av.
          <Video 
            source={{ uri: processedVideo }}
            style={styles.camera}
            shouldPlay
            useNativeControls
          />
        ) : (
          // If no processed video is available, show the live camera feed.
          <CameraView 
            mode='video'
            style={styles.camera} 
            facing={facing} 
            ref={cameraRef}
            onCameraReady={onCameraReady}
          />
        )}
      </View>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {processedVideo ? (
          <Button title="Record Again" onPress={() => { setProcessedVideo(null); startRecording(); }} />
        ) : (
          !recording ? (
            <Button title="Record 5s Video" onPress={startRecording} />
          ) : (
            <Button title="Stop Recording" onPress={stopRecording} />
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 16 },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  countText: { fontSize: 18 },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: { flex: 1 },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 10,
    color: 'white',
    fontSize: 18,
  },
  buttonContainer: {
    marginVertical: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
});
