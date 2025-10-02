import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ImageLibraryOptions, launchImageLibrary, MediaType } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';
 
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

interface Customer {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

interface UserProfile {
  name: string;
  email: string;
  ipAddress: string;
  location: string;
  browser: string;
  resolution: string;
  currentPage: string;
  chatStatus: string;
  operator: string;
  department: string;
  pageHistory: string;
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
      text: 'Hi!JNVH',
      isSent: true,
      timestamp: '10:10',
      status: 'read'
    },
    {
      id: '3',
      text: 'No prob! I\'ll be there in about 15 minutes.',
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
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('1');
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  // Sample customers data
  const [customers] = useState<Customer[]>([
    {
      id: '1',
      name: 'naru',
      lastMessage: 'Hey, how are you',
      timestamp: '12:46 AM',
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: '2', 
      name: 'iiivds',
      lastMessage: 'Thanks for the help!',
      timestamp: '11:30 AM',
      unreadCount: 5,
      isOnline: false,
    },
    {
      id: '3',
      name: '123456',
      lastMessage: 'Sure, we have mobile apps for both iPhone and Android devices.',
      timestamp: '1:31 PM',
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: '4',
      name: 'vjkngljkndfglnkxf',
      lastMessage: 'I need some assistance',
      timestamp: '2:15 PM', 
      unreadCount: 8,
      isOnline: true,
    }
  ]);

  // Sample user profile data
  const [userProfile] = useState<UserProfile>({
    name: 'VIKRAM cHOUDHARY',
    email: 'bgngfkj@.com',
    ipAddress: '12345',
    location: 'Unavailable',
    browser: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:38.0) Gecko/20100101 Firefox/38.0',
    resolution: '1440 x 900',
    currentPage: 'https://www.chatstack.com/features',
    chatStatus: 'Chatting',
    operator: 'John Doe',
    department: 'Sales',
    pageHistory: '/; /features'
  });

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

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity 
      style={[
        styles.customerItem,
        selectedCustomerId === item.id && styles.selectedCustomerItem
      ]}
      onPress={() => setSelectedCustomerId(item.id)}
    >
      <View style={styles.customerAvatar}>
        <Text style={styles.customerAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.customerInfo}>
        <View style={styles.customerHeader}>
          <Text style={styles.customerName}>{item.name}</Text>
          <Text style={styles.customerTime}>{item.timestamp}</Text>
        </View>
        <Text style={styles.customerLastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainLayout}>
        {/* Left Sidebar - Customer List */}
        <View style={styles.leftSidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Students</Text>
             <TouchableOpacity style={styles.navIcons}>
              <Ionicons name="settings" size={20} color="#160909ff" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={customers}
            keyExtractor={(item) => item.id}
            renderItem={renderCustomerItem}
            style={styles.customersList}
            showsVerticalScrollIndicator={false}
          />

        

          {/* Navigation Icons */}
          <View style={styles.navigationIcons}>
            <TouchableOpacity style={styles.navIcon}>
              <Ionicons name="chatbubbles-sharp" size={20} color="#000000ff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navIcon}>
              <Ionicons name="people-sharp" size={20} color="#000000ff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navIcon}>
              <Ionicons name="call" size={20} color="#000000ff" />
            </TouchableOpacity>
              <TouchableOpacity style={styles.navIcon}>
              <Ionicons name="settings" size={20} color="#000000ff" />
            </TouchableOpacity>
          </View>

          {/* User Profile at Bottom */}
          <View style={styles.userProfile}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>ND</Text>
              <View style={styles.onlineIndicator} />
            </View>
            <Text style={styles.userName}>Vikram</Text>
            <Text style={styles.userStatus}>Online</Text>
          </View>
        </View>

        {/* Center - Chat Area */}
        <View style={styles.centerArea}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity 
              style={styles.contactInfo}
              onPress={() => setShowUserProfile(true)}
            >
              <Text style={styles.contactName}>
                {selectedCustomer?.name || 'Select a customer'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <View style={styles.messagesContainer}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              inverted
            />

            {/* Input Bar */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor="#666"
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
              />
              
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={handleSendMessage}
              >
                <Text style={styles.sendButtonText}>SEND AS INTERNAL MESSAGE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Right Panel - User Profile */}
        {showUserProfile && (
          <View style={styles.rightPanel}>
            <View style={styles.rightPanelHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowUserProfile(false)}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileSection}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {userProfile.name.charAt(0)}
                </Text>
              </View>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              
              <TouchableOpacity style={styles.initiateChatButton}>
                <Text style={styles.initiateChatText}>Student</Text>
              </TouchableOpacity>

              
             
            </View>

            <ScrollView style={styles.profileDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="mail" size={16} color="#000000ff" />
                <Text style={styles.detailLabel}>BIO</Text>
                <Text style={styles.detailValue}>{userProfile.email}</Text>
              </View>

           
            

              <View style={styles.detailItem}>
                <Ionicons name="desktop" size={16} color="#000000ff" />
                <Text style={styles.detailLabel}>Father_Name</Text>
                <Text style={styles.detailValue}>{userProfile.browser}</Text>
              </View>

             
              <View style={styles.detailItem}>
                <Ionicons name="person" size={16} color="#050505ff" />
                <Text style={styles.detailLabel}>OPERATOR</Text>
                <Text style={styles.detailValue}>{userProfile.operator}</Text>
              </View>

            
           
            </ScrollView>

            {/* Delete Button */}
            <TouchableOpacity style={styles.deleteButton}>
              <Ionicons name="trash" size={16} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete Customer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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
              <View style={styles.attachmentRow}>
                <TouchableOpacity style={styles.attachmentItem} onPress={handleGallery}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#9C27B0' }]}>
                    <Ionicons name="images" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.attachmentItem} onPress={handleCamera}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#FF5722' }]}>
                    <Ionicons name="camera" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.attachmentItem} onPress={handleLocation}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="location" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Location</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.attachmentRow}>
                <TouchableOpacity style={styles.attachmentItem} onPress={handleDocument}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#673AB7' }]}>
                    <Ionicons name="Document" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Document</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.attachmentItem} onPress={handleAudio}>
                  <View style={[styles.attachmentIcon, { backgroundColor: '#FF9800' }]}>
                    <Ionicons name="mic" size={24} color="#fff" />
                  </View>
                  <Text style={styles.attachmentLabel}>Audio</Text>
                </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  
  // Left Sidebar Styles
  leftSidebar: {
    width: 300,
    backgroundColor: '#ffffffff',
    borderRightWidth: 1,
    borderRightColor: '#000000ff',
  },
  sidebarHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#000000ff',
  },
  sidebarTitle: {
    color: '#000000ff',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 1,
  },
  sidebarSubtitle: {
    color: '#000000ff',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  customersList: {
    flex: 1,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000000ff',
    color:"#000"
  },
  selectedCustomerItem: {
    backgroundColor: '#c9c9c9ff',
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8f9196ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  customerAvatarText: {
    color: '#ffffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: '#2c3e50',
  },
  customerInfo: {
    flex: 1,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    color: '#000000ff',
    fontSize: 14,
    fontWeight: '600',
  },
  customerTime: {
    color: '#000000ff',
    fontSize: 11,
  },
  customerLastMessage: {
    color: '#000000ff',
    fontSize: 12,
  },
  unreadBadge: {
    backgroundColor: '#a39795ff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#000000ff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#292222ff',
  },
  navigationIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#ffffffff',
  },
  navIcon: {
    padding: 8,
  },
  navIcons:{
    marginLeft:250,
    marginTop:-25
  },
  userProfile: {
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#34495e',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    color: '#000000ff',
    fontSize: 14,
    fontWeight: '600',
  },
  userStatus: {
    color: '#384b40ff',
    fontSize: 12,
  },

  // Center Area Styles
  centerArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
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
    maxWidth: '70%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sentBubble: {
    backgroundColor: '#ecf1f1ff',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#ecf0f1',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  sentText: {
    color: '#000000ff',
  },
  receivedText: {
    color: '#2c3e50',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  sentTimestamp: {
    color: '#000000ff',
    opacity: 0.7,
  },
  receivedTimestamp: {
    color: '#000000ff',
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 12,
    color: '#000000ff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    backgroundColor: '#dfd9d9ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#000000ff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Right Panel Styles
  rightPanel: {
    width: 300,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  rightPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0d8d8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    color: '#000000ff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  initiateChatButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  initiateChatText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileDetails: {
    flex: 1,
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000ff',
    letterSpacing: 0.5,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 15,
    color: '#2c3e50',
    flex: 1,
    lineHeight: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#030202ff',
    margin: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Modal Styles
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