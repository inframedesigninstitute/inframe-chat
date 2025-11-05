import Clipboard from "@react-native-clipboard/clipboard";
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Assuming you have these components/types or similar ones in your project
import LocationModal from '../components/LocationModal'; // Placeholder: Assuming you have this
import MarqueeText from '../components/MarqueeText'; // Placeholder: Assuming you have this
import MessageOptionsModal from '../components/MessageOptionsModal'; // Placeholder: Assuming you have this
import QuizPollModal from '../components/QuizPollModal'; // Placeholder: Assuming you have this
import type { RootStackParamList } from '../navigation/types';

// Placeholder functions for external utility imports (DocumentPicker, GalleryPicker)
const openDocumentPicker = (callback: (fileName: string) => void) => Alert.alert("Document Picker", "Document picker logic goes here. Mocking file selection.", [{ text: "OK", onPress: () => callback("mock_document.pdf") }]);
const openGallery = (callback: (imageUri: string) => void) => Alert.alert("Gallery Picker", "Gallery picker logic goes here. Mocking image URI.", [{ text: "OK", onPress: () => callback("mock_image_uri") }]);
const { setString } = Clipboard; // Use Clipboard import directly

const { width } = Dimensions.get("window");

type GroupChatRouteProp = RouteProp<RootStackParamList, 'GroupChat'>;
type GroupChatNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupChat'>; 

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isTeacherMessage: boolean;
  status: "sent" | "delivered" | "read";
}

