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
import { RootStackParamList } from "../index"; // Adjust path as needed
import { FontAwesome5 } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import Svg, { Rect, G, Text as SvgText, Line, Polyline, Circle } from "react-native-svg";

export default function OverallRecordsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { username } = route.params as { username: string };
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchAllUserData();
  }, []);

  interface UserDataResponse {
    data: any[];
    [key: string]: any;
  }

  const fetchAllUserData = async () => {
    try {
      const url = `http://192.168.198.43:5000/get_all_user_data/${username}`;
      console.log("Fetching data from:", url);

      const response = await axios.get<UserDataResponse>(url);
      console.log("Response:", response.data);

      if (response.data && response.data.data) {
        setRecords(response.data.data);
      } else {
        Alert.alert("Error", "No records found for this user.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Failed to fetch user records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../../assets/animations/results.json")}
          autoPlay
          loop
          style={styles.animation}
        />
        <Text style={styles.subtitle}>Fetching Records...</Text>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!records.length) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../../assets/animations/results.json")}
          autoPlay
          loop
          style={styles.animation}
        />
        <Text style={styles.subtitle}>No records available for {username}.</Text>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate("homePage")}
        >
          <Text style={styles.buttonTextSecondary}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Prepare data for graphs
  const fatigueLevels = records.map((record) =>
    record.fatigue_result?.fatigue_label !== undefined
      ? record.fatigue_result.fatigue_label // 0: High, 1: Moderate, 2: Low
      : 1 // Default to Moderate if missing
  );
  const performances = records.map((record) => record.predicted_performance || 0);
  const performanceCategories = records.map((record) => record.performance_category || "Unknown");
  const categoryCounts = performanceCategories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Line Graph Component for Fatigue
  const FatigueLineGraph = ({ data }: { data: number[] }) => {
    const maxValue = 2; // Max fatigue label (Low = 2)
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * 300, // 300 is SVG width
      y: 200 - (value / maxValue) * 180, // 200 is SVG height
    }));

    return (
      <Svg width="100%" height={200}>
        <Polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#4c669f"
          strokeWidth="2"
        />
        {points.map((p, index) => (
          <G key={index}>
            <Circle cx={p.x} cy={p.y} r="4" fill="#4c669f" />
            <SvgText x={p.x} y={p.y - 10} fill="#333" fontSize={12} textAnchor="middle">
              {["High", "Moderate", "Low"][data[index]]}
            </SvgText>
          </G>
        ))}
        <Line x1="0" y1="200" x2="300" y2="200" stroke="#E0E0E0" strokeWidth="1" />
      </Svg>
    );
  };

  // Line Graph Component for Performance
  const PerformanceLineGraph = ({ data }: { data: number[] }) => {
    const maxValue = Math.max(...data, 100); // Max performance score
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * 300,
      y: 200 - (value / maxValue) * 180,
    }));

    return (
      <Svg width="100%" height={200}>
        <Polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#28A745"
          strokeWidth="2"
        />
        {points.map((p, index) => (
          <G key={index}>
            <Circle cx={p.x} cy={p.y} r="4" fill="#28A745" />
            <SvgText x={p.x} y={p.y - 10} fill="#333" fontSize={12} textAnchor="middle">
              {data[index].toFixed(2)}%
            </SvgText>
          </G>
        ))}
        <Line x1="0" y1="200" x2="300" y2="200" stroke="#E0E0E0" strokeWidth="1" />
      </Svg>
    );
  };

  // Bar Chart Component for Performance Category
  const CategoryBarChart = ({ data }: { data: { [key: string]: number } }) => {
    const categories = Object.keys(data);
    const maxCount = Math.max(...Object.values(data));
    const colors = ["#007BFF", "#28A745", "#FFC107", "#DC3545"];

    return (
      <Svg width="100%" height={200}>
        {categories.map((category, index) => (
          <G key={index}>
            <Rect
              x={index * 80 + 20}
              y={200 - (data[category] / maxCount) * 180}
              width={60}
              height={(data[category] / maxCount) * 180}
              fill={colors[index % colors.length]}
            />
            <SvgText
              x={index * 80 + 50}
              y={220}
              fill="#333"
              fontSize={12}
              textAnchor="middle"
            >
              {category}
            </SvgText>
            <SvgText
              x={index * 80 + 50}
              y={200 - (data[category] / maxCount) * 180 - 10}
              fill={colors[index % colors.length]}
              fontSize={12}
              textAnchor="middle"
            >
              {data[category]}
            </SvgText>
          </G>
        ))}
      </Svg>
    );
  };

  // Additional Analysis
  const getTrendAnalysis = () => {
    const fatigueTrend = fatigueLevels.length > 1 ? fatigueLevels[fatigueLevels.length - 1] - fatigueLevels[0] : 0;
    const perfTrend = performances.length > 1 ? performances[performances.length - 1] - performances[0] : 0;

    let fatigueMessage = "Fatigue trend unavailable.";
    if (fatigueTrend > 0) fatigueMessage = "Fatigue is decreasing (improving).";
    else if (fatigueTrend < 0) fatigueMessage = "Fatigue is increasing (worsening).";

    let perfMessage = "Performance trend unavailable.";
    if (perfTrend > 0) perfMessage = "Performance is improving.";
    else if (perfTrend < 0) perfMessage = "Performance is declining.";

    return `${fatigueMessage} ${perfMessage}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LottieView
        source={require("../../assets/animations/results.json")}
        autoPlay
        loop
        style={styles.animation}
      />

      <Text style={styles.title}>Overall Records for {username} 📊</Text>
      <Text style={styles.subtitle}>View all your performance and fatigue records.</Text>

      {/* Records Table */}
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>All Records</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Fatigue</Text>
          <Text style={styles.tableHeaderText}>Performance</Text>
          <Text style={styles.tableHeaderText}>Category</Text>
          <Text style={styles.tableHeaderText}>Lift Type</Text>
        </View>
        {records.map((record, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{record.fatigue_result?.fatigue_level || "N/A"}</Text>
            <Text style={styles.tableCell}>{record.predicted_performance?.toFixed(2)}%</Text>
            <Text style={styles.tableCell}>{record.performance_category || "N/A"}</Text>
            <Text style={styles.tableCell}>{record.video_result?.overall_prediction || "N/A"}</Text>
          </View>
        ))}
      </View>

      {/* Fatigue Line Graph */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Fatigue Level Over Time</Text>
        <FatigueLineGraph data={fatigueLevels} />
      </View>

      {/* Performance Line Graph */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Performance Score Over Time</Text>
        <PerformanceLineGraph data={performances} />
      </View>

      {/* Performance Category Bar Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Performance Category Distribution</Text>
        <CategoryBarChart data={categoryCounts} />
      </View>

      {/* Additional Analysis */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Trend Analysis</Text>
        <Text style={styles.analysisText}>{getTrendAnalysis()}</Text>
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
          onPress={() => navigation.navigate("UserInput")}
        >
          <Text style={styles.buttonTextSecondary}>New Analysis</Text>
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
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: "90%",
    elevation: 3,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  tableCell: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    textAlign: "center",
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
  analysisText: {
    fontSize: 16,
    color: "#666",
    textAlign: "justify",
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
});