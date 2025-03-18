import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import ExerciseDetailsScreen from "./screens/ExerciseDetailsScreen";
import ExerciseDetailsScreen2 from "./screens/ExerciseDetailsScreen2";
import ExerciseDetailsScreen3 from "./screens/ExerciseDetailsScreen3";
import Models3D from "./screens/Models3D";
import Generatefeedback from "./screens/Generatefeedback";
import Feedback from "./screens/Feedback";

// Define Stack Type
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ExerciseDetail: undefined;
  ExerciseDetail2: undefined;
  ExerciseDetail3: undefined;
  Models3D: undefined;
  Generatefeedback: undefined;
  Feedback: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Feedback">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailsScreen} />
        <Stack.Screen name="ExerciseDetail2" component={ExerciseDetailsScreen2} />
        <Stack.Screen name="ExerciseDetail3" component={ExerciseDetailsScreen3} />
        <Stack.Screen name="Models3D" component={Models3D} />
        <Stack.Screen name="Generatefeedback" component={Generatefeedback} />
        <Stack.Screen name="Feedback" component={Feedback} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}