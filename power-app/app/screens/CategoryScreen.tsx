import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const categories = [
  { id: '2', name: 'Shoulder' },
  { id: '3', name: 'Knee' },
];

export default function CategoryScreen() {
  const navigation = useNavigation();

  const handleCategoryPress = (category: any) => {
    navigation.navigate('ExerciseListScreen' as never, { category } as never);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleCategoryPress(item)}>
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <Image
        source={require('../../assets/images/background.jpg')}
        style={styles.backgroundImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  item: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  itemText: { fontSize: 24, color: '#fff' },
  backgroundImage: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
    marginTop: 10,
  },
});
