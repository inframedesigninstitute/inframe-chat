import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';

type AudioCallScreenRouteProp = RouteProp<RootStackParamList, 'AudioCall'>;

const AudioCallScreen = () => {
  const route = useRoute<AudioCallScreenRouteProp>();
  const navigation = useNavigation();
  const { contactName, contactNumber } = route.params;

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    // @ts-ignore
    navigation.goBack();
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {contactName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contactName}</Text>
          <Text style={styles.contactNumber}>{contactNumber}</Text>
          <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.controlsRow}>
            <TouchableOpacity 
              style={[styles.controlButton, isMuted && styles.activeButton]} 
              onPress={handleToggleMute}
            >
              <Ionicons 
                name={isMuted ? 'mic-off' : 'mic'} 
                size={24} 
                color={isMuted ? '#fff' : '#075E54'} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, isSpeakerOn && styles.activeButton]} 
              onPress={handleToggleSpeaker}
            >
              <Ionicons 
                name={isSpeakerOn ? 'volume-high' : 'volume-high-outline'} 
                size={24} 
                color={isSpeakerOn ? '#fff' : '#075E54'} 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
              <Ionicons name="call" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#075E54',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#075E54',
  },
  contactInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  contactName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  contactNumber: {
    fontSize: 18,
    color: '#E8F5E8',
    marginBottom: 16,
  },
  callDuration: {
    fontSize: 16,
    color: '#E8F5E8',
    fontWeight: '500',
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  activeButton: {
    backgroundColor: '#075E54',
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default AudioCallScreen;
