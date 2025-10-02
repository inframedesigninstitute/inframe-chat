import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Fix for route prop typing
type RootStackParamList = {
  VideoCallScreen: { contactName: string; contactNumber: string };
};

type VideoCallScreenRouteProp = RouteProp<RootStackParamList, 'VideoCallScreen'>;

const VideoCallScreen = () => {
  const route = useRoute<VideoCallScreenRouteProp>();
  const navigation = useNavigation();
  const { contactName, contactNumber } = route.params;

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(Platform.OS === 'web' ? true : false);

  // Camera permission
  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        try {
          const { Camera } = await import('react-native-vision-camera');
          const status = await Camera.requestCameraPermission();
          if (status === 'granted') {
            setHasCameraPermission(true);
          } else {
            Alert.alert('Permission Required', 'Camera permission is required for video call.');
          }
        } catch (e) {
          // ignore on web
          setHasCameraPermission(true);
        }
      })();
    }
  }, []);

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
    navigation.goBack();
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  if (!hasCameraPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 50 }}>
          Camera permission required for video call
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Video Feed */}
      <View style={styles.mainVideoContainer}>
        <View style={styles.mainVideo}>
          <Text style={styles.mainVideoText}>Video Feed</Text>
        </View>

        {/* Call Info Overlay */}
        <View style={styles.callInfoOverlay}>
          <Text style={styles.contactName}>{contactName}</Text>
          <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
        </View>
      </View>

      {/* Picture-in-Picture Video */}
      <View style={styles.pipVideoContainer}>
        <View style={styles.pipVideo}>
          <View style={styles.pipAvatar}>
            <Text style={styles.pipAvatarText}>
              {contactName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Call Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <TouchableOpacity 
            style={[styles.controlButton, isMuted && styles.activeButton]} 
            onPress={handleToggleMute}
          >
            <Ionicons 
              name={isMuted ? "mic-off" : "mic"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, !isVideoOn && styles.activeButton]} 
            onPress={handleToggleVideo}
          >
            <Ionicons 
              name={isVideoOn ? "videocam" : "videocam-off"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, isSpeakerOn && styles.activeButton]} 
            onPress={handleToggleSpeaker}
          >
            <Ionicons 
              name={isSpeakerOn ? "volume-high" : "volume-high-outline"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Ionicons name="call" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainVideoContainer: {
    flex: 1,
    position: 'relative',
  },
  mainVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainVideoText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  callInfoOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  callDuration: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '500',
  },
  pipVideoContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
  },
  pipVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#FF4444',
  },
  endCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoCallScreen;
