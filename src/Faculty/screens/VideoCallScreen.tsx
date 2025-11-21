import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Fix for route prop typing
type RootStackParamList = {
  VideoCallScreen: { contactName: string; contactNumber: string };
};

type VideoCallScreenRouteProp = RouteProp<RootStackParamList, 'VideoCallScreen'>;

const VideoCallScreen = () => {
  const route = useRoute<VideoCallScreenRouteProp>();
  const navigation = useNavigation();
  const { contactName } = route.params;

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(
    Platform.OS === 'web' ? true : false
  );

  // Camera permission (Expo way)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === 'granted') {
          setHasCameraPermission(true);
        } else {
          Alert.alert(
            'Permission Required',
            'Camera permission is required for video call.'
          );
        }
      })();
    }
  }, []);

  // Timer
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
      {/* Main Video Placeholder */}
      <View style={styles.mainVideoContainer}>
        <View style={styles.mainVideo}>
          <Text style={styles.mainVideoText}>Video Feed</Text>
        </View>

        {/* Call Info */}
        <View style={styles.callInfoOverlay}>
          <Text style={styles.contactName}>{contactName}</Text>
          <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
        </View>
      </View>

      {/* Small Video */}
      <View style={styles.pipVideoContainer}>
        <View style={styles.pipVideo}>
          <View style={styles.pipAvatar}>
            <Text style={styles.pipAvatarText}>
              {contactName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.activeButton]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !isVideoOn && styles.activeButton]}
            onPress={() => setIsVideoOn(!isVideoOn)}
          >
            <Ionicons
              name={isVideoOn ? 'videocam' : 'videocam-off'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeakerOn && styles.activeButton]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-high-outline'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endCallButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="call" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mainVideoContainer: { flex: 1, position: 'relative' },
  mainVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainVideoText: { color: '#666', fontSize: 18 },
  callInfoOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  contactName: { color: '#fff', fontSize: 22, fontWeight: '600' },
  callDuration: { color: '#ccc', marginTop: 4 },
  pipVideoContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 120,
    height: 150,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
  },
  pipVideo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pipAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipAvatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  controlsContainer: { padding: 20 },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: { backgroundColor: '#FF4444' },
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
