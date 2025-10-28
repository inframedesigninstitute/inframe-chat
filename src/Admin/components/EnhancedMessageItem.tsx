import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Clipboard,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LocalDatabase from '../services/LocalDatabase';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  senderName: string;
  type: 'text' | 'file' | 'image' | 'video';
  fileUri?: string;
  isStarred?: boolean;
  isPinned?: boolean;
  replyTo?: string;
  channelId: string;
}

interface EnhancedMessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onSelect?: (message: Message) => void;
  isSelected?: boolean;
  onUpdate?: () => void;
}

const EnhancedMessageItem: React.FC<EnhancedMessageItemProps> = ({
  message,
  isOwnMessage,
  onReply,
  onForward,
  onSelect,
  isSelected,
  onUpdate,
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleLongPress = () => {
    setShowActions(true);
  };

  const handleCopy = () => {
    Clipboard.setString(message.text);
    Alert.alert('Copied', 'Message copied to clipboard');
    setShowActions(false);
  };

  const handleReply = () => {
    onReply?.(message);
    setShowActions(false);
  };

  const handleForward = () => {
    onForward?.(message);
    setShowActions(false);
  };

  const handleStar = async () => {
    try {
      await LocalDatabase.starMessage(message.id, !message.isStarred);
      setShowActions(false);
      onUpdate?.();
      Alert.alert('Success', `Message ${message.isStarred ? 'unstarred' : 'starred'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to star/unstar message');
    }
  };

  const handlePin = async () => {
    try {
      await LocalDatabase.pinMessage(message.id, !message.isPinned);
      setShowActions(false);
      onUpdate?.();
      Alert.alert('Success', `Message ${message.isPinned ? 'unpinned' : 'pinned'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to pin/unpin message');
    }
  };

  const handleSelect = () => {
    onSelect?.(message);
    setShowActions(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocalDatabase.deleteMessage(message.id);
              setShowActions(false);
              onUpdate?.();
              Alert.alert('Success', 'Message deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          isSelected && styles.selectedMessage,
          message.isPinned && styles.pinnedMessage,
        ]}
        onLongPress={handleLongPress}
        onPress={() => isSelected && onSelect?.(message)}
      >
        {/* Pinned indicator */}
        {message.isPinned && (
          <View style={styles.pinnedIndicator}>
            <Ionicons name="pin" size={12} color="#075E54" />
          </View>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <View style={styles.replyContainer}>
            <View style={styles.replyLine} />
            <View style={styles.replyContent}>
              <Text style={styles.replyText} numberOfLines={1}>
                Replying to message
              </Text>
            </View>
          </View>
        )}

        {/* Sender name (for group messages) */}
        {!isOwnMessage && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        {/* Message content */}
        <View style={styles.messageContent}>
          {message.type === 'image' && message.fileUri && (
            <Image source={{ uri: message.fileUri }} style={styles.messageImage} />
          )}
          
          {message.type === 'file' && (
            <View style={styles.fileContainer}>
              <Ionicons name="document" size={20} color="#075E54" />
              <Text style={styles.fileName}>Document</Text>
            </View>
          )}
          
          {message.type === 'video' && (
            <View style={styles.videoContainer}>
              <Ionicons name="videocam" size={40} color="#075E54" />
              <Text style={styles.videoText}>Video</Text>
            </View>
          )}

          {message.text && (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {message.text}
            </Text>
          )}
        </View>

        {/* Message footer */}
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          
          {message.isStarred && (
            <Ionicons name="star" size={12} color="#FFD700" style={styles.starIcon} />
          )}
          
          {isOwnMessage && (
            <Ionicons name="checkmark-done" size={14} color="#4CAF50" />
          )}
        </View>
      </TouchableOpacity>

      {/* Actions Modal */}
      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionsMenu}>
            <TouchableOpacity style={styles.actionItem} onPress={handleReply}>
              <Ionicons name="arrow-undo" size={20} color="#075E54" />
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleForward}>
              <Ionicons name="arrow-forward" size={20} color="#075E54" />
              <Text style={styles.actionText}>Forward</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleCopy}>
              <Ionicons name="copy" size={20} color="#075E54" />
              <Text style={styles.actionText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleStar}>
              <Ionicons 
                name={message.isStarred ? "star" : "star-outline"} 
                size={20} 
                color="#FFD700" 
              />
              <Text style={styles.actionText}>
                {message.isStarred ? 'Unstar' : 'Star'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handlePin}>
              <Ionicons 
                name={message.isPinned ? "pin" : "pin-outline"} 
                size={20} 
                color="#075E54" 
              />
              <Text style={styles.actionText}>
                {message.isPinned ? 'Unpin' : 'Pin'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleSelect}>
              <Ionicons name="checkmark-circle" size={20} color="#075E54" />
              <Text style={styles.actionText}>Select</Text>
            </TouchableOpacity>

            {isOwnMessage && (
              <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
                <Ionicons name="trash" size={20} color="#FF3B30" />
                <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#075E54',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedMessage: {
    backgroundColor: '#E3F2FD',
  },
  pinnedMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#075E54',
  },
  pinnedIndicator: {
    position: 'absolute',
    top: -6,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 2,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 8,
  },
  replyLine: {
    width: 3,
    height: 30,
    backgroundColor: '#075E54',
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#075E54',
    marginBottom: 4,
  },
  messageContent: {
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 4,
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  videoContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 4,
  },
  videoText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  ownTimestamp: {
    color: '#E8F5E8',
  },
  otherTimestamp: {
    color: '#999',
  },
  starIcon: {
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
  },
});

export default EnhancedMessageItem;
