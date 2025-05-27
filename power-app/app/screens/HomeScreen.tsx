import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../index"; // Ensure this is the correct path
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {/* Lottie Animation */}
      {/* <LottieView
        source={require("../../assets/animations/weightlifter.json")}
        autoPlay
        loop
        style={styles.animation}
      /> */}

      <Text style={styles.title}>Welcome to Power App 💪</Text>
      <Text style={styles.subtitle}>
        Analyze your posture, get exercise feedback, and improve performance.
      </Text>

      {/* Main Action Buttons Container */}
      <View style={styles.buttonsContainer}>
        {/* Pose Analysis Button */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate("UserInput")}
        >
          <FontAwesome5 name="camera" size={24} color="#fff" />
          <Text style={styles.buttonText}>Start Pose Analysis</Text>
        </TouchableOpacity>

        {/* MainScreen Button */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate("MainScreen")}
        >
        <FontAwesome5 name="chart-bar" size={24} color="#fff" />
          <Text style={styles.buttonText}>Training Techniques</Text>
        </TouchableOpacity>

        {/* Exercises Button */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate("CategoryScreen")}
        >
          <MaterialIcons name="fitness-center" size={24} color="#fff" />
          <Text style={styles.buttonText}>Rehabilitation Exercises</Text>
        </TouchableOpacity>
        {/*Meal Plan Button */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate("MealPlanScreen")}
        >
          <MaterialIcons name="restaurant" size={24} color="#fff" />
          <Text style={styles.buttonText}>Meal Plans</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.button, styles.tertiaryButton]}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonTextTertiary}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 12,
    marginVertical: 8,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: "#3498db",
  },
  secondaryButton: {
    backgroundColor: "#2ecc71",
  },
  tertiaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  buttonTextTertiary: {
    color: "#e74c3c",
    fontSize: 18,
    fontWeight: "600",
  },
});