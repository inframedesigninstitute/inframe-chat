import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type UserItemProps = {
  name: string;
  onPress: () => void;
};

const UserItem = ({ name, onPress }: UserItemProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatar} />
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#888',
    marginRight: 12,
  },
  name: {
    fontSize: 16,
  },
});

export default UserItem;

