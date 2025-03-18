import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Button } from "react-native-paper";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  PermissionStatus,
} from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { FontAwesome5 } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import LottieView from "lottie-react-native";
import { Audio } from "expo-av";

const { width, height } = Dimensions.get("window");

type RootStackParamList = {
  PoseAnalysisScreen: { userData: any };
  ResultsScreen: { username: string; performance: number; category: string; fatigueLevel: string; fatigueRecommendation: string };
};

type PoseAnalysisScreenRouteProp = RouteProp<RootStackParamList, "PoseAnalysisScreen">;
type PoseAnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, "PoseAnalysisScreen">;



// Update VideoResponse interface to reflect native Python types (not strictly necessary but for clarity)
interface VideoResponse {
  data: {
    video_result: {
      overall_prediction: string;
      technique_feedback: string;
      label_percentages: { [key: string]: number };
    };
    performance_category: string;
    predicted_performance: number;  // Already a number, no NumPy type expected
    pose_data: {
      angles: { [key: string]: number };
    };
    fatigue_result: {
      fatigue_level: string;
      recommendation: string;
      fatigue_label: number;  // Changed to number from np.int64
      confidence_score?: number;
      timestamp?: string;
    };
    _id?: string;
    username?: string;
  };
}

interface Props {
  route: PoseAnalysisScreenRouteProp;
  navigation: PoseAnalysisScreenNavigationProp;
}

