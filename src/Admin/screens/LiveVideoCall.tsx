declare var window: any;   // ✅ FIX for "Cannot find name 'window'"

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
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
import { RootStackParamList } from '../navigation/types';

// ✅ Conditional import for Agora Web SDK
let AgoraRTC: any = null;
if (typeof window !== 'undefined' && Platform.OS === 'web') {
    AgoraRTC = require('agora-rtc-sdk-ng').default;
}

type LiveVideoCallRouteProp = RouteProp<RootStackParamList, 'LiveVideoCall'>;

const APP_ID = '20e5fa9e1eb24b799e01c45eaca5c901';
const RTC_TOKEN_API = 'http://localhost:5200/web/agora/generate-rtc-token';

const LiveVideoCall = () => {
    const route = useRoute<LiveVideoCallRouteProp>();
    const navigation = useNavigation();
    const { channelName, callerId, receiverId, receiverName } = route.params;

    const [isJoined, setIsJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
    const [callConnected, setCallConnected] = useState(false);

    const rtcClientRef = useRef<any>(null);
    const localAudioTrackRef = useRef<any>(null);
    const localVideoTrackRef = useRef<any>(null);
    const localVideoRef = useRef<HTMLDivElement>(null);
    const remoteVideoRef = useRef<HTMLDivElement>(null);

    // Call duration timer
    useEffect(() => {
        if (isJoined) {
            const interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isJoined]);

    // Initialize and join call
    useEffect(() => {
        if (typeof window === 'undefined' || Platform.OS !== 'web' || !AgoraRTC) {
            setIsLoading(false);
            Alert.alert('Not Supported', 'Video calling is only available on web platform');
            return;
        }

        const initCall = async () => {
            try {
                console.log('🎥 Initializing video call...');
                console.log('Channel:', channelName);

                const currentUserId =
                    await AsyncStorage.getItem('USERID') || 'user_' + Date.now();

                const tokenResponse = await axios.post(RTC_TOKEN_API, {
                    channelName,
                    uid: currentUserId,
                });

                if (tokenResponse.data.status !== 1) {
                    throw new Error('Failed to generate RTC token');
                }

                const rtcToken = tokenResponse.data.token;

                const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
                rtcClientRef.current = client;

                client.on('user-published', async (user: any, mediaType: string) => {
                    await client.subscribe(user, mediaType);

                    setCallConnected(true);

                    if (mediaType === 'video') {
                        setRemoteUsers(prev => {
                            const exists = prev.find(u => u.uid === user.uid);
                            if (exists) return prev;
                            return [...prev, user];
                        });

                        if (remoteVideoRef.current) {
                            setTimeout(() => {
                                user.videoTrack?.play(remoteVideoRef.current!);
                            }, 100);
                        }
                    }

                    if (mediaType === 'audio') {
                        user.audioTrack?.play();
                    }
                });

                client.on('user-unpublished', (user: any, mediaType: string) => {
                    if (mediaType === 'video') {
                        setRemoteUsers(prev =>
                            prev.filter(u => u.uid !== user.uid)
                        );
                    }
                });

                client.on('user-left', (user: any) => {
                    setRemoteUsers(prev =>
                        prev.filter(u => u.uid !== user.uid)
                    );
                });

                await client.join(APP_ID, channelName, rtcToken, currentUserId);
                setIsJoined(true);

                const [audioTrack, videoTrack] =
                    await AgoraRTC.createMicrophoneAndCameraTracks();

                localAudioTrackRef.current = audioTrack;
                localVideoTrackRef.current = videoTrack;

                if (localVideoRef.current) {
                    videoTrack.play(localVideoRef.current);
                }

                await client.publish([audioTrack, videoTrack]);
                setIsLoading(false);

            } catch (error: any) {
                console.error(error);
                setIsLoading(false);
                Alert.alert('Call Failed', error.message || 'Failed to start video call');
            }
        };

        initCall();

        return () => {
            localAudioTrackRef.current?.close();
            localVideoTrackRef.current?.close();
            rtcClientRef.current?.leave();
        };
    }, [channelName]);

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggleMute = () => {
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.setEnabled(isMuted);
            setIsMuted(!isMuted);
        }
    };

    const handleToggleVideo = () => {
        if (localVideoTrackRef.current) {
            localVideoTrackRef.current.setEnabled(isVideoOff);
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleToggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
    };

    // Save call history
    const saveCallHistory = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('ADMINTOKEN');
            if (!storedToken) return;

            const minutes = Math.floor(callDuration / 60);
            const seconds = callDuration % 60;

            const durationText =
                minutes > 0
                    ? `${minutes} mins ${seconds} sec`
                    : `${seconds} sec`;

            const callStatus = callConnected
                ? `📹 Video Call - ${durationText}`
                : '📹 Video Call Missed';

            await axios.post(
                `http://localhost:5200/web/messages/send-msg`,
                {
                    receiverId,
                    text: callStatus,
                    userType: 'mainAdmin',
                    senderId: callerId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        } catch (e) {
            console.log('History Save Error:', e);
        }
    };

    const handleEndCall = async () => {
        try {
            await saveCallHistory();

            localAudioTrackRef.current?.close();
            localVideoTrackRef.current?.close();
            rtcClientRef.current?.leave();

            navigation.goBack();
        } catch (e) {
            navigation.goBack();
        }
    };

    // Mobile fallback
    if (Platform.OS !== 'web') {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ color: '#fff', marginTop: 100, textAlign: 'center' }}>
                    Video calling is supported only on Web.
                </Text>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Connecting...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.remoteVideoContainer}>
                {remoteUsers.length > 0 ? (
                    <div
                        ref={remoteVideoRef}
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#1a1a2e',
                        }}
                    />
                ) : (
                    <View style={styles.waitingContainer}>
                        <Ionicons name="person" size={80} color="#fff" />
                        <Text style={styles.waitingText}>Waiting for User...</Text>
                    </View>
                )}
            </View>

            {/* Local Video */}
            <View style={styles.localVideoContainer}>
                <div
                    ref={localVideoRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 12,
                    }}
                />
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                    onPress={handleToggleMute}
                >
                    <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.controlButton,
                        isVideoOff && styles.controlButtonActive,
                    ]}
                    onPress={handleToggleVideo}
                >
                    <Ionicons
                        name={isVideoOff ? 'videocam-off' : 'videocam'}
                        size={28}
                        color="#fff"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, styles.endCallButton]}
                    onPress={handleEndCall}
                >
                    <Ionicons name="call" size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.controlButton,
                        isSpeakerOn && styles.controlButtonActive,
                    ]}
                    onPress={handleToggleSpeaker}
                >
                    <Ionicons
                        name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
                        size={28}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loadingText: { color: '#fff', marginTop: 200, textAlign: 'center' },
    remoteVideoContainer: { flex: 1, backgroundColor: '#1a1a2e' },
    waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    waitingText: { color: '#fff', marginTop: 20 },
    localVideoContainer: {
        position: 'absolute',
        top: 100,
        right: 20,
        width: 120,
        height: 160,
        backgroundColor: '#2a2a3e',
        borderRadius: 12,
        overflow: 'hidden',
        zIndex: 10,
    },
    controls: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonActive: {
        backgroundColor: 'rgba(231,76,60,0.8)',
    },
    endCallButton: {
        backgroundColor: '#e74c3c',
        width: 64,
        height: 64,
        borderRadius: 32,
    },
});

export default LiveVideoCall;
