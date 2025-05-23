import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import PoseAnalysisScreen from './screens/PoseAnalysisScreen';
import ResultsScreen from './screens/ResultsScreen'; 
import HomeScreen from './screens/HomeScreen';
import UserInputScreen from './screens/UserInputScreen';
import OverallRecordsScreen from './screens/OverallRecordsScreen';
import MainScreen from './screens/MainScreen';
import ExerciseDetailsScreen from './screens/ExerciseDetailsScreen';
import ExerciseDetailsScreen2 from './screens/ExerciseDetailsScreen2';
import ExerciseDetailsScreen3 from './screens/ExerciseDetailsScreen3';
import Recomondations from './screens/Recomondations';
import Feedback from './screens/Feedback';

const Stack = createStackNavigator();

export default function Layout() {
  return (
    <Stack.Navigator initialRouteName="MainScreen">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="pose-analysis" component={PoseAnalysisScreen} />
      <Stack.Screen name="ResultsScreen" component={ResultsScreen }/>
      <Stack.Screen name="homePage" component={HomeScreen} />
      <Stack.Screen name="overallResults" component={OverallRecordsScreen}/>
      <Stack.Screen name="UserInput" component={UserInputScreen} />
      <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} />
      <Stack.Screen name="ExerciseDetails2" component={ExerciseDetailsScreen2} />
      <Stack.Screen name="ExerciseDetails3" component={ExerciseDetailsScreen3} />
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen name="Recomondations" component={Recomondations} />
      <Stack.Screen name="Feedback" component={Feedback} />
    </Stack.Navigator>
  );
}