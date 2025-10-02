import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { MediaType, ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker';
import MarqueeText from '../components/MarqueeText';
 
const { width } = Dimensions.get('window');

// ❌ REMOVED: const [messages, setMessages] = useState<Message[]>([]);
// ❌ REMOVED: const [showAttachments, setShowAttachments] = useState(false); 
// Hooks must be called inside the functional component.

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Message {
  id: string;
  text: string;
  isSent: boolean;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { channelId, channelName } = route.params || {};
  
  // Provide fallback values if params are undefined
  const safeChannelName = channelName || 'Unknown Contact';
  const safeChannelId = channelId || 'default';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'This is your delivery driver from Speedy Chow. I\'m just around the corner from your place. 😊',
      isSent: false,
      timestamp: '10:10',
      status: 'read'
    },
    {
      id: '2',
      text: 'Hi!',
      isSent: true,
      timestamp: '10:10',
      status: 'read'
    },
    {
      id: '3',
      text: 'No problem at all! I\'ll be there in about 15 minutes.',
      isSent: false,
      timestamp: '10:11',
      status: 'read'
    },
    {
      id: '4',
      text: 'Awesome, thanks for letting me know! Can\'t wait for my delivery. 🎉',
      isSent: true,
      timestamp: '10:11',
      status: 'read'
    },
    {
      id: '5',
      text: 'I\'ll text you when I arrive.',
      isSent: false,
      timestamp: '10:11',
      status: 'read'
    },
    {
      id: '6',
      text: 'Great! 😊',
      isSent: true,
      timestamp: '10:12',
      status: 'read'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [showAttachments, setShowAttachments] = useState(false); // ✅ Correctly placed state

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        isSent: true,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        status: 'sent'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleCall = () => {
    navigation.navigate('AudioCall', { 
      contactName: safeChannelName,
      contactNumber: safeChannelId 
    });
  };

  const handleVideoCall = () => {
    navigation.navigate('VideoCall', { 
      contactName: safeChannelName,
      contactNumber: safeChannelId 
    });
  };

  const handleOpenCamera = () => {
    navigation.navigate('Camera');
  };

  // Attachment handlers
  const handleGallery = () => {
    setShowAttachments(false);

    const options: ImageLibraryOptions = {
        mediaType: 'photo' as MediaType,
        quality: 1,
    };

    launchImageLibrary(options, (response) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
            const selectedImage = response.assets[0].uri;
            console.log('Selected Image URI:', selectedImage);

            const message: Message = {
                id: Date.now().toString(),
                text: `🖼 Image shared`,
                isSent: true,
                timestamp: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                }),
                status: 'sent',
            };

            // Add image URI to message if needed
            setMessages(prevMessages => [...prevMessages, message]);
        }
    });
  };

  const handleCamera = () => {
    setShowAttachments(false);
    navigation.navigate('Camera');
  };

  const handleLocation = () => {
    setShowAttachments(false);
    Alert.alert('Location', 'Share current location?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Share', 
        onPress: () => {
          const message: Message = {
            id: Date.now().toString(),
            text: '📍 Location shared: Current Location',
            isSent: true,
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            status: 'sent'
          };
          setMessages([...messages, message]);
        }
      },
    ]);
  };

  const handleContact = () => {
    setShowAttachments(false);
    Alert.alert('Contact', 'Share contact information?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Share', 
        onPress: () => {
          const message: Message = {
            id: Date.now().toString(),
            text: '👤 Contact: John Doe\n📞 +91 98765 43210',
            isSent: true,
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            status: 'sent'
          };
          setMessages([...messages, message]);
        }
      },
    ]);
  };

  const handleDocument = () => {
    setShowAttachments(false);
    Alert.alert('Document', 'Document picker will be implemented later', [
      { text: 'OK', onPress: () => sendDocumentMessage('📄 Document shared') },
    ]);
  };

  const sendDocumentMessage = (documentName: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text: documentName,
      isSent: true,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      status: 'sent'
    };
    setMessages([...messages, message]);
  };

  const handleAudio = () => {
    setShowAttachments(false);
    Alert.alert('Audio', 'Record voice message?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Record', 
        onPress: () => {
          const message: Message = {
            id: Date.now().toString(),
            text: '🎵 Voice message (0:15)',
            isSent: true,
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            status: 'sent'
          };
          setMessages([...messages, message]);
        }
      },
    ]);
  };

  const handlePoll = () => {
    setShowAttachments(false);
    Alert.alert('Poll', 'Create a poll?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Create', 
        onPress: () => {
          const message: Message = {
            id: Date.now().toString(),
            text: '📊 Poll: What\'s your favorite subject?\n• Math (0 votes)\n• Science (0 votes)\n• English (0 votes)',
            isSent: true,
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            status: 'sent'
          };
          setMessages([...messages, message]);
        }
      },
    ]);
  };

  const handleEvent = () => {
    setShowAttachments(false);
    Alert.alert('Event', 'Create an event?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Create', 
        onPress: () => {
          const message: Message = {
            id: Date.now().toString(),
            text: '📅 Event: Class Meeting\n📍 Location: Room 101\n🕐 Time: Tomorrow 2:00 PM',
            isSent: true,
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            status: 'sent'
          };
          setMessages([...messages, message]);
        }
      },
    ]);
  };

  const handleAIImages = () => {
    setShowAttachments(false);
    Alert.alert('AI Images', 'Generate AI image?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Generate', 
        onPress: () => {
          const message: Message = {
            id: Date.now().toString(),
            text: '🤖 AI Generated Image: "Beautiful sunset landscape"',
            isSent: true,
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            status: 'sent'
          };
          setMessages([...messages, message]);
        }
      },
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isSent ? styles.sentMessage : styles.receivedMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isSent ? styles.sentBubble : styles.receivedBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isSent ? styles.sentText : styles.receivedText
        ]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            item.isSent ? styles.sentTimestamp : styles.receivedTimestamp
          ]}>
            {item.timestamp}
          </Text>
          {item.isSent && (
            <Ionicons 
              name={item.status === 'read' ? 'checkmark-done' : 'checkmark'} 
              size={12} 
              color={item.status === 'read' ? '#4CAF50' : '#666'} 
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.contactInfo} 
          onPress={() => navigation.navigate('Profile' as never)} // Added 'as never' for safety since RootStackParamList wasn't provided
        >
          {/* ❌ REMOVED: import Ionicons from 'react-native-vector-icons/Ionicons'; - Cannot import inside JSX */}

          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{safeChannelName}</Text>
            <Text style={styles.contactNumber}>(+91)8824536973 </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleVideoCall}>
            <Ionicons name="videocam" size={24} color="#040505ff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color="#080a0aff" />
          </TouchableOpacity>
          
        </View>
      </View>

      {/* Marquee Text */}
      <MarqueeText 
        text={`Chatting with ${safeChannelName} - Send messages, share files, and stay connected!`}
        speed={50}
        textStyle={{ color: '#2e7d32', fontSize: 14, fontWeight: '500' }}
        containerStyle={{ backgroundColor: '#e8f5e8', marginVertical: 4 }}
      />

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted // To show latest messages at the bottom
        />

        {/* Input Bar (Structure simplified to remove extra nested View) */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton} 
            onPress={() => setShowAttachments(!showAttachments)}
          >
            <Ionicons name="add" size={24} color="#080808ff" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#666" // Added for better visibility
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />

          <TouchableOpacity style={styles.cameraButton} onPress={handleOpenCamera}>
            <Ionicons name="camera" size={20} color="#000000ff" />
          </TouchableOpacity>
          
          {/* Conditional Send/Mic Button */}
          {newMessage.trim().length > 0 ? (
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={handleSendMessage}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={handleAudio}  // yaha apka voice recording function
            >
              <Ionicons name="mic" size={20} color="#ffffffff" />
            </TouchableOpacity>
          )}

        </View>
      </KeyboardAvoidingView>

      {/* Attachment Options Modal */}
      <Modal
        visible={showAttachments}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachments(false)}
      >
        <TouchableOpacity
          style={styles.attachmentOverlay}
          onPress={() => setShowAttachments(false)}
        >
          <View style={styles.attachmentContainer}>
            <View style={styles.attachmentHeader}>
              <Text style={styles.attachmentTitle}>Share Content</Text>
            </View>

            <View style={styles.attachmentGrid}>
              {/* Row 1 */}
              <View style={styles.attachmentRow}>
                {/* Gallery */}
                <TouchableOpacity style={styles.attachmentItem} onPress={handleGallery}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#9C27B0' }]}>
                    <Ionicons name="images" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Gallery</Text>
                </TouchableOpacity>

                {/* Camera */}
                <TouchableOpacity style={styles.attachmentItem} onPress={handleCamera}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#FF5722' }]}>
                    <Ionicons name="camera" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Camera</Text>
                </TouchableOpacity>

                {/* Location */}
                <TouchableOpacity style={styles.attachmentItem} onPress={handleLocation}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="location" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Location</Text>
                </TouchableOpacity>

                {/* Contact */}
                {/* <TouchableOpacity style={styles.attachmentItem} onPress={handleContact}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#2196F3' }]}>
                    <Ionicons name="person" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Contact</Text>
                </TouchableOpacity> */}
              </View>

              {/* Row 2 */}
              <View style={styles.attachmentRow}>
                {/* Document */}
                <TouchableOpacity style={styles.attachmentItem} onPress={handleDocument}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#673AB7' }]}>
                    <Ionicons name="document" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Document</Text>
                </TouchableOpacity>

                {/* Audio */}
                <TouchableOpacity style={styles.attachmentItem} onPress={handleAudio}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#FF9800' }]}>
                    <Ionicons name="mic" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Audio</Text>
                </TouchableOpacity>

                {/* Optional Poll - Restored placeholders */}
                {/* <TouchableOpacity style={styles.attachmentItem} onPress={handlePoll}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#607D8B' }]}>
                    <MaterialIcons name="poll" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Poll</Text>
                </TouchableOpacity> */}

                {/* Optional Event - Restored placeholders */}
                {/* <TouchableOpacity style={styles.attachmentItem} onPress={handleEvent}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#0e0907ff' }]}>
                    <Ionicons name="calendar" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Event</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginBottom:35,
    marginTop:35
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#050507ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft:-10
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  contactNumber: {
    fontSize: 12,
    color: '#524f4fff',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 15,
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sentBubble: {
    backgroundColor: '#f3ebebff',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#f3ebebff',
    borderBottomLeftRadius: 4,
    borderColor:'#6b5e5eff'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentText: {
    color: '#020202ff',
  },
  receivedText: {
    color: '#000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  sentTimestamp: {
    color: '#040704ff',
  },
  receivedTimestamp: {
    color: '#0e0d0dff',
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
    // ⚠️ Corrected 'bottom' style: It was causing UI issues by pushing the bar down.
    // If you need spacing, adjust padding/margin of the parent view.
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5ededff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    color:'#fff'
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
    color:"#000000ff"
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // Added margin for spacing with send/mic button
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0d0c0eff',
    justifyContent: 'center',
    alignItems: 'center',
    // ⚠️ Corrected 'top' style: This was causing the button to overlap the input area.
    // Adjusted positioning by removing 'top: 20'
  },
  attachmentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  attachmentHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attachmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  attachmentGrid: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  attachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  attachmentItem: {
    alignItems: 'center',
    width: (width - 100) / 4,
  },
  attachmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  attachmentLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ChatScreen;