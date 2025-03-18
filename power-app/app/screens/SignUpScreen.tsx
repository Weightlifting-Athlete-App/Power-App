import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { Button } from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import axios from "axios";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../index"; // Adjust path as needed

interface SignUpScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://192.168.198.43:5000/register", {
        username,
        password,
      });
      Alert.alert("Success", "Registration successful! Please log in.");
      console.log("SignUp Response:", response.data);
      navigation.navigate("Login"); // Navigate to Login after successful signup
    } catch (error) {
      console.error("SignUp Error:", error);
      Alert.alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/animations/signup.json")} // Add a signup animation
        autoPlay
        loop
        style={styles.animation}
      />

      <Text style={styles.title}>Join Power App! 🌟</Text>
      <Text style={styles.subtitle}>Sign up to start your fitness journey.</Text>

      <View style={styles.inputContainer}>
        <FontAwesome5 name="user" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome5 name="lock" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome5 name="lock" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSignUp}
        style={styles.button}
        disabled={loading}
        loading={loading}
        icon={() => <FontAwesome5 name="user-plus" size={24} color="#fff" />}
        labelStyle={styles.buttonText}
      >
        Sign Up
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate("Login")}
        style={styles.buttonSecondary}
        labelStyle={styles.buttonTextSecondary}
      >
        Already have an account? Login
      </Button>
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 10,
    width: "80%",
    borderColor: "#007BFF",
    borderWidth: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
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
    fontSize: 16,
    fontWeight: "bold",
  },
});