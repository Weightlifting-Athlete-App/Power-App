import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { VictoryTooltip } from "victory";
import { VictoryTheme } from "victory";
import { VictoryChart } from "victory";
import { VictoryBar, VictoryLine, VictoryPie, VictoryScatter } from "victory";
import axios from "axios";
import { useRoute, useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../index";
import LottieView from "lottie-react-native";

export default function ResultsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { username } = route.params as { username: string }; // Get username from navigation params
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any>(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await axios.get(
        `http://172.28.8.78:5000/get_performance/${username}`
      );

      if (response.data) {
        setPerformanceData(response.data);
      } else {
        Alert.alert("Error", "No performance data found.");
      }
    } catch (error) {
      console.error(" Fetch Error:", error);
      Alert.alert("Error", "Failed to fetch performance data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Fetching Performance Data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/*  Animated Success Checkmark */}
      <LottieView
        source={require("../../assets/animations/Success.json")}
        autoPlay
        loop={false}
        style={styles.animation}
      />

      <Text style={styles.title}>Performance Analysis</Text>

      {/*  Performance Breakdown */}
      <View style={styles.resultBox}>
        <Text style={styles.resultText}>
          <Text style={styles.label}>Performance Score:</Text> {performanceData?.predicted_performance.toFixed(2)}
        </Text>
        <Text style={styles.resultText}>
          <Text style={styles.label}>Performance Level:</Text> {performanceData?.performance_category}
        </Text>
        <Text style={styles.resultText}>
          <Text style={styles.label}>Technique:</Text> {performanceData?.video_result.technique_feedback}
        </Text>
        <Text style={styles.resultText}>
          <Text style={styles.label}>Lift Type:</Text> {performanceData?.video_result.overall_prediction}
        </Text>
      </View>

      {/*  Performance Graphs */}
      <VictoryChart theme={VictoryTheme.material} domainPadding={30}>
        <VictoryBar
          data={[
            { angle: "Shoulder", value: performanceData?.pose_data?.angles?.shoulder_angle || 0 },
            { angle: "Knees", value: performanceData?.pose_data?.angles?.knees_angle || 0 },
            { angle: "Back", value: performanceData?.pose_data?.angles?.back_angle || 0 },
            { angle: "Wrist", value: performanceData?.pose_data?.angles?.wrist_angle || 0 },
            { angle: "Hips", value: performanceData?.pose_data?.angles?.hips_angle || 0 },
          ]}
          x="angle"
          y="value"
          labels={({ datum }) => `${datum.value.toFixed(2)}°`}
          style={{ labels: { fill: "white", fontSize: 12 } }}
          barRatio={0.8}
          animate={{ duration: 500 }}
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>

      <VictoryChart theme={VictoryTheme.material} domainPadding={30}>
        <VictoryLine
          data={[
            { angle: "Shoulder", value: performanceData?.pose_data?.angles?.shoulder_angle || 0 },
            { angle: "Knees", value: performanceData?.pose_data?.angles?.knees_angle || 0 },
            { angle: "Back", value: performanceData?.pose_data?.angles?.back_angle || 0 },
            { angle: "Wrist", value: performanceData?.pose_data?.angles?.wrist_angle || 0 },
            { angle: "Hips", value: performanceData?.pose_data?.angles?.hips_angle || 0 },
          ]}
          x="angle"
          y="value"
          labels={({ datum }) => `${datum.value.toFixed(2)}°`}
          style={{ data: { stroke: "#c43a31" }, labels: { fill: "white", fontSize: 12 } }}
          animate={{ duration: 500 }}
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>

      <VictoryPie
        data={[
          { angle: "Shoulder", value: performanceData?.pose_data?.angles?.shoulder_angle || 0 },
          { angle: "Knees", value: performanceData?.pose_data?.angles?.knees_angle || 0 },
          { angle: "Back", value: performanceData?.pose_data?.angles?.back_angle || 0 },
          { angle: "Wrist", value: performanceData?.pose_data?.angles?.wrist_angle || 0 },
          { angle: "Hips", value: performanceData?.pose_data?.angles?.hips_angle || 0 },
        ]}
        x="angle"
        y="value"
        labels={({ datum }) => `${datum.angle}: ${datum.value.toFixed(2)}°`}
        style={{ labels: { fill: "white", fontSize: 12 } }}
        animate={{ duration: 500 }}
        labelComponent={<VictoryTooltip />}
      />

      <VictoryChart theme={VictoryTheme.material} domainPadding={30}>
        <VictoryScatter
          data={[
            { angle: "Shoulder", value: performanceData?.pose_data?.angles?.shoulder_angle || 0 },
            { angle: "Knees", value: performanceData?.pose_data?.angles?.knees_angle || 0 },
            { angle: "Back", value: performanceData?.pose_data?.angles?.back_angle || 0 },
            { angle: "Wrist", value: performanceData?.pose_data?.angles?.wrist_angle || 0 },
            { angle: "Hips", value: performanceData?.pose_data?.angles?.hips_angle || 0 },
          ]}
          x="angle"
          y="value"
          labels={({ datum }) => `${datum.value.toFixed(2)}°`}
          style={{ data: { fill: "#c43a31" }, labels: { fill: "white", fontSize: 12 } }}
          animate={{ duration: 500 }}
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>

      {/*  Back to Home Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("homePage")}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  animation: { width: 150, height: 150, alignSelf: "center" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  resultBox: { backgroundColor: "#FFF", padding: 15, borderRadius: 10, elevation: 3, marginBottom: 20 },
  resultText: { fontSize: 16, marginBottom: 5 },
  label: { fontWeight: "bold" },
  button: { backgroundColor: "#28A745", padding: 15, borderRadius: 10, marginBottom: 20 },
  buttonText: { color: "#FFF", fontSize: 16, textAlign: "center" },
});