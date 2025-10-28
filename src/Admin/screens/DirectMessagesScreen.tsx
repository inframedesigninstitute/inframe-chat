import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const users = [
  { id: '1', name: 'Andrew Jones' },
  { id: '2', name: 'Bryce Mosley' },
  { id: '3', name: 'Donald Lundee Jr.' },
];

const DirectMessagesScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { padding: 15, borderBottomWidth: 1, borderColor: '#ccc' },
  name: { fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 20 },
});

export default DirectMessagesScreen;
