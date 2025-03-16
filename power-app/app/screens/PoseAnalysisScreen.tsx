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
  Animated,
  Easing,
} from "react-native";
import { Button, Card } from "react-native-paper";
import { CameraView, useCameraPermissions, useMicrophonePermissions, PermissionStatus } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Define the navigation stack param list
type RootStackParamList = {
  PoseAnalysisScreen: { userData: any };
  ResultsScreen: {
    username: string;
    performance: number;
    category: string;
  };
};

type PoseAnalysisScreenRouteProp = RouteProp<RootStackParamList, "PoseAnalysisScreen">;
type PoseAnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, "PoseAnalysisScreen">;

interface VideoResponse {
  data: {
    video_result: {
      overall_prediction: string;
      technique_feedback: string;
      label_percentages: { [key: string]: number };
    };
    performance_category: string;
    predicted_performance: number;
    pose_data: {
      angles: { [key: string]: number };
    };
    _id?: string;
    username?: string;
  };
}

interface Props {
  route: PoseAnalysisScreenRouteProp;
  navigation: PoseAnalysisScreenNavigationProp;
}

const { width, height } = Dimensions.get("window");

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
  const [videoResult, setVideoResult] = useState<any>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const countdownAnimation = useRef(new Animated.Value(0)).current;
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraResponse = await requestCameraPermission();
      const micResponse = await requestMicPermission();

      if (cameraResponse.status !== PermissionStatus.GRANTED) {
        Alert.alert("Permission Error", "Camera permission is required.");
      }
      if (micResponse.status !== PermissionStatus.GRANTED) {
        Alert.alert(
          "Permission Warning",
          "Microphone permission is optional; recording will be muted if denied."
        );
      }
    };
    requestPermissions();
  }, [requestCameraPermission, requestMicPermission]);

  const canRecord = () => {
    if (!cameraPermission?.granted) {
      Alert.alert("Permission Required", "Camera permission is required.");
      return false;
    }
    return true;
  };

  const startCountdown = () => {
    setCountdown(3);
    Animated.timing(countdownAnimation, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      setCountdown(null);
      startRecording();
    });
  };

const startRecording = async () => {
  if (!cameraRef.current) {
    Alert.alert("Error", "Camera not available.");
    return;
  }
  if (!canRecord()) {
    return;
  }

  setLoading(true);
  setIsRecording(true);
  setRecordingTime(0);

  const interval = setInterval(() => {
    setRecordingTime((prev) => prev + 1);
  }, 1000);

  try {
    // Start recording and get the video URI
    const video = await cameraRef.current.recordAsync({
      maxDuration: 45,
    });

    if (video && video.uri) {
      console.log("🎥 Recorded video URI:", video.uri);

      // Process the video
      await processVideo(video.uri);
    } else {
      Alert.alert("Error", "Failed to record video.");
    }
  } catch (error) {
    console.error("Recording Error:", error);
    const errorMessage = (error as Error).message || "Unknown error";
    Alert.alert("Error", `Failed to record video: ${errorMessage}`);
  } finally {
    clearInterval(interval);
    setLoading(false);
    setIsRecording(false);
  }
};


