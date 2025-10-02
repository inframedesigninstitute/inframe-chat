import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Clipboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FileData } from '../services/FileService';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  senderName: string;
  type: 'text' | 'file' | 'image' | 'video';
  fileData?: FileData;
  isStarred?: boolean;
  isPinned?: boolean;
  replyTo?: Message;
}

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onStar?: (message: Message) => void;
  onPin?: (message: Message) => void;
  onSelect?: (message: Message) => void;
  isSelected?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
  onReply,
  onForward,
  onStar,
  onPin,
  onSelect,
  isSelected,
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

  const handleStar = () => {
    onStar?.(message);
    setShowActions(false);
  };

  const handlePin = () => {
    onPin?.(message);
    setShowActions(false);
  };

  const handleSelect = () => {
    onSelect?.(message);
    setShowActions(false);
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
              <Text style={styles.replyName}>{message.replyTo.senderName}</Text>
              <Text style={styles.replyText} numberOfLines={1}>
                {message.replyTo.text || 'File'}
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
          {message.type === 'file' && message.fileData && (
            <View style={styles.fileContainer}>
              <Ionicons name="document" size={20} color="#075E54" />
              <Text style={styles.fileName}>{message.fileData.name}</Text>
            </View>
          )}
          
          {message.type === 'image' && (
            <View style={styles.imageContainer}>
              <Ionicons name="image" size={40} color="#075E54" />
              <Text style={styles.imageText}>Photo</Text>
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
  replyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#075E54',
  },
  replyText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  imageContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 4,
  },
  imageText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
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

export default MessageItem;