const GroupChatScreen = () => {
  const route = useRoute<GroupChatRouteProp>();
  const navigation = useNavigation<GroupChatNavigationProp>();
  // Group details from navigation params
  const { groupId, groupName, isTeacher } = route.params;

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello everyone! Welcome to the group.', sender: 'Teacher', timestamp: '10:00 AM', isTeacherMessage: true, status: "read" },
    { id: '2', text: 'Hi ftyhtfTeacher!', sender: 'Student A', timestamp: '10:01 AM', isTeacherMessage: false, status: "read" },
    { id: '3', text: 'Please check the assignment uploaded.', sender: 'Teacher', timestamp: '10:05 AM', isTeacherMessage: true, status: "read" },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isAddMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [pollModalVisible, setPollModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [locationVisible, setLocationVisible] = useState<boolean>(false);

  // --- Gated Event Handlers (Teacher Only) ---

  const handlePoll = () => {
    if (!isTeacher) { Alert.alert('Permission Denied', 'Only teachers can create polls/quizzes.'); return; }
    setPollModalVisible(true);
    setShowAttachments(false);
  };

  const handleSendMessage = () => {
    if (!isTeacher) { Alert.alert('Permission Denied', 'Only teachers can send messages in this group.'); return; }
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: 'Teacher',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTeacherMessage: true,
        status: "sent"
      };
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleDocument = () => {
    if (!isTeacher) { Alert.alert('Permission Denied', 'Only teachers can send documents.'); return; }
    openDocumentPicker((fileName) => {
      const docMessage: Message = {
        id: Date.now().toString(),
        text: `📄 Document: ${fileName}`,
        sender: 'Teacher',
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isTeacherMessage: true,
        status: "sent",
      };
      setMessages((prev) => [...prev, docMessage]);
      setShowAttachments(false);
    });
  };

  const handleOpenGallery = () => {
    if (!isTeacher) { Alert.alert('Permission Denied', 'Only teachers can share from gallery.'); return; }
    openGallery((imageUri: string) => {
      const message: Message = {
        id: Date.now().toString(),
        text: "📷 Image: " + imageUri,
        sender: 'Teacher',
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isTeacherMessage: true,
        status: "sent",
      }
      setMessages((prev) => [...prev, message]);
      setShowAttachments(false);
    })
  }

  const handleCamera = () => {
    if (!isTeacher) { Alert.alert('Permission Denied', 'Only teachers can open the camera from here.'); return; }
    setShowAttachments(false);
    // navigation.navigate("Camera"); // Mocking navigation
    Alert.alert("Camera", "Navigating to Camera Screen...");
  }

  const handleAudio = () => {
    if (!isTeacher) { Alert.alert('Permission Denied', 'Only teachers can send audio.'); return; }
    Alert.alert("Audio Recording", "Starting/Stopping Audio Recording logic...");
  }

  const handleSendLocation = (coords: { latitude: number; longitude: number }) => {
    if (!isTeacher) { Alert.alert('Permission Denied', 'Only teachers can share location.'); setLocationVisible(false); return; }
    const locationMessage: Message = {
      id: Date.now().toString(),
      text: `📍 Location: ${coords.latitude},${coords.longitude}`,
      sender: 'Teacher',
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isTeacherMessage: true,
      status: "sent",
    }
    setMessages((prevMessages) => [...prevMessages, locationMessage]);
    setLocationVisible(false);
  }

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

  // --- Message Options Handlers (Copy/Delete) ---

  const handleCopyMessage = () => {
    if (selectedMessage) {
      setString(selectedMessage.text);
      setOptionsModalVisible(false);
      Alert.alert("Copied", "Message copied to clipboard.");
    }
  }

  const handleDeleteMessage = () => {
    // Allow students to delete their own mock messages for simplicity, but only teachers can send new ones.
    if (!isTeacher && selectedMessage && selectedMessage.isTeacherMessage) {
      Alert.alert('Permission Denied', 'Only teachers can delete teacher messages.');
      setOptionsModalVisible(false);
      return;
    }
    if (selectedMessage) {
      setMessages(messages.filter((msg) => msg.id !== selectedMessage.id));
      setOptionsModalVisible(false);
    }
  }

  // --- Message Renderer ---

  const renderMessage = ({ item }: { item: Message }) => {
    const isSent = item.isTeacherMessage; // Teacher messages are styled as "sent"
    return (
      <TouchableOpacity
        onLongPress={() => {
          setSelectedMessage(item);
          setOptionsModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <View style={[styles.messageContainer, isSent ? styles.sentMessage : styles.receivedMessage]}>
          <View style={[styles.messageBubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
            {/* Show sender name for non-teacher/received messages */}
            {!isSent && <Text style={styles.messageSender}>{item.sender}</Text>}
            <Text style={[styles.messageText, isSent ? styles.sentText : styles.receivedText]}>{item.text}</Text>
            <View style={styles.messageFooter}>
              <Text style={[styles.timestamp, isSent ? styles.sentTimestamp : styles.receivedTimestamp]}>{item.timestamp}</Text>
              {isSent && (
                <Ionicons
                  name={item.status === "read" ? "checkmark-done" : "checkmark"}
                  size={12}
                  color={item.status === "read" ? "#fff" : "#eee"}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.contactInfo}>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{groupName}</Text>
            <Text style={styles.contactNumber}>{isTeacher ? "Teacher (Admin) View" : "Student View"}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {isTeacher && (
             <TouchableOpacity style={styles.actionButton} onPress={handleAddMember}>
                <Ionicons name="person-add" size={24} color="#000" />
             </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} disabled>
            <Ionicons name="videocam" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Marquee - Placeholder */}
      <MarqueeText
         text={`Group Chat: ${groupName} - Only teachers can post new content.`}
         speed={50}
         textStyle={{ color: "#075E54", fontSize: 14, fontWeight: "500" }}
         containerStyle={{ backgroundColor: "#e8f5e8", marginVertical: 4 }}
      />

      {/* Chat Messages */}
      <KeyboardAvoidingView style={styles.messagesContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted // Keeps the input at the bottom
        />
        {/* Input */}
        <View style={styles.inputContainer}>
          {isTeacher && (
            <>
              <TouchableOpacity style={styles.attachButton} onPress={() => setShowAttachments(!showAttachments)}>
                <Ionicons name="add" size={26} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraButton} onPress={handleCamera}>
                <Ionicons name="camera" size={20} color="#000000ff" />
              </TouchableOpacity>
            </>
          )}

          <TextInput
            style={styles.textInput}
            placeholder={isTeacher ? 'Type a message...' : 'Only teachers can send messages'}
            placeholderTextColor="#999"
            value={newMessage}
            onChangeText={setNewMessage}
            editable={isTeacher}
            multiline
          />

          {isTeacher ? (
            newMessage.trim().length > 0 ? (
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleAudio}
              >
                <Ionicons name="mic" size={20} color="#ffffffff" />
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity style={[styles.sendButton, styles.sendButtonDisabled]} disabled>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Message Options Modal */}
      <MessageOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        onReply={() => {
           // Check teacher status for reply to match the sending restriction
           if (!isTeacher) { Alert.alert('Permission Denied', 'Only teachers can reply/send messages.'); return; }
           setNewMessage(`Replying to: ${selectedMessage?.text.substring(0, 30)}...`);
           setOptionsModalVisible(false);
        }}
        onCopy={handleCopyMessage}
        onPin={() => { Alert.alert("Pinned", "Message pinned successfully"); setOptionsModalVisible(false); }}
        onUnpin={() => { Alert.alert("Unpinned", "Message unpinned successfully"); setOptionsModalVisible(false); }}
        onStar={() => { Alert.alert("Starred", "Message starred successfully"); setOptionsModalVisible(false); }}
        onDelete={handleDeleteMessage}
        isPinned={false}
      />

      {/* Attachment Modal (Teacher Only) */}
      {isTeacher && (
        <Modal
          visible={showAttachments}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAttachments(false)}
        >
          <TouchableOpacity style={styles.attachmentOverlay} onPress={() => setShowAttachments(false)}>
            <View style={styles.attachmentContainer}>
              <View style={styles.attachmentHeader}>
                <Text style={styles.attachmentTitle}>Share Content</Text>
              </View>

              <View style={styles.attachmentGrid}>
                {/* Row 1 */}
                <View style={styles.attachmentRow}>
                  <TouchableOpacity style={styles.attachmentItem} onPress={handleOpenGallery}>
                    <View style={[styles.attachmentIcon, { backgroundColor: "#9C27B0" }]}>
                      <Ionicons name="images" size={24} color="#fff" />
                    </View>
                    <Text style={styles.attachmentLabel}>Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.attachmentItem} onPress={handleCamera}>
                    <View style={[styles.attachmentIcon, { backgroundColor: "#FF5722" }]}>
                      <Ionicons name="camera" size={24} color="#fff" />
                    </View>
                    <Text style={styles.attachmentLabel}>Camera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.attachmentItem} onPress={() => { setShowAttachments(false); setLocationVisible(true); }}>
                    <View style={[styles.attachmentIcon, { backgroundColor: "#4CAF50" }]}>
                      <Ionicons name="location" size={24} color="#fff" />
                    </View>
                    <Text style={styles.attachmentLabel}>Location</Text>
                  </TouchableOpacity>
                </View>

                {/* Row 2 */}
                <View style={styles.attachmentRow}>
                  <TouchableOpacity style={styles.attachmentItem} onPress={handleDocument}>
                    <View style={[styles.attachmentIcon, { backgroundColor: "#673AB7" }]}>
                      <Ionicons name="document" size={24} color="#fff" />
                    </View>
                    <Text style={styles.attachmentLabel}>Document</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.attachmentItem} onPress={() => { handleAudio(); setShowAttachments(false); }}>
                    <View style={[styles.attachmentIcon, { backgroundColor: "#FF9800" }]}>
                      <Ionicons name="mic" size={24} color="#fff" />
                    </View>
                    <Text style={styles.attachmentLabel}>Audio</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.attachmentItem} onPress={handlePoll}>
                    <View style={[styles.attachmentIcon, { backgroundColor: "#2196F3" }]}>
                      <MaterialIcons name="poll" size={24} color="#fff" />
                    </View>
                    <Text style={styles.attachmentLabel}>Poll / Quiz</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Location Modal - Placeholder component */}
      <LocationModal
        visible={locationVisible}
        onClose={() => setLocationVisible(false)}
        onSend={handleSendLocation}
      />

      {/* Quiz/Poll Modal - Placeholder component */}
      <QuizPollModal visible={pollModalVisible} onClose={() => setPollModalVisible(false)} />

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
                <Text style={[styles.modalButtonText, { color: '#000' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleConfirmAddMember}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// --- Consolidated Stylesheet ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#eee", backgroundColor: "#fff" },
  backButton: { marginRight: 12 },
  contactInfo: { flex: 1 },
  contactDetails: {},
  contactName: { fontSize: 16, fontWeight: "600", color: "#000" },
  contactNumber: { fontSize: 12, color: "#666" },
  headerActions: { flexDirection: "row" },
  actionButton: { marginLeft: 12 },

  // Message area styles
  messagesContainer: { flex: 1 },
  messagesList: { flex: 1 },
  messagesContent: { padding: 12 },
  messageContainer: { marginVertical: 4 },
  sentMessage: { alignSelf: "flex-end" },
  receivedMessage: { alignSelf: "flex-start" },

  // Message Bubble Styles
  messageBubble: { padding: 12, borderRadius: 16, maxWidth: '80%' },
  sentBubble: { backgroundColor: "#075E54" }, // Teacher/Sent: Dark Green
  receivedBubble: { backgroundColor: "#f3f3f3" }, // Student/Received: Light Gray

  messageText: { fontSize: 14 },
  sentText: { color: "#fff" },
  receivedText: { color: "#000" },

  messageSender: { fontSize: 12, fontWeight: '600', marginBottom: 4, color: '#666' },

  messageFooter: { flexDirection: "row", alignItems: "center", marginTop: 4, justifyContent: 'flex-end' },
  timestamp: { fontSize: 10, marginLeft: 8 },
  sentTimestamp: { color: "#eee" },
  receivedTimestamp: { color: "#666" },

  // Input area styles
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 12, borderTopWidth: 1, borderColor: "#eee", backgroundColor: "#fff" },
  attachButton: { marginRight: 8 },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    padding: 10,
    backgroundColor: "#f3f3f3",
    borderRadius: 20,
    textAlign: "left",
    color: "#000",
    marginHorizontal: 4, // Added margin for better spacing when attachments are hidden
  },
  sendButton: { marginLeft: 8, backgroundColor: "#075E54", padding: 10, borderRadius: 20 },
  sendButtonDisabled: { backgroundColor: "#ccc" },

  // Attachment Modal styles
  attachmentOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  attachmentContainer: {
    backgroundColor: "#fff",
    padding: 20,
    width: '90%', 
    maxHeight: 400, // Used maxHeight instead of fixed flex: 0.5 for better mobile fit
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 20,
  },
  attachmentTitle: { fontSize: 18, fontWeight: "600", textAlign: "center", color: '#000' },
  attachmentHeader: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10
  },
  attachmentGrid: {
    paddingTop: 10,
    gap: 20,
    alignSelf: "center",
    width: '100%'
  },
  attachmentRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: '100%'
  },
  attachmentItem: {
    alignItems: "center",
    width: '30%', // Adjusted for consistent spacing
    paddingVertical: 5
  },
  attachmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  attachmentLabel: {
    fontSize: 12,
    color: "#000000ff",
    textAlign: "center",
    fontWeight: "500",
  },

  // Add Member Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '80%', maxWidth: 300 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 16, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 20, color: '#000' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 0.45, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modalCancelButton: { backgroundColor: '#f0f0f0' },
  modalConfirmButton: { backgroundColor: '#075E54' },
  modalButtonText: { fontSize: 16, fontWeight: '600' },
});

export default GroupChatScreen;