export default function PoseAnalysisScreen({ route, navigation }: Props) {
  const { userData: initialUserData } = route.params || {};
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [loading, setLoading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<VideoResponse["data"] | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [jointAngles, setJointAngles] = useState<{ [key: string]: number }>({});
  const [showCamera, setShowCamera] = useState(true);
  

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraResponse = await requestCameraPermission();
      const micResponse = await requestMicPermission();

      if (cameraResponse.status !== PermissionStatus.GRANTED) {
        Alert.alert("Permission Error", "Camera permission is required.");
      }
      if (micResponse.status !== PermissionStatus.GRANTED) {
        Alert.alert("Permission Warning", "Microphone permission is optional.");
      }
    };
    requestPermissions();
  }, [requestCameraPermission, requestMicPermission]);

  const canRecord = () => cameraPermission?.granted;

  const playBeepSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require("../../assets/sounds/beep.wav"));
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.error("Beep Sound Error:", error);
    }
  };

  const startCountdown = async () => {
    if (!canRecord()) {
      Alert.alert("Permission Required", "Camera permission is required.");
      return;
    }

    setCountdown(3);
    for (let i = 3; i >= 0; i--) {
      await playBeepSound();
      setCountdown(i);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setCountdown(null);
    startRecording();
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    setIsRecording(true);
    setRecordingTime(0);
    setShowCamera(true);

    const interval = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 20) {
          clearInterval(interval);
          stopRecording();
          return 20;
        }
        return prev + 1;
      });
    }, 1000);

    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 20 });
      if (video?.uri) {
        setShowCamera(false);
        await processVideo(video.uri);
      } else {
        Alert.alert("Error", "Failed to record video.");
      }
    } catch (error) {
      console.error("Recording Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to record video: ${errorMessage}`);
    } finally {
      clearInterval(interval);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

// Update processVideo function to handle fatigue data
const processVideo = async (uri: string) => {
  setProcessingMessage("Processing video, please wait...");
  setLoading(true);
  try {
    const videoBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!videoBase64) throw new Error("Failed to convert video to base64");

    const response = await axios.post<VideoResponse>(
      "http://192.168.198.43:5000/process_video",
      {
        video: videoBase64,
        user_data: initialUserData || {
          username: "athlete02",
          age: 32,
          age_start: 15,
          yrs_experience: 17,
          sex_encoded: 1,
          body_weight: 75,
          lifted_weight: 150,
        },
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data.data;
    setModalData(data); // This now includes fatigue_result
    await submitUserDataWithAngles(data);
    setModalVisible(true);
  } catch (error) {
    console.error("Video Processing Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    Alert.alert("Error", `Failed to process video: ${errorMessage}`);
  } finally {
    setProcessingMessage(null);
    setLoading(false);
  }
};

  const submitUserDataWithAngles = async (videoData: VideoResponse["data"]) => {
    try {
      const userDataWithAngles = {
        username: initialUserData?.username || "athlete02",
        age: initialUserData?.age || 32,
        age_start: initialUserData?.age_start || 15,
        yrs_experience: initialUserData?.yrs_experience || 17,
        sex_encoded: initialUserData?.sex_encoded || 1,
        body_weight: initialUserData?.body_weight || 75,
        lifted_weight: initialUserData?.lifted_weight || 150,
        pose_data: { angles: videoData.pose_data.angles },
      };

      await axios.post("http://192.168.198.43:5000/submit_user_data", userDataWithAngles, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Submit User Data Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to submit user data: ${errorMessage}`);
    }
  };

  const uploadVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "video/*" });
    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      await processVideo(uri);
    } else {
      Alert.alert("Error", "Video selection canceled.");
    }
  };

  // Mock joint angles for live display when camera is active
  useEffect(() => {
    if (!showCamera || isRecording) return; // Only show angles when camera is previewing
    const mockAngles = () => {
      setJointAngles({
        shoulder_angle: Math.random() * 180,
        knees_angle: Math.random() * 180,
        back_angle: Math.random() * 180,
        wrist_angle: Math.random() * 180,
        hips_angle: Math.random() * 180,
      });
    };
    const interval = setInterval(mockAngles, 1000);
    return () => clearInterval(interval);
  }, [showCamera, isRecording]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LottieView
        source={require("../../assets/animations/record.json")}
        autoPlay
        loop
        style={styles.animation}
      />

      <Text style={styles.title}>Pose Analysis</Text>
      <Text style={styles.subtitle}>
        Record or upload a video to analyze your lifting technique.
      </Text>

      {!isUploading ? (
        <>
          {showCamera && (
            <>
              <CameraView style={styles.camera} facing="back" ref={cameraRef} />
              {!isRecording && (
                <View style={styles.anglesContainer}>
                  {Object.entries(jointAngles).map(([key, value]) => (
                    <Text key={key} style={styles.angleText}>
                      {key.replace("_angle", "")}: {value.toFixed(1)}°
                    </Text>
                  ))}
                </View>
              )}
              {countdown !== null && (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                </View>
              )}
              {isRecording && (
                <View style={styles.recordingTimeContainer}>
                  <Text style={styles.recordingTimeText}>{recordingTime}s</Text>
                </View>
              )}
            </>
          )}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={startCountdown}
              style={styles.button}
              disabled={loading || isRecording}
              icon={() => <FontAwesome5 name="video" size={24} color="#fff" />}
              labelStyle={styles.buttonText}
            >
             <Text style={styles.buttonText}>Record</Text> 
            </Button>
            <Button
              mode="contained"
              onPress={() => setIsUploading(true)}
              style={styles.buttonSecondary}
              disabled={loading}
              labelStyle={styles.buttonTextSecondary}
            >
              Upload
            </Button>
          </View>
        </>
      ) : (
        <View style={styles.uploadContainer}>
          <Text style={styles.uploadTitle}>Upload Video</Text>
          <LottieView
            source={require("../../assets/animations/upload.json")}
            autoPlay
            loop
            style={styles.uploadAnimation}
          />
          <Button
            mode="contained"
            onPress={uploadVideo}
            style={styles.button}
            disabled={loading}
            icon={() => <FontAwesome5 name="cloud-upload-alt" size={24} color="#fff" />}
            labelStyle={styles.buttonText}
          >
            Select Video
          </Button>
          <Button
            mode="outlined"
            onPress={() => setIsUploading(false)}
            style={styles.buttonSecondary}
            labelStyle={styles.buttonTextSecondary}
          >
            Back
          </Button>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          {processingMessage && <Text style={styles.processingText}>{processingMessage}</Text>}
        </View>
      )}
// Update Modal to display fatigue information
<Modal animationType="slide" transparent={true} visible={modalVisible}>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {modalData ? (
        <>
          <Text style={styles.modalTitle}>🏋️ Video Processed!</Text>
          <Text style={styles.modalText}>🔹 Lift Type: {modalData.video_result.overall_prediction}</Text>
          <Text style={styles.modalText}>🔹 Technique: {modalData.video_result.technique_feedback}</Text>
          <Text style={styles.modalText}>🔹 Performance: {modalData.performance_category}</Text>
          <Text style={styles.modalText}>🔹 Score: {modalData.predicted_performance.toFixed(2)}</Text>
          <Text style={styles.modalText}>🔹 Fatigue Level: {modalData.fatigue_result.fatigue_level}</Text>
          <Text style={styles.modalText}>🔹 Recommendation: {modalData.fatigue_result.recommendation}</Text>
          {modalData.fatigue_result.confidence_score && (
            <Text style={styles.modalText}>
              🔹 Confidence: {modalData.fatigue_result.confidence_score.toFixed(2)}%
            </Text>
          )}
          <Pressable
            style={styles.okButton}
            onPress={() => {
              setModalVisible(false);
              navigation.navigate("ResultsScreen", {
                username: modalData.username || "Ashan",
                performance: modalData.predicted_performance,
                category: modalData.performance_category,
                // Optionally pass fatigue data to ResultsScreen if needed
                fatigueLevel: modalData.fatigue_result.fatigue_level,
                fatigueRecommendation: modalData.fatigue_result.recommendation,
              });
            }}
          >
            <Text style={styles.okButtonText}>OK</Text>
          </Pressable>
        </>
      ) : (
        <ActivityIndicator size="large" color="#007BFF" />
      )}
    </View>
  </View>
</Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    padding: 20,
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
  },
  camera: {
    width: "80%",
    height: height * 0.5,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  anglesContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  angleText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  buttonContainer: {
    width: "80%",
    flexDirection: "column",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#007BFF",
    borderWidth: 2,
  },
  buttonTextSecondary: {
    color: "#007BFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    position: "absolute",
    top: "40%",
    alignItems: "center",
    justifyContent: "center",
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007BFF",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#666",
  },
  okButton: {
    marginTop: 15,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  okButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  countdownContainer: {
    position: "absolute",
    top: "40%",
    alignItems: "center",
    justifyContent: "center",
  },
  countdownText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  recordingTimeContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  recordingTimeText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  uploadContainer: {
    width: "80%",
    alignItems: "center",
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  uploadAnimation: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});