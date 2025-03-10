import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

type ExerciseItem = {
  id: string;
  name: string;
  description: string;
};

// A simple mapping from category name to a list of exercises
const exerciseMap: Record<string, ExerciseItem[]> = {
  Shoulder: [
    { id: 'elbowFlexion', name: 'Elbow Flexion', description: 'Strengthen your biceps...' },
    { id: 'elbowExtension', name: 'Elbow Extension', description: 'Work your triceps...' },
  ],
  Knee: [
    { id: 'squats', name: 'Squats', description: 'Full-body exercise focusing on legs...' },
    { id: 'legExtension', name: 'Leg Extension', description: 'Isolate your quadriceps...' },
  ],
};

export default function ExerciseListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { category }: any = route.params; // e.g. { id: '2', name: 'Shoulder' }

  // Based on the selected category, get the appropriate exercises
  const exercises = exerciseMap[category.name] || [];

  const handleExercisePress = (exercise: ExerciseItem) => {
    navigation.navigate('ExerciseDetailScreen' as never, { exercise } as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Category: {category.name}</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleExercisePress(item)}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.descText}>{item.description}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No exercises found for this category.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, marginBottom: 16 },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8
  },
  itemText: { fontSize: 18, fontWeight: 'bold' },
  descText: { fontSize: 14, color: '#777' }
});
