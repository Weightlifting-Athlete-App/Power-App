import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryScreen from './categoryScreen';
import ExerciseListScreen from './exerciseListScreen';
import ExerciseDetailScreen from './exerciseDetailScreen';

const Stack = createNativeStackNavigator();

export default function WorkoutNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} options={{ title: 'Workouts' }} />
      <Stack.Screen name="ExerciseListScreen" component={ExerciseListScreen} options={{ title: 'Exercises' }} />
      <Stack.Screen name="ExerciseDetailScreen" component={ExerciseDetailScreen} options={{ title: 'Details' }} />
    </Stack.Navigator>
  );
}
