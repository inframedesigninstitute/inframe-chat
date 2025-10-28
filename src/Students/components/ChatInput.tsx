import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ChatInputProps = {
  onSend: (message: string) => void;
};

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#ccc' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default ChatInput;
