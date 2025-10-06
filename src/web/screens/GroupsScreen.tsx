import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MainLayout from '../components/MainLayout';
import WebBackButton from '../components/WebBackButton';
import { MainTabsParamList, RootStackParamList } from '../navigation/types';

type GroupsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Groups'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Group = { 
  id: string; 
  name: string; 
  lastMessage: string; 
  time: string; 
  unread?: number;
  members: number;
  isAdmin?: boolean;
};

const initialGroups: Group[] = [
  { id: '1', name: 'bahd 2025-27', lastMessage: '+91 83879 60061: Dear Students, This i...', time: '3:50 pm', unread: 5, members: 45, isAdmin: true },
  { id: '2', name: 'Freshers India - 10', lastMessage: 'Announcements ▸ HCL (Work From H...', time: '9:36 am', unread: 1, members: 12 },
  { id: '3', name: 'MaterialIcons', lastMessage: 'settings-voice', time: '1:15 pm', members: 2 },
  { id: '4', name: 'Study Group CS', lastMessage: 'video-settings', time: '1:15 pm', members: 6 },
  { id: '5', name: 'infream rf', lastMessage: 'Lab decorations in said 🧪🔬', time: '6:41 pm', members: 28 },
  { id: '6', name: 'College Friends', lastMessage: 'Hey everyone! How are you all?', time: '2:30 pm', members: 8 },
];

const GroupsScreen = () => {
  const [groups] = useState(initialGroups);
  const [searchText, setSearchText] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleGroupPress = (group: Group) => {
    setSelectedGroup(group);
  };

  return (
    <MainLayout activeTab="Groups">
      <View style={styles.container}>
        <View style={styles.rootRow}>
       
          <View style={styles.listColumn}>
            <View style={styles.header}>
              <WebBackButton />
              <Text style={styles.headerTitle}>Groups</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                placeholder="Search groups"
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
              />
            </View>

            {/* Groups List */}
            <FlatList
              data={filteredGroups}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.groupItem,
                    selectedGroup?.id === item.id && styles.selectedItem,
                  ]}
                  onPress={() => handleGroupPress(item)}
                >
                  <View style={styles.row}>
                    <View style={styles.avatarContainer}>
                      <View style={styles.groupAvatar}>
                        <Ionicons name="people" size={24} color="#fff" />
                      </View>
                      {item.isAdmin && (
                        <View style={styles.adminBadge}>
                          <MaterialIcons name="star" size={12} color="#fff" />
                        </View>
                      )}
                    </View>
                    <View style={styles.groupInfo}>
                      <View style={styles.groupHeader}>
                        <Text style={styles.groupName}>{item.name}</Text>
                        <View style={styles.rightSection}>
                          <Text style={styles.time}>{item.time}</Text>
                          {item.unread ? (
                            <View style={styles.unreadBadge}>
                              <Text style={styles.unreadText}>{item.unread}</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                      <Text style={styles.memberCount}>{item.members} members</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* RIGHT COLUMN — Group Chat */}
          <View style={styles.chatColumn}>
            {selectedGroup ? (
              <View style={styles.chatView}>
                <View style={styles.chatHeaderContainer}>
                  <View style={styles.chatAvatar}>
                    <Ionicons name="people" size={24} color="#fff" />
                  </View>
                  <Text style={styles.chatHeader}>Group Chat: {selectedGroup.name}</Text>
                </View>
                <View style={styles.chatBody}>
                  <Text style={styles.chatPlaceholder}>Last message: {selectedGroup.lastMessage}</Text>
                  <Text style={styles.chatPlaceholder}>{selectedGroup.members} members</Text>
                  <Text style={styles.chatPlaceholder}>Chat messages will appear here.</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyChat}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/893/893292.png' }}
                  style={styles.placeholderImage}
                />
                <Text style={styles.emptyChatText}>
                  Select a group to start chatting
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </MainLayout>
  );
};

export default GroupsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  rootRow: { flex: 1, flexDirection: 'row' },
  listColumn: {
    width: 600,
    maxWidth: 450,
    minWidth: 260,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  chatColumn: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#075E54',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, color: '#000' },
  groupItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  selectedItem: {
    backgroundColor: '#e7f4e8',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { marginRight: 12, position: 'relative' },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: { flex: 1 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  groupName: { fontSize: 16, fontWeight: '500', color: '#000', flex: 1 },
  rightSection: { flexDirection: 'row', alignItems: 'center' },
  lastMessage: { fontSize: 14, color: '#666', marginTop: 2 },
  memberCount: { fontSize: 12, color: '#999', marginTop: 2 },
  time: { fontSize: 12, color: '#666', marginRight: 8 },
  unreadBadge: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderImage: { width: 120, height: 120, opacity: 0.5, marginBottom: 10 },
  emptyChatText: { fontSize: 14, color: '#777' },
  chatView: { flex: 1 },
  chatHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#075E54',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  chatHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  chatBody: { flex: 1, padding: 16 },
  chatPlaceholder: { fontSize: 14, color: '#444', marginBottom: 8 },
});
