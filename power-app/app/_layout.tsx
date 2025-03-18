import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import PoseAnalysisScreen from './screens/PoseAnalysisScreen';
import ResultsScreen from './screens/ResultsScreen'; 
import HomeScreen from './screens/HomeScreen';
import UserInputScreen from './screens/UserInputScreen';
import OverallRecordsScreen from './screens/OverallRecordsScreen';

const Stack = createStackNavigator();

export default function Layout() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="pose-analysis" component={PoseAnalysisScreen} />
      <Stack.Screen name="ResultsScreen" component={ResultsScreen }/>
      <Stack.Screen name="homePage" component={HomeScreen} />
      <Stack.Screen name="overallResults" component={OverallRecordsScreen}/>
      <Stack.Screen name="UserInput" component={UserInputScreen} />
    </Stack.Navigator>
  );
}