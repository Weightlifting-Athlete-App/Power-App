
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ExerciseDetailsScreen from './screens/ExerciseDetailsScreen';
import ExerciseDetailsScreen2 from './screens/ExerciseDetailsScreen2';
import ExerciseDetailsScreen3 from './screens/ExerciseDetailsScreen3';
import Models3D from './screens/Models3D';
import Generatefeedback from './screens/Generatefeedback';
import Feedback from './screens/Feedback';
import PoseAnalysisScreen from './screens/PoseAnalysisScreen';
import ResultsScreen from './screens/ResultsScreen'; 
import HomeScreen from './screens/HomeScreen';
import UserInputScreen from './screens/UserInputScreen';

const Stack = createStackNavigator();

export default function Layout() {
  return (
    <Stack.Navigator initialRouteName="Feedback">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailsScreen} />
      <Stack.Screen name="ExerciseDetail2" component={ExerciseDetailsScreen2} />
      <Stack.Screen name="ExerciseDetail3" component={ExerciseDetailsScreen3} />
      <Stack.Screen name="Models3D" component={Models3D} />
      <Stack.Screen name="Generatefeedback" component={Generatefeedback} />
      <Stack.Screen name="Feedback" component={Feedback} />
  
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="pose-analysis" component={PoseAnalysisScreen} />
      <Stack.Screen name="ResultsScreen" component={ResultsScreen }/>
      <Stack.Screen name="homePage" component={HomeScreen} />
      <Stack.Screen name="UserInput" component={UserInputScreen} />
    </Stack.Navigator>
  );
}