import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ChannelGroupActionsProps = {
  onCreateGroup: () => void;
  onJoinGroup?: () => void;
};

const ChannelGroupActions = ({ onCreateGroup, onJoinGroup }: ChannelGroupActionsProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onCreateGroup}>
        <Text style={styles.buttonText}>+ Create Group</Text>
      </TouchableOpacity>

      {onJoinGroup && (
        <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onJoinGroup}>
          <Text style={styles.buttonText}>Join Group</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    marginHorizontal: 5,
  },
  secondary: { backgroundColor: '#2196F3' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

export default ChannelGroupActions;
