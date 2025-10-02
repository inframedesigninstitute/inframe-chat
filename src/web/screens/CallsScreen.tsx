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

type CallsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Calls'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Call = { 
  id: string; 
  name: string; 
  time: string; 
  type: 'incoming' | 'outgoing';
  callType: 'voice' | 'video';
  duration?: string;
};

const initialCalls: Call[] = [
  { 
    id: '1', 
    name: 'Bhavesh', 
    time: '13 March, 11:45 am',
    type: 'outgoing',
    callType: 'video',
    duration: '5:32'
  },
  { 
    id: '2', 
    name: 'Pravin Kumar My Hostel Jodhpur', 
    time: '02 jun, 10:49 am',
    type: 'outgoing',
    callType: 'voice',
    duration: '6:33'
  }, { 
    id: '9', 
    name: 'Space ', 
    time: '17 feb, 4:39 am',
    type: 'outgoing',
    callType: 'voice',
    duration: '6:33'
  },
  { 
    id: '9', 
    name: 'gorav', 
    time: '1 sec, 12:23 pm',
    type: 'incoming',
    callType: 'voice',
    duration: '6:33'
  }, { 
    id: '9', 
    name: 'asif', 
    time: '10 March, 09:45 am',
    type: 'outgoing',
    callType: 'voice',
    duration: '6:33'
  }, { 
    id: '9', 
    name: 'naru', 
    time: '16 jan, 1:23 pm',
    type: 'outgoing',
    callType: 'voice',
    duration: '6:33'
  }, { 
    id: '9', 
    name: 'Pravin',
    time: '10 March, 10 am',
    type: 'outgoing',
    callType: 'voice',
    duration: '6:33'
  }, { 
    id: '9', 
    name: 'suresh', 
    time: '10 March, 10 am',
    type: 'outgoing',
    callType: 'voice',
    duration: '6:33'
  }, { 
    id: '9', 
    name: 'vishal',
    time: '12 jan, 2:34 am',
    type: 'outgoing',
    callType: 'voice',
    duration: '6:33'
  }, { 
    id: '9', 
    name: 'sinil bro ',
    time: '10 dec, 10 am',
    type: 'outgoing',
    callType: 'voice',
    duration: '6:33'
  }, { 
    id: '9', 
    name: 'mahender kumar ', 
    time: '10 March, 10 am',
    type: 'outgoing',
    callType: 'voice',
    duration: '6:33'
  },
  { 
    id: '9', 
    name: 'interview date ', 
    time: '10 March, 10 am',
    type: 'outgoing',
    callType: 'voice',
    duration: '6:33',
  }, { 
    id: '9', 
    name: 'dipak', 
    time: '20',
    type: 'outgoing',
    callType: 'voice',
    duration: '6:33'
  },

];

const CallsScreen = () => {
  const navigation = useNavigation<CallsNavigationProp>();
  const [calls] = useState(initialCalls);
  const [searchText, setSearchText] = useState('');

  const filteredCalls = calls.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddGroup = () => {
    console.log('Navigate to Create Group Screen');
  };

  const handleOpenCamera = () => {
    console.log('Open Camera');
  };

  const handleCall = (call: Call) => {
    if (call.callType === 'video') {
      navigation.navigate('VideoCall', { contactName: call.name, contactNumber: call.id });
    } else {
      navigation.navigate('AudioCall', { contactName: call.name, contactNumber: call.id });
    }
  };

  return (
    <View style={styles.container}>
      {/* TopBar */}
      <TopBar onAddGroup={handleAddGroup} onOpenCamera={handleOpenCamera} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          placeholder="Search calls"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* Calls List */}
      <FlatList
        data={filteredCalls}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.callItem}
            onPress={() => handleCall(item)}
            onLongPress={() => navigation.navigate('Chat', { channelId: item.id, channelName: item.name })}
          >
            <View style={styles.row}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.callInfo}>
                <View style={styles.callHeader}>
                  <Text style={styles.callName}>{item.name}</Text>
                  <View style={styles.rightSection}>
                    <Text style={styles.time}>{item.time}</Text>
                    <TouchableOpacity 
                      style={styles.callButton}
                      onPress={() => handleCall(item)}
                    >
                      {item.callType === 'video' ? (
                        <Ionicons 
                          name="videocam" 
                          size={20} 
                          color={item.type === 'outgoing' ? '#25D366' : '#666'} 
                        />
                      ) : (
                        <Ionicons 
                          name="call" 
                          size={20} 
                          color={item.type === 'outgoing' ? '#25D366' : '#666'} 
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.callDetails}>
                  <Ionicons 
                    name={item.type === 'outgoing' ? 'call' : 'call-received'} 
                    size={16} 
                    color={item.type === 'outgoing' ? '#25D366' : '#FF5722'} 
                  />
                  <Text style={styles.callType}>
                    {item.type === 'outgoing' ? 'Outgoing' : 'Incoming'} • {item.duration}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddContact')}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default CallsScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
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
  callItem: {
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
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  callInfo: {
    flex: 1,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  callName: { 
    fontSize: 16, 
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: { 
    fontSize: 12, 
    color: '#666',
    marginRight: 12,
  },
  callButton: {
    padding: 8,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callType: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
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
