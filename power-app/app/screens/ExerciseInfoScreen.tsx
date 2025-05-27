import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Dimensions,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ExerciseInfoScreen() {
  const route = useRoute();
  const { exercise } = route.params;
  const videoRef = useRef<Video>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, requestAudioPermission] = useMicrophonePermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const cameraRef = useRef<any>(null);

  const [webVideoStream, setWebVideoStream] = useState<MediaStream | null>(null);
  const webVideoRef = useRef<HTMLVideoElement>(null);

  const [recording, setRecording] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [processedVideoUri, setProcessedVideoUri] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoStatus, setVideoStatus] = useState<AVPlaybackStatus | null>(null);

  const endpoint = 'http://192.168.253.95:5000/processVideo';

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

  useEffect(() => {
    if (Platform.OS === 'web') {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        .then(stream => setWebVideoStream(stream))
        .catch(err => console.error("Error getting web video stream:", err));
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && webVideoStream && webVideoRef.current) {
      webVideoRef.current.srcObject = webVideoStream;
    }
  }, [webVideoStream]);

  const togglePlayback = async () => {
    if (videoRef.current) {
      if (videoStatus?.isLoaded) {
        if (videoStatus.isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          if (videoStatus.didJustFinish) {
            await videoRef.current.setPositionAsync(0);
          }
          await videoRef.current.playAsync();
        }
      }
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setVideoStatus(status);
  };

  const autoDownloadOnWeb = (url: string, filename = "processedVideo.mp4") => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const storeVideoFileMobile = async (dataUri: string): Promise<string> => {
    const match = dataUri.match(/^data:video\/\w+;base64,(.*)/);
    if (!match) {
      throw new Error("Invalid data URI for video");
    }
    const rawBase64 = match[1];
    const fileName = FileSystem.cacheDirectory + `processed_${Date.now()}.mp4`;
    await FileSystem.writeAsStringAsync(fileName, rawBase64, { encoding: FileSystem.EncodingType.Base64 });
    return fileName;
  };

  const storeVideoFileWeb = async (dataUri: string): Promise<string> => {
    const res = await fetch(dataUri);
    const blob = await res.blob();
    const objectURL = URL.createObjectURL(blob);
    autoDownloadOnWeb(objectURL, "processedVideo.mp4");
    return objectURL;
  };

  const handleProcessedVideo = async (dataUri: string): Promise<string> => {
    if (Platform.OS === 'web') {
      return await storeVideoFileWeb(dataUri);
    } else {
      return await storeVideoFileMobile(dataUri);
    }
  };

  const recordVideoWeb = async (): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      if (!webVideoStream) return reject("No web video stream available for recording");
      const options = { mimeType: 'video/webm;codecs=vp9' };
      const mediaRecorder = new MediaRecorder(webVideoStream, options);
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onerror = reject;
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
        webVideoStream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 10000);
    });
  };

  const startRecording = async () => {
    if (Platform.OS === 'web') {
      if (!recording) {
        setRecording(true);
        try {
          const base64Video = await recordVideoWeb();
          await sendVideoToBackend(base64Video);
        } catch (error) {
          console.error("Error during web recording:", error);
        }
        setRecording(false);
      }
    } else {
      if (cameraRef.current && !recording && cameraReady) {
        console.log("Starting recording on mobile...");
        setRecording(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 15000));
          const videoData = await cameraRef.current.recordAsync({
            maxDuration: 15,
            base64: false,
            mute: true,
          });
          console.log("Recording finished. Video URI:", videoData.uri);
          setRecording(false);
          if (!videoData || !videoData.uri) {
            console.error("No video data captured");
            return;
          }
          const base64Video = await FileSystem.readAsStringAsync(videoData.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await sendVideoToBackend("data:video/mp4;base64," + base64Video);
        } catch (error) {
          console.error("Error during mobile recording:", error);
          setRecording(false);
        }
      } else {
        console.log("Camera not ready or already recording");
      }
    }
  };

  const stopRecording = () => {
    if (Platform.OS !== 'web' && cameraRef.current && recording) {
      console.log("Stopping recording on mobile...");
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
      if (data.annotated_video) {
        const finalUri = await handleProcessedVideo(data.annotated_video);
        setProcessedVideoUri(finalUri);
      }
    } catch (error) {
      console.error("Error sending video:", error);
    }
    setIsProcessing(false);
  };

  const renderVideoControls = () => (
    <View style={styles.controlsContainer}>
      <TouchableOpacity onPress={togglePlayback} style={styles.controlButton}>
        <MaterialIcons
          name={
            videoStatus?.isLoaded
              ? videoStatus.isPlaying
                ? "pause"
                : "play-arrow"
              : "play-arrow"
          }
          size={36}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );

  const renderCameraView = () => {
    if (processedVideoUri) {
      return (
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: processedVideoUri }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
            useNativeControls={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
          {renderVideoControls()}
        </View>
      );
    }

    return Platform.OS === 'web' ? (
      webVideoStream ? (
        <video ref={webVideoRef} autoPlay playsInline style={styles.webCamera} />
      ) : (
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.placeholderText}>Loading web camera...</Text>
        </View>
      )
    ) : (
      <CameraView
        mode="video"
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        onCameraReady={onCameraReady}
      />
    );
  };

  const renderActionButton = () => {
    if (processedVideoUri) {
      return (
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => {
            setProcessedVideoUri(null);
            setCorrectCount(0);
            setIncorrectCount(0);
            startRecording();
          }}
        >
          <FontAwesome name="repeat" size={20} color="white" />
          <Text style={styles.buttonText}>Record Again</Text>
        </TouchableOpacity>
      );
    }

    return Platform.OS === 'web' ? (
      !recording ? (
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={startRecording}
        >
          <FontAwesome name="video-camera" size={20} color="white" />
          <Text style={styles.buttonText}>Record Video</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      )
    ) : (
      !recording ? (
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={startRecording}
        >
          <FontAwesome name="video-camera" size={20} color="white" />
          <Text style={styles.buttonText}>Record Video</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={stopRecording}
        >
          <FontAwesome name="stop" size={20} color="white" />
          <Text style={styles.buttonText}>Stop Recording</Text>
        </TouchableOpacity>
      )
    );
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f5f7fa', '#c3cfe2']}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{exercise.name}</Text>
            <Text style={styles.subtitle}>{exercise.description}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.incorrectStat]}>{incorrectCount}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
          </View>

          <View style={styles.mediaContainer}>
            {renderCameraView()}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.processingText}>Analyzing your performance...</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonWrapper}>
            {renderActionButton()}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '45%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  incorrectStat: {
    color: '#e74c3c',
  },
  statLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  mediaContainer: {
    height: SCREEN_HEIGHT * 0.5, // Increased height
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 15,
    backgroundColor: '#2c3e50',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  webCamera: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
  },
  placeholderText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 15,
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginVertical: 8,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#4a90e2',
  },
  secondaryButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    padding: 15,
    borderRadius: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e74c3c',
    marginRight: 10,
  },
  recordingText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
    color: '#2c3e50',
  },
});