import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';

type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isTeacherMessage: boolean;
};

type GroupChatRouteProp = RouteProp<RootStackParamList, 'GroupChat'>;

const GroupChatScreen = () => {
  const route = useRoute<GroupChatRouteProp>();
  const { groupId, groupName, isTeacher } = route.params;
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello everyone! Welcome to the group.', sender: 'Teacher', timestamp: '10:00 AM', isTeacherMessage: true },
    { id: '2', text: 'Hi Teacher!', sender: 'Student A', timestamp: '10:01 AM', isTeacherMessage: false },
    { id: '3', text: 'Please check the assignment uploaded.', sender: 'Teacher', timestamp: '10:05 AM', isTeacherMessage: true },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isAddMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handleSendMessage = () => {
    if (!isTeacher) {
      Alert.alert('Permission Denied', 'Only teachers can send messages in this group.');
      return;
    }
    if (newMessage.trim()) {
      const message: Message = {
        id: String(messages.length + 1),
        text: newMessage.trim(),
        sender: 'Teacher',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTeacherMessage: true,
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleAddMember = () => {
    if (!isTeacher) {
      Alert.alert('Permission Denied', 'Only teachers can add members to this group.');
      return;
    }
    setAddMemberModalVisible(true);
  };

  const handleConfirmAddMember = () => {
    if (newMemberEmail.trim()) {
Alert.alert('Member Added', `${newMemberEmail} has been added to the group.`);
      setNewMemberEmail('');
      setAddMemberModalVisible(false);
    } else {
      Alert.alert('Error', 'Please enter an email address.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.groupName}>{groupName}</Text>
        {isTeacher && (
          <TouchableOpacity onPress={handleAddMember} style={styles.addMemberButton}>
            <Ionicons name="person-add" size={24} color="#075E54" />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages List */}
      <FlatList
        data={messages.slice().reverse()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.isTeacherMessage ? styles.teacherMessage : styles.studentMessage,
          ]}>
            <Text style={styles.messageSender}>{item.sender}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
          </View>
        )}
        inverted
        style={styles.messagesList}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={isTeacher ? 'Type a message...' : 'Only teachers can send messages'}
          placeholderTextColor="#999"
          value={newMessage}
          onChangeText={setNewMessage}
          editable={isTeacher}
        />
        <TouchableOpacity
          style={[styles.sendButton, !isTeacher && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!isTeacher}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Add Member Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddMemberModalVisible}
        onRequestClose={() => setAddMemberModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Member</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter member's email"
              placeholderTextColor="#999"
              value={newMemberEmail}
              onChangeText={setNewMemberEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setAddMemberModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleConfirmAddMember}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  groupName: { fontSize: 18, fontWeight: '600', color: '#000', flex: 1, textAlign: 'center' },
  addMemberButton: { padding: 8 },
  messagesList: { flex: 1, paddingHorizontal: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, marginVertical: 4, borderRadius: 12 },
  teacherMessage: { alignSelf: 'flex-end', backgroundColor: '#075E54' },
  studentMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0' },
  messageSender: { fontSize: 12, fontWeight: '600', marginBottom: 4, color: '#666' },
  messageText: { fontSize: 16, marginBottom: 4, color: '#000' },
  messageTimestamp: { fontSize: 11, color: '#999', alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 12, fontSize: 16, backgroundColor: '#f5f5f5' },
  sendButton: { backgroundColor: '#075E54', borderRadius: 20, padding: 10, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#ccc' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '80%', maxWidth: 300 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 16, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 0.45, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modalCancelButton: { backgroundColor: '#f0f0f0' },
  modalConfirmButton: { backgroundColor: '#075E54' },
  modalButtonText: { fontSize: 16, fontWeight: '600', color: '#000' },
});

export default GroupChatScreen;