import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { TextInput, Button, Text, RadioButton } from "react-native-paper";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../index";
import { FontAwesome5 } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

type NavigationProp = StackNavigationProp<RootStackParamList, "UserInput">;

export default function UserInputScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [userData, setUserData] = useState({
    username: "",
    age: "",
    age_start: "",
    yrs_experience: "",
    sex_encoded: "1", // Default to Male
    body_weight: "",
    lifted_weight: "",
  });

  const handleInputChange = (key: string, value: string) => {
    setUserData((prev) => {
      let updatedData = { ...prev, [key]: value };

      // Automatically calculate years of experience
      if (key === "age" || key === "age_start") {
        const age = parseInt(updatedData.age, 10);
        const ageStart = parseInt(updatedData.age_start, 10);
        if (!isNaN(age) && !isNaN(ageStart) && age > ageStart) {
          updatedData.yrs_experience = (age - ageStart).toString();
        } else {
          updatedData.yrs_experience = "";
        }
      }

      return updatedData;
    });
  };

  const handleSubmit = () => {
    if (!userData.username || !userData.age || !userData.age_start || !userData.body_weight || !userData.lifted_weight) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    console.log("Sending User Data:", JSON.stringify(userData, null, 2));

    // Navigate to PoseAnalysisScreen with user inputs
    navigation.navigate("pose-analysis", { userData });

  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Lottie Animation */}
      <LottieView
        source={require("../../assets/animations/user.json")}
        autoPlay
        loop
        style={styles.animation}
      />

      <Text style={styles.title}>Enter Your Details 💪</Text>
      <Text style={styles.subtitle}>
        Provide your information to analyze your posture and performance.
      </Text>

      {/* Username Input */}
      <TextInput
        label="Full Name"
        value={userData.username}
        onChangeText={(value) => handleInputChange("username", value)}
        style={styles.input}
        mode="outlined"
        theme={{ colors: { primary: "#007BFF", background: "#FFF" } }}
      />

      {/* Age Input */}
      <TextInput
        label="Your Age"
        value={userData.age}
        onChangeText={(value) => handleInputChange("age", value)}
        style={styles.input}
        keyboardType="numeric"
        mode="outlined"
        theme={{ colors: { primary: "#007BFF", background: "#FFF" } }}
      />

      {/* Age Start Input */}
      <TextInput
        label="The Age You Started Weight Lifting"
        value={userData.age_start}
        onChangeText={(value) => handleInputChange("age_start", value)}
        style={styles.input}
        keyboardType="numeric"
        mode="outlined"
        theme={{ colors: { primary: "#007BFF", background: "#FFF" } }}
      />

      {/* Experience (Auto Calculated) */}
      <TextInput
        label="Years of Experience"
        value={userData.yrs_experience}
        style={styles.input}
        editable={false} // Disable manual input
        mode="outlined"
        theme={{ colors: { primary: "#007BFF", background: "#FFF" } }}
      />

      {/* Gender Selection */}
      <Text style={styles.radioTitle}>Select Gender</Text>
      <View style={styles.radioGroup}>
        <RadioButton.Item
          label="Male"
          value="1"
          status={userData.sex_encoded === "1" ? "checked" : "unchecked"}
          onPress={() => handleInputChange("sex_encoded", "1")}
          color="#007BFF"
          labelStyle={styles.radioLabel}
        />
        <RadioButton.Item
          label="Female"
          value="0"
          status={userData.sex_encoded === "0" ? "checked" : "unchecked"}
          onPress={() => handleInputChange("sex_encoded", "0")}
          color="#007BFF"
          labelStyle={styles.radioLabel}
        />
      </View>

      {/* Body Weight Input */}
      <TextInput
        label="Body Weight (KG)"
        value={userData.body_weight}
        onChangeText={(value) => handleInputChange("body_weight", value)}
        style={styles.input}
        keyboardType="numeric"
        mode="outlined"
        theme={{ colors: { primary: "#007BFF", background: "#FFF" } }}
      />

      {/* Lifted Weight Input */}
      <TextInput
        label="Max Lifted Weight (KG)"
        value={userData.lifted_weight}
        onChangeText={(value) => handleInputChange("lifted_weight", value)}
        style={styles.input}
        keyboardType="numeric"
        mode="outlined"
        theme={{ colors: { primary: "#007BFF", background: "#FFF" } }}
      />

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          labelStyle={styles.buttonText}
          icon={() => <FontAwesome5 name="check" size={24} color="#fff" />}
        >
          Submit 
        </Button>
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
  input: {
    width: "80%",
    marginBottom: 15,
    backgroundColor: "white",
    borderRadius: 8,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#333",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginBottom: 15,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  radioLabel: {
    color: "#333",
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