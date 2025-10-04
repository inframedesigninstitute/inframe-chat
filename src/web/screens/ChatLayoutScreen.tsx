import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Contact {
  id: string;
  name: string;
  lastSeen: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  avatar: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
  senderName?: string;
}

const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'Mohammad Ali',
    lastSeen: 'Last seen 24 minutes ago',
    lastMessage: 'I\'m sorry to hear that you\'re experiencing slow internet...',
    timestamp: '10:41 pm',
    unreadCount: 35,
    isOnline: true,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '2',
    name: 'Ronald Richards',
    lastSeen: 'Online',
    lastMessage: 'That\'s frustrating, but I appreciate your quick response...',
    timestamp: '07:40 am',
    unreadCount: 3,
    isOnline: true,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '3',
    name: 'Wade Warren',
    lastSeen: 'Last seen 2 hours ago',
    lastMessage: 'Here is my attachment',
    timestamp: 'Yesterday',
    unreadCount: 4,
    isOnline: false,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '4',
    name: 'Jane Cooper',
    lastSeen: 'Last seen 1 hour ago',
    lastMessage: 'Thanks for the update',
    timestamp: 'Yesterday',
    unreadCount: 2,
    isOnline: false,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '5',
    name: 'Robert Fox',
    lastSeen: 'Last seen 30 minutes ago',
    lastMessage: 'I\'ll get back to you soon',
    timestamp: 'Yesterday',
    unreadCount: 1,
    isOnline: true,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '6',
    name: 'Brooklyn Simmons',
    lastSeen: 'Last seen 1 day ago',
    lastMessage: 'Perfect, thank you!',
    timestamp: '2 days ago',
    unreadCount: 5,
    isOnline: false,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '7',
    name: 'Leslie Alexander',
    lastSeen: 'Last seen 3 hours ago',
    lastMessage: 'See you tomorrow',
    timestamp: '3 days ago',
    unreadCount: 0,
    isOnline: false,
    avatar: 'https://via.placeholder.com/40'
  }
];

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'I\'m sorry to hear that you\'re experiencing slow internet connection. This can be really frustrating when you\'re trying to get work done.',
    timestamp: 'Today',
    isFromUser: false,
    senderName: 'Mohammad Ali'
  },
  {
    id: '2',
    text: 'That\'s frustrating, but I appreciate your quick response. Is there anything I can do to help troubleshoot this issue?',
    timestamp: 'Jane Cooper 16 minutes ago',
    isFromUser: true
  },
  {
    id: '3',
    text: 'Here is my attachment',
    timestamp: 'Ronald Richards 12 minutes ago',
    isFromUser: false,
    senderName: 'Ronald Richards'
  },
  {
    id: '4',
    text: 'Thank you for sharing this. I\'ll review it and get back to you with my thoughts.',
    timestamp: 'Jane Cooper 8 minutes ago',
    isFromUser: true
  }
];

const ChatLayoutScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [showProfile, setShowProfile] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setShowProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const filteredContacts = initialContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
    contact.lastMessage.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Left Sidebar */}
      <View style={styles.leftSidebar}>
        <View style={styles.sidebarIcons}>
          <TouchableOpacity style={styles.activeIcon}>
            <Ionicons name="mail" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarIcon}>
            <Ionicons name="person" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarIcon}>
            <Ionicons name="cash" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarIcon}>
            <Ionicons name="list" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarIcon}>
            <Ionicons name="flash" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarIcon}>
            <Ionicons name="time" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Channel List */}
      <View style={styles.channelList}>
        <View style={styles.channelHeader}>
          <Text style={styles.channelTitle}>Inbox</Text>
          <TouchableOpacity>
            <Ionicons name="settings" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search user or messages"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.contactItem,
                selectedContact?.id === item.id && styles.selectedContact
              ]}
              onPress={() => handleContactSelect(item)}
            >
              <View style={styles.contactAvatar}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {item.isOnline && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.lastSeen}>{item.lastSeen}</Text>
              </View>
              <View style={styles.contactMeta}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Chat Screen */}
      <View style={styles.chatScreen}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <Image source={{ uri: selectedContact.avatar }} style={styles.chatAvatar} />
                <View style={styles.chatUserInfo}>
                  <Text style={styles.chatUserName}>{selectedContact.name}</Text>
                  <Text style={styles.chatUserStatus}>
                    {selectedContact.isOnline ? 'Online' : selectedContact.lastSeen}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleProfileClick}>
                <Ionicons name="ellipsis-vertical" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <View style={styles.messagesContainer}>
              <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.messageContainer}>
                    {item.timestamp && (
                      <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        item.isFromUser ? styles.userMessage : styles.contactMessage
                      ]}
                    >
                      <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                  </View>
                )}
              />
            </View>

            {/* Chat Input */}
            <View style={styles.chatInput}>
              <Image source={{ uri: 'https://via.placeholder.com/30' }} style={styles.inputAvatar} />
              <TextInput
                placeholder="If you can't find this helpful"
                style={styles.messageInput}
              />
              <TouchableOpacity style={styles.inputButton}>
                <Ionicons name="happy" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputButton}>
                <Ionicons name="mic" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputButton}>
                <Ionicons name="camera" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputButton}>
                <Ionicons name="attach" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendButton}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>Select a conversation to start chatting</Text>
          </View>
        )}
      </View>

      {/* Profile Panel */}
      {showProfile && selectedContact && (
        <View style={styles.profilePanel}>
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={() => setShowProfile(false)}>
              <Text style={styles.viewProfileText}>view profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileContent}>
            <Image source={{ uri: selectedContact.avatar }} style={styles.profileAvatar} />
            <Text style={styles.profileName}>{selectedContact.name}</Text>
            <Text style={styles.profileLocation}>California, USA</Text>
            <Text style={styles.profilePhone}>(888) 456 789</Text>

            <View style={styles.profileActions}>
              <TouchableOpacity style={styles.profileAction}>
                <Ionicons name="mail" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileAction}>
                <Ionicons name="call" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileAction}>
                <Ionicons name="videocam" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileAction}>
                <Ionicons name="calendar" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileAction}>
                <Ionicons name="information-circle" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileSearch}>
              <MaterialIcons name="search" size={20} color="#666" />
              <TextInput
                placeholder="Search in conversation"
                style={styles.profileSearchInput}
              />
            </View>

            <View style={styles.profileSections}>
              <TouchableOpacity style={styles.profileSection}>
                <Text style={styles.profileSectionText}>Attachments 3</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileSection}>
                <Text style={styles.profileSectionText}>Notes 4</Text>
                <Ionicons name="chevron-right" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileSection}>
                <Text style={styles.profileSectionText}>Task 14</Text>
                <Ionicons name="chevron-right" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileSection}>
                <Text style={styles.profileSectionText}>Meetings 8</Text>
                <Ionicons name="chevron-right" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileSection}>
                <Text style={styles.profileSectionText}>Deals 2</Text>
                <Ionicons name="chevron-right" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  leftSidebar: {
    width: 60,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    paddingTop: 20,
  },
  sidebarIcons: {
    flex: 1,
    alignItems: 'center',
  },
  activeIcon: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  sidebarIcon: {
    padding: 12,
    marginBottom: 16,
  },
  channelList: {
    width: 300,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  channelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedContact: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  contactAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  lastSeen: {
    fontSize: 12,
    color: '#666',
  },
  contactMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#2196f3',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chatScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatUserInfo: {
    flex: 1,
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatUserStatus: {
    fontSize: 12,
    color: '#4caf50',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageTimestamp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#2196f3',
    alignSelf: 'flex-end',
  },
  contactMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  inputAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 12,
  },
  messageInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  inputButton: {
    padding: 8,
    marginRight: 4,
  },
  sendButton: {
    backgroundColor: '#2196f3',
    borderRadius: 20,
    padding: 8,
    marginLeft: 4,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChatText: {
    fontSize: 16,
    color: '#666',
  },
  profilePanel: {
    width: 350,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  profileHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  viewProfileText: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '500',
  },
  profileContent: {
    padding: 16,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  profileLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  profileAction: {
    padding: 8,
  },
  profileSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  profileSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  profileSections: {
    width: '100%',
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileSectionText: {
    fontSize: 14,
    color: '#333',
  },
});

export default ChatLayoutScreen;