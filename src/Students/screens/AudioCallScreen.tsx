import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';

// ✅ Type guard for window
declare const window: any;

// ✅ Conditional import for Agora Web SDK
let AgoraRTC: any = null;
const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
if (isWeb) {
    try {
        AgoraRTC = require('agora-rtc-sdk-ng').default;
    } catch (e) {
        console.warn('Agora SDK not available');
    }
}

type AudioCallScreenRouteProp = RouteProp<RootStackParamList, 'AudioCall'>;

const APP_ID = '20e5fa9e1eb24b799e01c45eaca5c901';
const RTC_TOKEN_API = 'http://localhost:5200/web/agora/generate-rtc-token';

const AudioCallScreen = () => {
  const route = useRoute<AudioCallScreenRouteProp>();
  const navigation = useNavigation();
  const { contactName, contactNumber } = route.params;

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const rtcClientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);

  // Initialize audio call
  useEffect(() => {
    if (!isWeb || !AgoraRTC) {
      setIsLoading(false);
      return;
    }

    const initCall = async () => {
      try {
        console.log('📞 Initializing audio call...');
        
        const currentUserId = await AsyncStorage.getItem('USERID') || 'student_' + Date.now();
        const channelName = `audio_${currentUserId}_${contactNumber}_${Date.now()}`;
        console.log('Student Audio Call - User ID:', currentUserId);

        // Generate RTC token
        const tokenResponse = await axios.post(RTC_TOKEN_API, {
          channelName,
          uid: currentUserId,
        });

        if (tokenResponse.data.status !== 1) {
          throw new Error('Failed to generate RTC token');
        }

        const rtcToken = tokenResponse.data.token;
        console.log('✅ RTC Token generated');

        // Create RTC client
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        rtcClientRef.current = client;

        // Event handlers
        client.on('user-published', async (user: any, mediaType: string) => {
          console.log('📢 User published:', user.uid, mediaType);
          await client.subscribe(user, mediaType);
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        });

        client.on('user-left', (user: any) => {
          console.log('📢 User left:', user.uid);
        });

        // Join channel
        await client.join(APP_ID, channelName, rtcToken, currentUserId);
        console.log('✅ Joined audio channel');
        setIsJoined(true);

        // Create and publish audio track
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrackRef.current = audioTrack;
        await client.publish(audioTrack);
        console.log('✅ Published audio track');

        setIsLoading(false);
      } catch (error: any) {
        console.error('❌ Audio call error:', error);
        setIsLoading(false);
        Alert.alert('Call Failed', error.message || 'Failed to start audio call');
      }
    };

    initCall();

    // Cleanup
    return () => {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
      }
      if (rtcClientRef.current) {
        rtcClientRef.current.leave();
      }
    };
  }, [contactNumber]);

  // Call duration timer
  useEffect(() => {
    if (isJoined) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isJoined]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (rtcClientRef.current) {
        await rtcClientRef.current.leave();
        rtcClientRef.current = null;
      }
      console.log('✅ Audio call ended');
    } catch (error) {
      console.error('❌ End call error:', error);
    }
    navigation.goBack();
  };

  const handleToggleMute = () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.setEnabled(isMuted);
      setIsMuted(!isMuted);
      console.log(`🎤 Audio ${!isMuted ? 'muted' : 'unmuted'}`);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    console.log(`🔊 Speaker ${!isSpeakerOn ? 'on' : 'off'}`);
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
