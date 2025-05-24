import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

type ExerciseItem = {
  id: string;
  name: string;
  description: string;
  steps: string[];
};

const exerciseMap: Record<string, ExerciseItem[]> = {
  Shoulder: [
    {
      id: 'elbowFlexion',
      name: 'Elbow Flexion',
      description: 'Strengthen your biceps...',
      steps: [
        'Sit or stand comfortably.',
        'Hold a light weight in your hand.',
        'Bend your elbow to bring the weight up.',
        'Lower it slowly back down.',
        'Repeat for 10 reps.'
      ]
    },
    {
      id: 'elbowExtension',
      name: 'Elbow Extension',
      description: 'Work your triceps...',
      steps: [
        'Sit with your arm overhead.',
        'Bend your elbow to lower your hand behind your head.',
        'Extend your elbow to lift your hand up.',
        'Repeat for 10 reps.'
      ]
    }
  ],
  Knee: [
    {
      id: 'squats',
      name: 'Squats',
      description: 'Full-body exercise focusing on legs...',
      steps: [
        'Stand with your feet shoulder-width apart.',
        'Lower your body by bending your knees.',
        'Keep your back straight.',
        'Go down as if sitting in a chair.',
        'Return to standing. Repeat for 10 reps.'
      ]
    },
    {
      id: 'legExtension',
      name: 'Leg Extension',
      description: 'Isolate your quadriceps...',
      steps: [
        'Sit on a chair or leg extension machine.',
        'Extend your leg outward until it’s straight.',
        'Lower it back down slowly.',
        'Repeat with the other leg.'
      ]
    }
  ]
};

export default function ExerciseListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { category }: any = route.params;

  const [subtitle, setSubtitle] = useState<string | null>(null);

  const exercises = exerciseMap[category.name] || [];

  const handleExercisePress = (exercise: ExerciseItem) => {
    navigation.navigate('ExerciseInfoScreen' as never, { exercise } as never);
  };

  const speakExercise = async (exercise: ExerciseItem) => {
    Speech.stop();
    setSubtitle(null);

    const allParts = [
      `${exercise.name}`,
      `${exercise.description}`,
      ...exercise.steps.map((step, i) => `Step ${i + 1}: ${step}`)
    ];

    for (let part of allParts) {
      setSubtitle(part);
      Speech.speak(part, {
        pitch: 1.1,
        rate: 0.95,
        language: 'en-US'
      });

      // Estimate duration based on word count (approx. 150 words/min = 2.5 wps)
      const wordCount = part.split(' ').length;
      const estimatedDuration = wordCount * 600; // 600ms per word (adjust if needed)

      await new Promise(resolve => setTimeout(resolve, estimatedDuration));
    }

    setSubtitle(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Category: {category.name}</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleExercisePress(item)}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemText}>{item.name}</Text>
              <TouchableOpacity onPress={() => speakExercise(item)}>
                <Ionicons name="volume-high" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.descText}>{item.description}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No exercises found for this category.</Text>
        }
      />

      {subtitle && (
        <View style={styles.subtitleBox}>
          <Text style={styles.subtitleText}>{subtitle}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, marginBottom: 16, fontWeight: 'bold' },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  itemText: { fontSize: 18, fontWeight: 'bold' },
  descText: { fontSize: 14, color: '#555' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  subtitleBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 10
  },
  subtitleText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center'
  }
});
