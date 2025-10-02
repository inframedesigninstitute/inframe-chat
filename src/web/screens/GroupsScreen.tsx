import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabsParamList } from '../navigation/types';
import TopBar from '../components/TopBar';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
  { 
    id: '1', 
    name: 'bahd 2025-27', 
    lastMessage: '+91 83879 60061: Dear Students, This i...', 
    time: '3:50 pm', 
    unread: 5,
    members: 45,
    isAdmin: true
  },
  { 
    id: '2', 
    name: 'Freshers India - 10', 
    lastMessage: 'Announcements ▸ HCL (Work From H...', 
    time: '9:36 am', 
    unread: 1,
    members: 12
  },{ 
    id: '3', 
    name: 'MaterialIcons', 
    lastMessage: 'settings-voice', 
    time: '1:15 pm',
    members: 2
  },{ 
    id: '4', 
    name: ' ', 
    lastMessage: 'Assignment due tomorrow', 
    time: '1:15 pm',
    members: 6
  },{ 
    id: '5', 
    name: 'Study Group CS', 
    lastMessage: ' video-settings', 
    time: '1:15 pm',
    members: 6
  },
  { 
    id: '6', 
    name: 'infream rf', 
    lastMessage: 'Lab decorations in said 🧪🔬', 
    time: '6:41 pm',
    members: 28
  },
  { 
    id: '7', 
    name: 'College Friends', 
    lastMessage: 'Hey everyone! How are you all?', 
    time: '2:30 pm',
    members: 8
  },
  { 
    id: '8', 
    name: 'Group CS', 
    lastMessage: 'Assignment due tomorrow', 
    time: '1:15 pm',
    members: 6
  },
];

const GroupsScreen = () => {
  const navigation = useNavigation<GroupsNavigationProp>();
  const [groups] = useState(initialGroups);
  const [searchText, setSearchText] = useState('');

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddGroup = () => {
    console.log('Navigate to Create Group Screen');
  };

  const handleOpenCamera = () => {
    console.log('Open Camera');
  };

  return (
    <View style={styles.container}>
      {/* TopBar */}
      <TopBar onAddGroup={handleAddGroup} onOpenCamera={handleOpenCamera} />

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
            style={styles.groupItem}
            onPress={() =>
              navigation.navigate('Chat', { channelId: item.id, channelName: item.name })
            }
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
      
      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.smallFab}>
          <Ionicons name="people" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainFab}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GroupsScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' ,
    
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
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  groupItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
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
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  groupName: { 
    fontSize: 16, 
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: { 
    fontSize: 14, 
    color: '#666',
    marginTop: 2,
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  time: { 
    fontSize: 12, 
    color: '#666',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#25D366',
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
    fontWeight: 'bold',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    alignItems: 'center',
  },
  smallFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8E24AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  mainFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

