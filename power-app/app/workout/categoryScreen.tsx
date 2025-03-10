import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const categories = [
  { id: '2', name: 'Shoulder' },
  { id: '3', name: 'Knee' },
  // Add more as needed
];

export default function CategoryScreen() {
  const navigation = useNavigation();

  const handleCategoryPress = (category: any) => {
    // Navigate to the exercise list screen, passing category info
    navigation.navigate('ExerciseListScreen' as never, { category } as never);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleCategoryPress(item)}
          >
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8
  },
  itemText: {
    fontSize: 24,
    color: '#000'
  }
});
