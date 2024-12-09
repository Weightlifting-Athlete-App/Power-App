// screens/MainScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MainScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weightlifting Techniques</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ExerciseDetails', { exercise: 'Squat' })}
      >
        <Text style={styles.buttonText}>Squat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ExerciseDetails', { exercise: 'Deadlift' })}
      >
        <Text style={styles.buttonText}>Deadlift</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ExerciseDetails', { exercise: 'Bench Press' })}
      >
        <Text style={styles.buttonText}>Bench Press</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
