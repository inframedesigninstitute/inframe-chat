import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface StarredMessage {
  id: string;
  text: string;
  senderName: string;
  timestamp: Date;
  chatName: string;
  type: 'text' | 'file' | 'image';
}

const StarredMessagesScreen = () => {
  const navigation = useNavigation();
  
  const [starredMessages] = useState<StarredMessage[]>([
    {
      id: '1',
      text: 'Important assignment deadline is tomorrow at 11:59 PM',
      senderName: 'Dr. Sharma',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      chatName: 'Computer Science Class',
      type: 'text',
    },
    {
      id: '2',
      text: 'Meeting scheduled for project discussion on Friday 3 PM',
      senderName: 'Prof. Gupta',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      chatName: 'Research Group',
      type: 'text',
    },
    {
      id: '3',
      text: 'Lab report template attached. Please follow this format.',
      senderName: 'Dr. Patel',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      chatName: 'Physics Lab',
      type: 'file',
    },
  ]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleUnstar = (messageId: string) => {
    Alert.alert(
      'Remove Star',
      'Remove this message from starred messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => console.log('Unstar:', messageId) },
      ]
    );
  };

  const handleMessagePress = (message: StarredMessage) => {
    Alert.alert(
      'Navigate to Chat',
      `Go to ${message.chatName} chat?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go', onPress: () => console.log('Navigate to:', message.chatName) },
      ]
    );
  };

  const renderStarredMessage = ({ item }: { item: StarredMessage }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() => handleMessagePress(item)}
    >
      <View style={styles.messageHeader}>
        <View style={styles.senderInfo}>
          <Text style={styles.senderName}>{item.senderName}</Text>
          <Text style={styles.chatName}>{item.chatName}</Text>
        </View>
        <View style={styles.messageActions}>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          <TouchableOpacity
            style={styles.unstarButton}
            onPress={() => handleUnstar(item.id)}
          >
            <Ionicons name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.messageContent}>
        {item.type === 'file' && (
          <View style={styles.fileIndicator}>
            <Ionicons name="document" size={16} color="#075E54" />
          </View>
        )}
        {item.type === 'image' && (
          <View style={styles.fileIndicator}>
            <Ionicons name="image" size={16} color="#075E54" />
          </View>
        )}
        <Text style={styles.messageText} numberOfLines={2}>
          {item.text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#075E54" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Starred Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      {starredMessages.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No starred messages</Text>
          <Text style={styles.emptyStateSubtext}>
            Star important messages to find them easily later
          </Text>
        </View>
      ) : (
        <FlatList
          data={starredMessages}
          renderItem={renderStarredMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#075E54',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#075E54',
  },
  chatName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messageActions: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  unstarButton: {
    padding: 4,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fileIndicator: {
    marginRight: 8,
    marginTop: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StarredMessagesScreen;
