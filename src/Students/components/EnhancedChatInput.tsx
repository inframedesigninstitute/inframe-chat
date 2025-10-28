import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Text,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../context/UserContext';
import { FileService, FileData } from '../services/FileService';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  type: 'text' | 'file' | 'image' | 'video';
  fileData?: FileData;
}

interface EnhancedChatInputProps {
  onSendMessage: (text: string) => void;
  onSendFile?: (file: FileData) => void;
  onOpenCamera?: () => void;
  onOpenGallery?: () => void;
  placeholder?: string;
  disabled?: boolean;
  recipientRole?: 'student' | 'faculty' | 'admin';
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
}

const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({
  onSendMessage,
  onSendFile,
  onOpenCamera,
  onOpenGallery,
  placeholder = 'Type a message...',
  disabled = false,
  recipientRole,
  replyToMessage,
  onCancelReply,
}) => {
  const [message, setMessage] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user, isStudent, isFaculty, canMessageStudents } = useUser();

  const canSendMessage = () => {
    if (!user) return false;
    
    // Students can only message faculty/admin
    if (isStudent && recipientRole === 'student') {
      return false;
    }
    
    // Faculty can message anyone
    if (isFaculty || user.role === 'admin') {
      return true;
    }
    
    return false;
  };

  const handleSend = () => {
    if (!canSendMessage()) {
      Alert.alert(
        'Permission Denied',
        'Students can only message faculty members and admins.'
      );
      return;
    }

    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      if (replyToMessage && onCancelReply) {
        onCancelReply();
      }
    }
  };

  const handleAttachmentPress = () => {
    if (!canSendMessage()) {
      Alert.alert(
        'Permission Denied',
        'Students can only send files to faculty members.'
      );
      return;
    }
    setShowAttachmentMenu(true);
  };

  const handleDocumentPick = async () => {
    setShowAttachmentMenu(false);
    const file = await FileService.pickDocument();
    if (file && onSendFile) {
      onSendFile(file);
    }
  };

  const handleCameraPress = () => {
    setShowAttachmentMenu(false);
    onOpenCamera?.();
  };

  const handleGalleryPress = () => {
    setShowAttachmentMenu(false);
    onOpenGallery?.();
  };

  const handleEmojiPress = () => {
    setShowEmojiPicker(true);
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['😀', '😂', '😍', '😢', '😡', '👍', '👎', '❤️', '🔥', '👏', '🎉', '💯'];

  const inputPlaceholder = disabled 
    ? 'You cannot send messages'
    : !canSendMessage()
    ? 'You can only message faculty'
    : replyToMessage
    ? `Replying to ${replyToMessage.senderId}`
    : placeholder;

  return (
    <View style={styles.container}>
      {/* Reply Preview */}
      {replyToMessage && (
        <View style={styles.replyPreview}>
          <View style={styles.replyLine} />
          <View style={styles.replyContent}>
            <Text style={styles.replyTo}>Replying to {replyToMessage.senderId}</Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {replyToMessage.text || 'File'}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.cancelReply}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleAttachmentPress}
          disabled={disabled || !canSendMessage()}
        >
          <Ionicons 
            name="attach" 
            size={24} 
            color={disabled || !canSendMessage() ? '#ccc' : '#075E54'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emojiButton}
          onPress={handleEmojiPress}
          disabled={disabled || !canSendMessage()}
        >
          <Ionicons 
            name="happy" 
            size={24} 
            color={disabled || !canSendMessage() ? '#ccc' : '#075E54'} 
          />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.textInput,
            (disabled || !canSendMessage()) && styles.textInputDisabled
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder={inputPlaceholder}
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          editable={!disabled && canSendMessage()}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || disabled || !canSendMessage()) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled || !canSendMessage()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachmentMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentMenu}>
            <TouchableOpacity style={styles.attachmentOption} onPress={handleDocumentPick}>
              <Ionicons name="document" size={24} color="#075E54" />
              <Text style={styles.attachmentText}>Document</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption} onPress={handleCameraPress}>
              <Ionicons name="camera" size={24} color="#075E54" />
              <Text style={styles.attachmentText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption} onPress={handleGalleryPress}>
              <Ionicons name="image" size={24} color="#075E54" />
              <Text style={styles.attachmentText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={styles.emojiMenu}>
            <Text style={styles.emojiTitle}>Select Emoji</Text>
            <View style={styles.emojiGrid}>
              {commonEmojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiItem}
                  onPress={() => addEmoji(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  replyLine: {
    width: 3,
    height: 40,
    backgroundColor: '#075E54',
    marginRight: 12,
  },
  replyContent: {
    flex: 1,
  },
  replyTo: {
    fontSize: 12,
    color: '#075E54',
    fontWeight: '600',
  },
  replyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cancelReply: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
  },
  emojiButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
  },
  textInputDisabled: {
    backgroundColor: '#f9f9f9',
    color: '#999',
  },
  sendButton: {
    backgroundColor: '#075E54',
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attachmentOption: {
    alignItems: 'center',
    padding: 15,
  },
  attachmentText: {
    marginTop: 8,
    fontSize: 12,
    color: '#075E54',
    fontWeight: '500',
  },
  emojiMenu: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    maxHeight: 300,
  },
  emojiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#075E54',
    marginBottom: 15,
    textAlign: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  emojiItem: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  emoji: {
    fontSize: 24,
  },
});

export default EnhancedChatInput;