// Callback when recording ends
const handleRecordingEnd = ({ uri }: { uri: string }) => {
  console.log("🎥 Recorded video URI:", uri);
  setRecordedVideoUri(uri); // Store the video URI
};
const stopRecording = async () => {
  if (cameraRef.current && isRecording) {
    try {
      setIsRecording(false); // Stop recording
      setLoading(true); // Show loading indicator
      setCountdown(null); // Reset the countdown

      // Stop the recording
      await cameraRef.current.stopRecording();
    } catch (error) {
      console.error("Recording Error:", error);
      const errorMessage = (error as Error).message || "Unknown error";
      Alert.alert("Error", `Failed to stop recording: ${errorMessage}`);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  }
};

const processVideo = async (uri: string) => {
  try {
    setProcessingMessage("Processing video, please wait...");

    // Convert the video file to base64
    const videoBase64 = await fetch(uri)
      .then((res) => res.blob())
      .then((blob) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result.split(",")[1]); // Extract base64 data
            } else {
              resolve(null);
            }
          };
          reader.readAsDataURL(blob);
        })
      );

    if (!videoBase64) {
      throw new Error("Failed to convert video to base64.");
    }

    console.log("📤 Sending Video for Processing...");

    // Send the video to the backend for processing
    const response = await axios.post<VideoResponse>(
      "http://172.28.8.78:5000/process_video",
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
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || !response.data.data || !response.data.data.video_result) {
      throw new Error("Invalid response from server: Missing video_result");
    }

    // Set the video result and show the modal
    setVideoResult(response.data.data);
    setModalData(response.data.data);
    setProcessingMessage(null);

    // Show the results in an alert
    Alert.alert(
      "Video Processed",
      `Prediction: ${response.data.data.video_result.overall_prediction}\nTechnique: ${response.data.data.video_result.technique_feedback}\nPerformance: ${response.data.data.performance_category}`
    );

    // Submit user data with angles
    await submitUserDataWithAngles(response.data.data);
    setProcessingMessage(null);

    // Navigate to the results screen
    navigation.navigate("ResultsScreen", {
      username: response.data.data.username || "athlete02",
      performance: response.data.data.predicted_performance,
      category: response.data.data.performance_category,
    });
  } catch (error) {
    console.error("Video Processing Error:", error);
    const errorMessage = (error as any).message || "Unknown error";
    Alert.alert("Error", `Failed to process video: ${errorMessage}`);
    setProcessingMessage(null);
  }
};

  const submitUserDataWithAngles = async (videoData: VideoResponse["data"]) => {
    setLoading(true);
    setProcessingMessage("Submitting performance data...");
    try {
      const userDataWithAngles = {
        username: initialUserData?.username || "Ashan",
        age: initialUserData?.age || 32,
        age_start: initialUserData?.age_start || 15,
        yrs_experience: initialUserData?.yrs_experience || 17,
        sex_encoded: initialUserData?.sex_encoded || 1,
        body_weight: initialUserData?.body_weight || 75,
        lifted_weight: initialUserData?.lifted_weight || 150,
        pose_data: {
          angles: videoData.pose_data.angles,
        },
      };

      const response = await axios.post<VideoResponse>(
        "http://172.28.8.78:5000/submit_user_data",
        userDataWithAngles,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert(
        "Performance Submitted",
        `Performance: ${response.data.data.performance_category}`
      );
    } catch (error) {
      console.error("Submit User Data Error:", error);
      const errorMessage = (error as any).message || "Unknown error";
      Alert.alert("Error", `Failed to submit user data: ${errorMessage}`);
    } finally {
      setLoading(false);
      setProcessingMessage(null);
    }
  };

  const uploadVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "video/*" });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setLoading(true);
      await processVideo(uri);
      setLoading(false);
    } else {
      Alert.alert("Error", "Video selection canceled.");
    }
  };

  const testSubmitUserData = async () => {
    await submitUserDataWithAngles({
      video_result: { overall_prediction: "N/A", technique_feedback: "N/A", label_percentages: {} },
      performance_category: "N/A",
      predicted_performance: 0,
      pose_data: {
        angles: {
          shoulder_angle: 160,
          knees_angle: 110,
          back_angle: 20,
          wrist_angle: 170,
          hips_angle: 95,
        },
      },
    });
  };

 return (
  <View style={styles.container}>
    <CameraView
  style={styles.camera}
  facing="back"
  ref={cameraRef}
/>
    {countdown !== null && (
      <View style={styles.countdownContainer}>
        <Animated.Text style={[styles.countdownText, { opacity: countdownAnimation }]}>
          {countdown}
        </Animated.Text>
      </View>
    )}
    {isRecording && (
      <View style={styles.recordingTimeContainer}>
        <Text style={styles.recordingTimeText}>{recordingTime}s</Text>
      </View>
    )}
    <View style={styles.buttonContainer}>
      <Button
        mode="contained"
        onPress={isRecording ? stopRecording : startCountdown}
        style={styles.captureButton}
        disabled={loading}
      >
        <Ionicons
          name={isRecording ? "stop-outline" : "videocam-outline"}
          size={18}
          color="white"
        />
        {isRecording ? " Stop Recording" : " Start Recording"}
      </Button>
      <Button
        mode="contained"
        onPress={uploadVideo}
        style={styles.uploadButton}
        disabled={loading}
      >
        <Ionicons name="cloud-upload-outline" size={18} color="white" />{" "}
        Upload Video
      </Button>
      <Button
        mode="contained"
        onPress={testSubmitUserData}
        style={styles.testButton}
        disabled={loading}
      >
        <Ionicons name="pulse-outline" size={18} color="white" /> Test
        Performance
      </Button>
    </View>
    {loading && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        {processingMessage && (
          <Text style={styles.processingText}>{processingMessage}</Text>
        )}
      </View>
    )}
    {videoResult && (
      <Card style={styles.resultCard}>
        <Card.Content>
          <Text style={styles.resultTitle}>Video Analysis Results</Text>
          <Text style={styles.resultText}>
            Prediction: {videoResult.video_result.overall_prediction}
          </Text>
          <Text style={styles.resultText}>
            Technique: {videoResult.video_result.technique_feedback}
          </Text>
          <Text style={styles.resultText}>
            Performance: {videoResult.performance_category}
          </Text>
          <Text style={styles.resultText}>
            Score: {videoResult.predicted_performance.toFixed(2)}
          </Text>
          <Text style={styles.angleTitle}>Average Angles</Text>
          {Object.entries(videoResult.pose_data.angles).map(
            ([key, value]) => (
              <Text key={key} style={styles.angleText}>
                {key.replace("_angle", "").replace("_", " ")}:{" "}
                {(value as number).toFixed(2)}°
              </Text>
            )
          )}
          <Text style={styles.angleTitle}>Class Percentages</Text>
          {Object.entries(videoResult.video_result.label_percentages).map(
            ([label, percentage]) => (
              <Text key={label} style={styles.angleText}>
                {label}: {(percentage as number).toFixed(2)}%
              </Text>
            )
          )}
        </Card.Content>
      </Card>
    )}

    {/* Live Result Dialog */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {modalData ? (
            <>
              <Text style={styles.modalTitle}>🏋️ Video Processed!</Text>
              <Text style={styles.modalText}>🔹 Lift Type: {modalData?.video_result?.overall_prediction}</Text>
              <Text style={styles.modalText}>🔹 Technique: {modalData?.video_result?.technique_feedback}</Text>
              <Text style={styles.modalText}>🔹 Performance: {modalData?.performance_category}</Text>
              <Text style={styles.modalText}>🔹 Score: {modalData?.predicted_performance?.toFixed(2)}</Text>
              <Pressable style={styles.okButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.okButtonText}>OK</Text>
              </Pressable>
            </>
          ) : (
            <ActivityIndicator size="large" color="#007BFF" />
          )}
        </View>
      </View>
    </Modal>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: "100%",
    height: height * 0.5,
    borderRadius: 10,
    overflow: "hidden",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  captureButton: {
    backgroundColor: "#007BFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: "#28A745",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: "#FFC107",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  loadingContainer: {
    position: "absolute",
    top: height * 0.25,
    alignItems: "center",
    justifyContent: "center",
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007BFF",
    textAlign: "center",
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: "#FFF",
    width: "90%",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#444",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginVertical: 2,
  },
  angleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#444",
    marginTop: 10,
    marginBottom: 5,
  },
  angleText: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    marginVertical: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparent overlay
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    color: "#555",
  },
  okButton: {
    marginTop: 15,
    backgroundColor: "#28A745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  okButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  countdownContainer: {
    position: "absolute",
    top: height * 0.25,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFF",
  },
  recordingTimeContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  recordingTimeText: {
    fontSize: 16,
    color: "#FFF",
  },
});