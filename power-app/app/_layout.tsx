import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ExerciseDetailsScreen from './screens/ExerciseDetailsScreen';
import ExerciseDetailsScreen2 from './screens/ExerciseDetailsScreen2';

const Stack = createStackNavigator();

export default function Layout() {
  return (
    <Stack.Navigator initialRouteName="ExerciseDetail">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailsScreen} />
      <Stack.Screen name="ExerciseDetail2" component={ExerciseDetailsScreen2} />
    </Stack.Navigator>
  );
}