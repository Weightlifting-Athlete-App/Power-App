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
import axios from "axios";
import { useRoute, useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../index";
import { FontAwesome5 } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import Svg, { Rect, Circle, G, Text as SvgText, Path } from "react-native-svg";

export default function ResultsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { username } = route.params as { username: string };
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any>(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const url = `http://192.168.198.43:5000/get_user_data/${username}`;
      console.log("Fetching data from:", url);

      const response = await axios.get(url);
      console.log("Response:", response.data);

      if (response.data) {
        setPerformanceData(response.data.data); // Set to response.data.data
      } else {
        Alert.alert("Error", "No performance data found for this user.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Failed to fetch performance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../../assets/animations/analysis.json")}
          autoPlay
          loop
          style={styles.animation}
        />
        <Text style={styles.subtitle}>Fetching Performance Data...</Text>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!performanceData) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../../assets/animations/analysis.json")}
          autoPlay
          loop
          style={styles.animation}
        />
        <Text style={styles.subtitle}>No performance data available.</Text>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate("homePage")}
        >
          <Text style={styles.buttonTextSecondary}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extract angles data from pose_data
  const angles = performanceData?.pose_data?.angles || {
    shoulder_angle: 0,
    knees_angle: 0,
    back_angle: 0,
    wrist_angle: 0,
    hips_angle: 0,
  };

  // Prepare chart data with fallback values
  const chartData = [
    { angle: "Shoulder", value: angles.shoulder_angle || 0 },
    { angle: "Knees", value: angles.knees_angle || 0 },
    { angle: "Back", value: angles.back_angle || 0 },
    { angle: "Wrist", value: angles.wrist_angle || 0 },
    { angle: "Hips", value: angles.hips_angle || 0 },
  ];

  // Custom Progress Bar Component
  const ProgressBar = ({ value, label, color }) => (
    <View style={styles.progressBarContainer}>
      <Text style={styles.progressBarLabel}>{label}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.progressBarValue}>{value.toFixed(2)}%</Text>
    </View>
  );

  // Custom Bar Chart Component
  const BarChart = ({ data }) => {
    const maxValue = Math.max(...data.map((item) => item.value));
    const colors = ["#4c669f", "#3b5998", "#192f6a", "#28A745", "#FFC107"];

    return (
      <Svg width="100%" height={200}>
        {data.map((item, index) => (
          <G key={index}>
            <Rect
              x={index * 60 + 20}
              y={200 - (item.value / maxValue) * 180}
              width={40}
              height={(item.value / maxValue) * 180}
              fill={colors[index % colors.length]}
            />
            <SvgText
              x={index * 60 + 35}
              y={220}
              fill="#333"
              fontSize={12}
              textAnchor="middle"
            >
              {item.angle}
            </SvgText>
            <SvgText
              x={index * 60 + 35}
              y={200 - (item.value / maxValue) * 180 - 10}
              fill={colors[index % colors.length]}
              fontSize={12}
              textAnchor="middle"
            >
              {item.value.toFixed(2)}°
            </SvgText>
          </G>
        ))}
      </Svg>
    );
  };

  // Custom Pie Chart Component
  const PieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;
    const colors = ["#4c669f", "#3b5998", "#192f6a", "#28A745", "#FFC107"];

    return (
      <Svg width="100%" height={200}>
        {data.map((item, index) => {
          const angle = (item.value / total) * 360;
          const endAngle = startAngle + angle;
          const largeArcFlag = angle > 180 ? 1 : 0;

          const x1 = 100 + 80 * Math.cos((Math.PI * startAngle) / 180);
          const y1 = 100 + 80 * Math.sin((Math.PI * startAngle) / 180);
          const x2 = 100 + 80 * Math.cos((Math.PI * endAngle) / 180);
          const y2 = 100 + 80 * Math.sin((Math.PI * endAngle) / 180);

          const path = `M100,100 L${x1},${y1} A80,80 0 ${largeArcFlag},1 ${x2},${y2} Z`;

          // Calculate label position (midpoint of the arc)
          const labelAngle = startAngle + angle / 2;
          const labelX = 100 + 50 * Math.cos((Math.PI * labelAngle) / 180);
          const labelY = 100 + 50 * Math.sin((Math.PI * labelAngle) / 180);

          startAngle = endAngle;

          return (
            <G key={index}>
              <Path d={path} fill={colors[index]} />
              <SvgText
                x={labelX}
                y={labelY}
                fill="#fff"
                fontSize={12}
                textAnchor="middle"
              >
                {item.angle}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Lottie Animation */}
      <LottieView
        source={require("../../assets/animations/analysis.json")}
        autoPlay
        loop
        style={styles.animation}
      />

      <Text style={styles.title}>Performance Analysis 💪</Text>
      <Text style={styles.subtitle}>
        Review your posture and performance metrics.
      </Text>

      {/* Performance Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Username:</Text>
          <Text style={styles.summaryValue}>{performanceData.username || "N/A"}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Age:</Text>
          <Text style={styles.summaryValue}>{performanceData.age || "N/A"}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Body Weight:</Text>
          <Text style={styles.summaryValue}>{performanceData.body_weight || "N/A"} kg</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Lifted Weight:</Text>
          <Text style={styles.summaryValue}>{performanceData.lifted_weight || "N/A"} kg</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Performance Category:</Text>
          <Text style={styles.summaryValue}>{performanceData.performance_category || "N/A"}</Text>
        </View>
        <ProgressBar
          label="Performance Score"
          value={performanceData?.predicted_performance || 0}
          color="#007BFF"
        />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Lift Type:</Text>
          <Text style={styles.summaryValue}>{performanceData.video_result?.overall_prediction || "N/A"}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Technique:</Text>
          <Text style={styles.summaryValue}>{performanceData.video_result?.technique_feedback || "N/A"}</Text>
        </View>
      </View>

      {/* Fatigue Analysis */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Fatigue Analysis</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Fatigue Level:</Text>
          <Text style={styles.summaryValue}>{performanceData.fatigue_result?.fatigue_level || "N/A"}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Confidence:</Text>
          <Text style={styles.summaryValue}>
            {performanceData.fatigue_result?.confidence_score
              ? `${performanceData.fatigue_result.confidence_score.toFixed(2)}%`
              : "N/A"}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Timestamp:</Text>
          <Text style={styles.summaryValue}>{performanceData.fatigue_result?.timestamp || "N/A"}</Text>
        </View>
        <Text style={styles.fatigueRecommendation}>
          Recommendation: {performanceData.fatigue_result?.recommendation || "No recommendation available."}
        </Text>
        <Text style={styles.fatigueInsight}>
          {performanceData.fatigue_result?.fatigue_level === "Moderate"
            ? "Your fatigue level suggests you're still performing well, but rest intervals could optimize recovery."
            : performanceData.fatigue_result?.fatigue_level === "High"
            ? "High fatigue detected. Consider a longer rest period to prevent overtraining."
            : performanceData.fatigue_result?.fatigue_level === "Low"
            ? "Low fatigue indicates you're in peak condition for training!"
            : "No fatigue data available to provide insights."}
        </Text>
      </View>

      {/* Bar Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Joint Angles (Bar Chart)</Text>
        <BarChart data={chartData} />
      </View>

      {/* Pie Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Joint Angles Distribution (Pie Chart)</Text>
        <PieChart data={chartData} />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("homePage")}
        >
          <FontAwesome5 name="home" size={24} color="#fff" />
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate("overallResults", { username })}
        >
          <Text style={styles.buttonTextSecondary}>Overrall Analysis</Text>
        </TouchableOpacity>
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: "80%",
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
  },
  progressBarContainer: {
    marginBottom: 15,
  },
  progressBarLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressBarValue: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: "80%",
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  buttonContainer: {
    width: "80%",
    marginTop: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
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
  fatigueRecommendation: {
    fontSize: 16,
    color: "#007BFF",
    marginTop: 10,
    fontWeight: "bold",
  },
  fatigueInsight: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "justify",
  },
});