import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* App Logo */}
      {/* <Image source={require("../../assets/logo.png")} style={styles.logo} /> */}

      {/* Title */}
      <Text style={styles.title}>Welcome to Power App 💪</Text>
      <Text style={styles.subtitle}>
        Analyze your posture, get exercise feedback, and improve performance.
      </Text>

      {/* Navigation Buttons */}
      <TouchableOpacity style={styles.button} onPress={() => router.push("/screens/PoseAnalysisScreen")}>
        <FontAwesome5 name="camera" size={24} color="#fff" />
        <Text style={styles.buttonText}>Start Pose Analysis</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.push("/screens/LoginScreen")}>
        <Text style={styles.buttonTextSecondary}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
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
    width: "80%",
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