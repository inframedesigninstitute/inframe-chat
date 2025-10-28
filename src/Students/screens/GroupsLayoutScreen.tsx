import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Group {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  memberCount: number;
  isAdmin: boolean;
  avatar: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromUser: boolean;
  senderName?: string;
}

const initialGroups: Group[] = [
  {
    id: '1',
    name: 'bahd 2025-27',
    lastMessage: '+91 83879 60061: Dear Students, This is...',
    timestamp: '3:50 pm',
    unreadCount: 5,
    memberCount: 45,
    isAdmin: true,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '2',
    name: 'Freshers India - 10',
    lastMessage: 'Announcements ▸ HCL (Work From H...',
    timestamp: '9:36 am',
    unreadCount: 1,
    memberCount: 12,
    isAdmin: false,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '3',
    name: 'Study Group CS',
    lastMessage: 'Assignment due tomorrow',
    timestamp: '1:15 pm',
    unreadCount: 0,
    memberCount: 6,
    isAdmin: false,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '4',
    name: 'College Friends',
    lastMessage: 'Hey everyone! How are you all?',
    timestamp: '2:30 pm',
    unreadCount: 3,
    memberCount: 8,
    isAdmin: true,
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '5',
    name: 'infream rf',
    lastMessage: 'Lab decorations in said 🧪🔬',
    timestamp: '6:41 pm',
    unreadCount: 2,
    memberCount: 28,
    isAdmin: false,
    avatar: 'https://via.placeholder.com/40'
  }
];

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Welcome to the group! Please introduce yourselves.',
    timestamp: 'Today',
    isFromUser: false,
    senderName: 'Group Admin'
  },
  {
    id: '2',
    text: 'Hi everyone! I\'m excited to be part of this group.',
    timestamp: 'Jane Cooper 16 minutes ago',
    isFromUser: true
  },
  {
    id: '3',
    text: 'Great to have you here! Looking forward to working together.',
    timestamp: 'John Doe 12 minutes ago',
    isFromUser: false,
    senderName: 'John Doe'
  },
  {
    id: '4',
    text: 'Thanks! I\'m ready to contribute to our projects.',
    timestamp: 'Jane Cooper 8 minutes ago',
    isFromUser: true
  }
];

const GroupsLayoutScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [showProfile, setShowProfile] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setShowProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const filteredGroups = initialGroups.filter(group =>
    group.name.toLowerCase().includes(searchText.toLowerCase()) ||
    group.lastMessage.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Left Sidebar */}
      <View style={styles.leftSidebar}>
        <View style={styles.sidebarIcons}>
          <TouchableOpacity style={styles.sidebarIcon}>
            <Ionicons name="mail" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.activeIcon}>
            <Ionicons name="people" size={24} color="#fff" />
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

      {/* Groups List */}
      <View style={styles.groupsList}>
        <View style={styles.groupsHeader}>
          <Text style={styles.groupsTitle}>Groups</Text>
          <TouchableOpacity>
            <Ionicons name="settings" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search groups"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.groupItem,
                selectedGroup?.id === item.id && styles.selectedGroup
              ]}
              onPress={() => handleGroupSelect(item)}
            >
              <View style={styles.groupAvatar}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {item.isAdmin && <View style={styles.adminBadge} />}
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                <Text style={styles.memberCount}>{item.memberCount} members</Text>
              </View>
              <View style={styles.groupMeta}>
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

      {/* Group Chat Screen */}
      <View style={styles.chatScreen}>
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <Image source={{ uri: selectedGroup.avatar }} style={styles.chatAvatar} />
                <View style={styles.chatUserInfo}>
                  <Text style={styles.chatUserName}>{selectedGroup.name}</Text>
                  <Text style={styles.chatUserStatus}>
                    {selectedGroup.memberCount} members
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
                        item.isFromUser ? styles.userMessage : styles.groupMessage
                      ]}
                    >
                      {!item.isFromUser && item.senderName && (
                        <Text style={styles.senderName}>{item.senderName}</Text>
                      )}
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
                placeholder="Type a message"
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
            <Text style={styles.emptyChatText}>Select a group to start chatting</Text>
          </View>
        )}
      </View>

      {/* Group Info Panel */}
      {showProfile && selectedGroup && (
        <View style={styles.groupInfoPanel}>
          <View style={styles.groupInfoHeader}>
            <TouchableOpacity onPress={() => setShowProfile(false)}>
              <Text style={styles.viewGroupInfoText}>group info</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.groupInfoContent}>
            <Image source={{ uri: selectedGroup.avatar }} style={styles.groupInfoAvatar} />
            <Text style={styles.groupInfoName}>{selectedGroup.name}</Text>
            <Text style={styles.groupInfoMembers}>{selectedGroup.memberCount} members</Text>

            <View style={styles.groupInfoActions}>
              <TouchableOpacity style={styles.groupInfoAction}>
                <Ionicons name="call" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.groupInfoAction}>
                <Ionicons name="videocam" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.groupInfoAction}>
                <Ionicons name="search" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.groupInfoAction}>
                <Ionicons name="notifications" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.groupInfoAction}>
                <Ionicons name="settings" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.groupInfoSearch}>
              <MaterialIcons name="search" size={20} color="#666" />
              <TextInput
                placeholder="Search in group"
                style={styles.groupInfoSearchInput}
              />
            </View>

            <View style={styles.groupInfoSections}>
              <TouchableOpacity style={styles.groupInfoSection}>
                <Text style={styles.groupInfoSectionText}>Media 12</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.groupInfoSection}>
                <Text style={styles.groupInfoSectionText}>Files 8</Text>
                <Ionicons name="chevron-right" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.groupInfoSection}>
                <Text style={styles.groupInfoSectionText}>Links 3</Text>
                <Ionicons name="chevron-right" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.groupInfoSection}>
                <Text style={styles.groupInfoSectionText}>Members {selectedGroup.memberCount}</Text>
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
  groupsList: {
    width: 300,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  groupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  groupsTitle: {
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
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedGroup: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  groupAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  adminBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffd700',
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  memberCount: {
    fontSize: 10,
    color: '#999',
  },
  groupMeta: {
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
  groupMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196f3',
    marginBottom: 4,
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
  groupInfoPanel: {
    width: 350,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  groupInfoHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  viewGroupInfoText: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '500',
  },
  groupInfoContent: {
    padding: 16,
    alignItems: 'center',
  },
  groupInfoAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  groupInfoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  groupInfoMembers: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  groupInfoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  groupInfoAction: {
    padding: 8,
  },
  groupInfoSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  groupInfoSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  groupInfoSections: {
    width: '100%',
  },
  groupInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groupInfoSectionText: {
    fontSize: 14,
    color: '#333',
  },
});

export default GroupsLayoutScreen;