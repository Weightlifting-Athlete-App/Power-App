// screens/MainScreen.tsx
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

import { NavigationProp } from '@react-navigation/native';

interface MainScreenProps {
  navigation: NavigationProp<any>;
}

export default function MainScreen({ navigation }: MainScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weightlifting Techniques</Text>
      <Image
        source={require('../../assets/images/weight.jpg')}
        style={styles.image}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ExerciseDetails')}
      >
        <Text style={styles.buttonText}>Squat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ExerciseDetails2')}
      >
        <Text style={styles.buttonText}>Snach</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ExerciseDetails3')}
      >
        <Text style={styles.buttonText}>Clean & Jerk</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Recomondations')}
      >
        <Text style={styles.buttonText}>Recomondations</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Feedback')}>
        <Text style={styles.buttonText}>Feedback</Text>
      </TouchableOpacity>
    </View>
  );
}
MainScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
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
