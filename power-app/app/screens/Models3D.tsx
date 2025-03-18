import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import RootStackParamList from '../navigation/RootStackParamList';

const Models3D = () => {
  const navigation = useNavigation<NavigationProp<typeof RootStackParamList>>();

  return (
    <View style={styles.container}> 
      <View style={styles.button}>
        <Button
          title="Squat"
          onPress={() => navigation.navigate('ExerciseDetailsScreen' as never)}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Snatch"
          onPress={() => navigation.navigate('ExerciseDetailsScreen2' as never)}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Clean and Jerk"
          onPress={() => navigation.navigate('ExerciseDetailsScreen3' as never)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  button: {
    marginVertical: 10,
  },
});

export default Models3D;
