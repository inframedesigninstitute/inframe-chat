import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import WebBackButton from '../components/WebBackButton';
import LeftSidebarNav from '../navigation/LeftSidebar';
import { MainTabsParamList, RootStackParamList } from '../navigation/types';

type CallsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Calls'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Call = {
  id: string;
  name: string;
  time: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'voice' | 'video';
  duration?: string;
  avatar: string;
};

const initialCalls: Call[] = [
  {
    id: '1',
    name: 'Richard',
    time: '06:38 PM',
    type: 'missed',
    callType: 'voice',
    duration: '0s',
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '2',
    name: 'Charlotte',
    time: '06:34 PM',
    type: 'incoming',
    callType: 'voice',
    duration: '0s',
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '3',
    name: 'Charlotte',
    time: '06:32 PM',
    type: 'missed',
    callType: 'voice',
    duration: '0s',
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '4',
    name: 'Richard',
    time: '06:37 PM',
    type: 'incoming',
    callType: 'voice',
    duration: '2:15',
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '5',
    name: 'Charlotte',
    time: '06:24 PM',
    type: 'missed',
    callType: 'voice',
    duration: '0s',
    avatar: 'https://via.placeholder.com/40'
  },
  {
    id: '6',
    name: 'Charlotte',
    time: '06:08 PM',
    type: 'incoming',
    callType: 'voice',
    duration: '1:30',
    avatar: 'https://via.placeholder.com/40'
  }
];

const CallsScreen = () => {
  const navigation = useNavigation<CallsNavigationProp>();
  const [calls] = useState(initialCalls);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const handleCallSelect = (call: Call) => {
    setSelectedCall(call);
  };

  const handleAudioCall = () => {
    if (selectedCall) {
      navigation.navigate('AudioCall', {
        contactName: selectedCall.name,
        contactNumber: selectedCall.id
      });
    }
  };

  const handleVideoCall = () => {
    if (selectedCall) {
      navigation.navigate('VideoCall', {
        contactName: selectedCall.name,
        contactNumber: selectedCall.id
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Left Sidebar */}
      <View style={styles.leftSidebar}>
        <LeftSidebarNav active={'Calls'} />
      </View>

      {/* Middle Panel - Calls List */}
      <View style={styles.callsList}>
        <View style={styles.callsHeader}>
           <WebBackButton />
          <Text style={styles.callsTitle}>Calls</Text>
        </View>

        <FlatList
          data={calls}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.callItem,
                selectedCall?.id === item.id && styles.selectedCallItem
              ]}
              onPress={() => handleCallSelect(item)}
            >
              <Image source={{ uri: item.avatar }} style={styles.callAvatar} />
              <View style={styles.callInfo}>
                <Text
                  style={[
                    styles.callName,
                    item.type === 'missed' && styles.missedCallName
                  ]}
                >
                  {item.name}
                </Text>
                <View style={styles.callStatusRow}>
                  <Ionicons
                    name={item.type === 'missed' ? 'call' : 'call-received'}
                    size={14}
                    color={item.type === 'missed' ? '#ff4444' : '#666'}
                  />
                  <Text style={styles.callStatus}>
                    {item.type === 'missed' ? 'Missed call' : 'Incoming call'}
                  </Text>
                </View>
              </View>
              <View style={styles.callMeta}>
                <Text style={styles.callTime}>{item.time}</Text>
                <TouchableOpacity style={styles.infoButton}>
                  <Ionicons name="information-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Right Panel - Call Detail */}
      <View style={styles.callDetail}>
        {selectedCall ? (
          <>
            {/* Contact Info */}
            <View style={styles.contactInfo}>
              <Image
                source={{ uri: selectedCall.avatar }}
                style={styles.detailAvatar}
              />
              <Text style={styles.detailName}>{selectedCall.name}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAudioCall}
              >
                <Ionicons name="call" size={20} color="#8e24aa" />
                <Text style={styles.actionButtonText}>Audio call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleVideoCall}
              >
                <Ionicons name="videocam" size={20} color="#8e24aa" />
                <Text style={styles.actionButtonText}>Video call</Text>
              </TouchableOpacity>
            </View>

            {/* Call Log */}
            <View style={styles.callLog}>
              <Text style={styles.logDate}>Yesterday</Text>
              <View style={styles.logEntry}>
                <Text style={styles.logTime}>
                  {selectedCall.time}{' '}
                  {selectedCall.type === 'missed'
                    ? 'Missed call'
                    : 'Incoming call'}
                </Text>
                <Text style={styles.logDuration}>{selectedCall.duration}</Text>
              </View>
            </View>

            {/* Expandable Sections */}
            <View style={styles.expandableSections}>
              <TouchableOpacity style={styles.expandableSection}>
                <Text style={styles.sectionText}>Participants</Text>
                <Text style={styles.sectionValue}>2 {">"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.expandableSection}>
                <Text style={styles.sectionText}>History</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyDetail}>
            <Image
                              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/893/893292.png' }}
                            />
            <Text style={styles.emptyDetailText}>
              Select a call to view details
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default CallsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    alignItems: 'stretch'
  },
  leftSidebar: {
 
   
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0'
  },
  callsList: {
    width: 600,
    maxWidth: 450,
    minWidth: 260,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0'
  },
  callsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 0
  },
  callsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000ff',
    alignSelf:'center',
    marginTop:-35,
    marginRight:280

  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  selectedCallItem: {
    backgroundColor: '#e1bee7'
  },
  callAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  callInfo: {
    flex: 1
  },
  callName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
    marginBottom: 4
  },
  missedCallName: {
    color: '#000000ff'
  },
  callStatusRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  callStatus: {
    fontSize: 12,
    color: '#000000ff',
    marginLeft: 4
  },
  callMeta: {
    alignItems: 'flex-end'
  },
  callTime: {
    fontSize: 12,
    color: '#000000ff',
    marginBottom: 4
  },
  infoButton: {
    padding: 4
  },
  callDetail: {
    flex: 1,
    backgroundColor: '#ffffffff'
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fdfdfdff'
  },
  backButton: {
    marginRight: 12
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000ff'
  },
  contactInfo: {
    alignItems: 'center',
    padding: 32
  },
  detailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000ff'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    marginBottom: 32
  },
  actionButton: {
    backgroundColor: '#ffffffff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'center'
  },
  actionButtonText: {
    fontSize: 14,
    color: '#000000ff',
    marginLeft: 8,
    fontWeight: '500'
  },
  callLog: {
    paddingHorizontal: 32,
    marginBottom: 32
  },
  logDate: {
    fontSize: 14,
    color: '#000000ff',
    marginBottom: 8
  },
  logEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  logTime: {
    fontSize: 14,
    color: '#000000ff'
  },
  logDuration: {
    fontSize: 14,
    color: '#000000ff'
  },
  expandableSections: {
    paddingHorizontal: 32
  },
  expandableSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d1c4e9'
  },
  sectionText: {
    fontSize: 16,
    color: '#000000ff',
    fontWeight: '500'
  },
  sectionValue: {
    fontSize: 16,
    color: '#000000ff'
  },
  emptyDetail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyDetailText: {
    fontSize: 16,
    color: '#000000ff'
  }
});
