
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
    </Stack.Navigator>

  );
}