// src/screens/ChannelListScreen.tsx
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MarqueeText from '../components/MarqueeText';
import TopBar from '../components/TopBar';
import { MainTabsParamList, RootStackParamList } from '../navigation/types';

type ChannelListNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Chats'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Channel = { id: string; name: string; lastMessage: string; time: string; unread?: number };

const initialChannels: Channel[] = [
  { id: '1', name: 'LIPS', lastMessage: 'Dear Students...', time: '3:50 pm', unread: 5 },
  { id: '2', name: 'Bhavesh', lastMessage: 'Voice call', time: '12:06 pm' },
  { id: '3', name: 'Freshers India - 10', lastMessage: 'HCL (Work From Home)', time: '9:36 am', unread: 1 },
  { id: '4', name: 'Vikram', lastMessage: 'cha.zip', time: '9:36 am' },
];

const ChannelListScreen = () => {
  const navigation = useNavigation<ChannelListNavigationProp>();
  const [channels] = useState(initialChannels);
  const [searchText, setSearchText] = useState('');

  const handleAddGroup = () => {
    console.log('Navigate to Create Group Screen');
  };

  const handleOpenCamera = () => {
    navigation.navigate('Camera');
  };

  return (
    <View style={styles.container}>
      <TopBar onAddGroup={handleAddGroup} onOpenCamera={handleOpenCamera} />
      
      <MarqueeText 
        text="Welcome to InframeChat - Your secure messaging platform! "
        speed={60}
        textStyle={{ color: '#020202ff', fontSize: 16, fontWeight: '600' }}
        containerStyle={{ backgroundColor: '#e3f2fd', marginVertical: 8 }}
      />

      <TextInput
        placeholder="Search"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
         style={styles.channelItem}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.channelItem}
            onLongPress={() => console.log('Show options at top')}
            onPress={() => navigation.navigate('Chat', { channelId: item.id, channelName: item.name })}
          >
            {/* <View style={styles.row}>
              <View style={{ marginRight: 12 }}>
                <View style={{ width: 4, height: 8, borderRadius: 24, backgroundColor: '#075E54', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="people" size={24} color="#fff" />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelName}>{item.name}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
              </View>
              <Text style={styles.time}>{item.time}</Text>
            </View> */}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ChannelListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f1f3ff', padding: 10, margin: 50, },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccccccff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginVertical: 30,
    marginHorizontal:30,
    
  },
  channelItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
      marginHorizontal: 50,
      
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal:30, },
  channelName: { fontSize: 16, fontWeight: 'bold', color: '#fff',      marginHorizontal: 50,
 },
  lastMessage: { fontSize: 14, color: '#0e0d0dff' },
  time: { fontSize: 12, color: '#030303ff' },
  unreadBadge: {
    backgroundColor: '#040504ff',
    borderRadius: 12,
    paddingHorizontal: 6,
    marginTop: 4,
  },
  unreadText: { color: '#fff', fontSize: 12 },
});
