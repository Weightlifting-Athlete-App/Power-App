import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import UserInputScreen from "./screens/UserInputScreen";
import PoseAnalysisScreen from "./screens/PoseAnalysisScreen";
import ResultsScreen from "./screens/ResultsScreen";
import HomeScreen from "./screens/HomeScreen";
import OverallRecordsScreen from "./screens/OverallRecordsScreen";
import CategoryScreen from "./screens/CategoryScreen";
import ExerciseInfoScreen from "./screens/ExerciseInfoScreen";
import ExerciseListScreen from "./screens/ExerciseListScreen";

//  Define Stack Type
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  UserInput: undefined;
  "pose-analysis": { userData: any };
ResultsScreen: {
    username: string;
    performance: number;
    category: string;
  };
  homePage: undefined;
  overallResults: { username: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="UserInput" component={UserInputScreen} />
        <Stack.Screen name="pose-analysis" component={PoseAnalysisScreen} />
         <Stack.Screen name="ResultsScreen" component={ResultsScreen}/>
         <Stack.screen name="overallResults" component={OverallRecordsScreen}/>
        <Stack.Screen name="homePage" component={HomeScreen} />

        <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
        <Stack.Screen name="ExerciseInfoScreen" component={ExerciseInfoScreen} />
        <Stack.Screen name="ExerciseListScreen" component={ExerciseListScreen} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
