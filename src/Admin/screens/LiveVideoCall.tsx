<<<<<<< HEAD
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootStackParamList } from '../navigation/types';

=======
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

>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
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

<<<<<<< HEAD
                // Get current user ID
                const currentUserId = await AsyncStorage.getItem('USERID') || 'user_' + Date.now();
                console.log('User ID:', currentUserId);

                // Generate RTC token
=======
                const currentUserId =
                    await AsyncStorage.getItem('USERID') || 'user_' + Date.now();

>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
                const tokenResponse = await axios.post(RTC_TOKEN_API, {
                    channelName,
                    uid: currentUserId,
                });

                if (tokenResponse.data.status !== 1) {
                    throw new Error('Failed to generate RTC token');
                }

                const rtcToken = tokenResponse.data.token;
<<<<<<< HEAD
                console.log('✅ RTC Token generated');

                // Create RTC client
                const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
                rtcClientRef.current = client;

                // Event handlers
                client.on('user-published', async (user: any, mediaType: string) => {
                    console.log('📢 User published:', user.uid, mediaType);
                    await client.subscribe(user, mediaType);

                    // Mark call as connected when remote user joins
=======

                const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
                rtcClientRef.current = client;

                client.on('user-published', async (user: any, mediaType: string) => {
                    await client.subscribe(user, mediaType);

>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
                    setCallConnected(true);

                    if (mediaType === 'video') {
                        setRemoteUsers(prev => {
                            const exists = prev.find(u => u.uid === user.uid);
                            if (exists) return prev;
                            return [...prev, user];
                        });

<<<<<<< HEAD
                        // Play remote video
=======
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
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
<<<<<<< HEAD
                    console.log('📢 User unpublished:', user.uid, mediaType);
                    if (mediaType === 'video') {
                        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
=======
                    if (mediaType === 'video') {
                        setRemoteUsers(prev =>
                            prev.filter(u => u.uid !== user.uid)
                        );
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
                    }
                });

                client.on('user-left', (user: any) => {
<<<<<<< HEAD
                    console.log('📢 User left:', user.uid);
                    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
                });

                // Join channel
                await client.join(APP_ID, channelName, rtcToken, currentUserId);
                console.log('✅ Joined channel');
                setIsJoined(true);

                // Create and publish local tracks
                const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                localAudioTrackRef.current = audioTrack;
                localVideoTrackRef.current = videoTrack;

                // Play local video
=======
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

>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
                if (localVideoRef.current) {
                    videoTrack.play(localVideoRef.current);
                }

<<<<<<< HEAD
                // Publish tracks
                await client.publish([audioTrack, videoTrack]);
                console.log('✅ Published local tracks');

                setIsLoading(false);

            } catch (error: any) {
                console.error('❌ Video call error:', error);
=======
                await client.publish([audioTrack, videoTrack]);
                setIsLoading(false);

            } catch (error: any) {
                console.error(error);
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
                setIsLoading(false);
                Alert.alert('Call Failed', error.message || 'Failed to start video call');
            }
        };

        initCall();

<<<<<<< HEAD
        // Cleanup
        return () => {
            if (localAudioTrackRef.current) {
                localAudioTrackRef.current.close();
            }
            if (localVideoTrackRef.current) {
                localVideoTrackRef.current.close();
            }
            if (rtcClientRef.current) {
                rtcClientRef.current.leave();
            }
=======
        return () => {
            localAudioTrackRef.current?.close();
            localVideoTrackRef.current?.close();
            rtcClientRef.current?.leave();
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
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
<<<<<<< HEAD
            console.log(`🎤 Audio ${!isMuted ? 'muted' : 'unmuted'}`);
=======
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
        }
    };

    const handleToggleVideo = () => {
        if (localVideoTrackRef.current) {
            localVideoTrackRef.current.setEnabled(isVideoOff);
            setIsVideoOff(!isVideoOff);
<<<<<<< HEAD
            console.log(`📹 Video ${!isVideoOff ? 'off' : 'on'}`);
=======
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
        }
    };

    const handleToggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
<<<<<<< HEAD
        console.log(`🔊 Speaker ${!isSpeakerOn ? 'on' : 'off'}`);
    };

    // 📞 Save Call History
    const saveCallHistory = async () => {
        try {
            if (!callerId || !receiverId) {
                console.warn('⚠️ Missing callerId or receiverId, cannot save call history');
                return;
            }

            const storedToken = await AsyncStorage.getItem('ADMINTOKEN');
            if (!storedToken) {
                console.warn('⚠️ No auth token found');
                return;
            }

            // Format call duration (MM:SS or "X mins")
            const minutes = Math.floor(callDuration / 60);
            const seconds = callDuration % 60;
            const durationText = minutes > 0 
                ? `${minutes} min${minutes > 1 ? 's' : ''} ${seconds} sec${seconds !== 1 ? 's' : ''}`
                : `${seconds} sec${seconds !== 1 ? 's' : ''}`;

            // Determine call status
            const callStatus = callConnected 
                ? `📹 Video Call - ${durationText}`
                : '📹 Video Call Missed';

            console.log('📞 Saving call history:', callStatus);

            // Send message to backend
            await axios.post(
                `http://localhost:5200/web/messages/send-msg/${receiverId}`,
                {
                    receiverId: receiverId,
                    text: callStatus,
=======
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
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
                },
                {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
<<<<<<< HEAD

            console.log('✅ Call history saved');
        } catch (error) {
            console.error('❌ Error saving call history:', error);
            // Don't block call ending if history save fails
=======
        } catch (e) {
            console.log('History Save Error:', e);
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
        }
    };

    const handleEndCall = async () => {
        try {
<<<<<<< HEAD
            // Save call history before ending
            await saveCallHistory();

            // Close tracks
            if (localAudioTrackRef.current) {
                localAudioTrackRef.current.close();
                localAudioTrackRef.current = null;
            }
            if (localVideoTrackRef.current) {
                localVideoTrackRef.current.close();
                localVideoTrackRef.current = null;
            }

            // Leave channel
            if (rtcClientRef.current) {
                await rtcClientRef.current.leave();
                rtcClientRef.current = null;
            }

            console.log('✅ Call ended');
            navigation.goBack();
        } catch (error) {
            console.error('❌ End call error:', error);
=======
            await saveCallHistory();

            localAudioTrackRef.current?.close();
            localVideoTrackRef.current?.close();
            rtcClientRef.current?.leave();

            navigation.goBack();
        } catch (e) {
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
            navigation.goBack();
        }
    };

    // Mobile fallback
    if (Platform.OS !== 'web') {
        return (
            <SafeAreaView style={styles.container}>
<<<<<<< HEAD
                <View style={styles.centerContent}>
                    <Ionicons name="videocam-off" size={80} color="#666" />
                    <Text style={styles.fallbackText}>
                        Video calling is currently only supported on web
                    </Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
=======
                <Text style={{ color: '#fff', marginTop: 100, textAlign: 'center' }}>
                    Video calling is supported only on Web.
                </Text>
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
            </SafeAreaView>
        );
    }

<<<<<<< HEAD
    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.loadingText}>Connecting to call...</Text>
                    <Text style={styles.channelText}>{channelName}</Text>
                </View>
=======
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Connecting...</Text>
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
<<<<<<< HEAD
            {/* Remote Video (Full Screen) */}
=======
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
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
<<<<<<< HEAD
                        <Text style={styles.waitingText}>Waiting for others to join...</Text>
=======
                        <Text style={styles.waitingText}>Waiting for User...</Text>
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
                    </View>
                )}
            </View>

<<<<<<< HEAD
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerInfo}>
                    <Text style={styles.channelName}>{channelName}</Text>
                    <Text style={styles.duration}>
                        {isJoined ? formatDuration(callDuration) : 'Connecting...'}
                    </Text>
                </View>
            </View>

            {/* Local Video (PiP) */}
=======
            {/* Local Video */}
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
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
<<<<<<< HEAD
                {/* Mute */}
=======
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
                <TouchableOpacity
                    style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                    onPress={handleToggleMute}
                >
                    <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={28} color="#fff" />
                </TouchableOpacity>

<<<<<<< HEAD
                {/* Video */}
                <TouchableOpacity
                    style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
                    onPress={handleToggleVideo}
                >
                    <Ionicons name={isVideoOff ? 'videocam-off' : 'videocam'} size={28} color="#fff" />
                </TouchableOpacity>

                {/* End Call */}
                <TouchableOpacity style={[styles.controlButton, styles.endCallButton]} onPress={handleEndCall}>
                    <Ionicons name="call" size={28} color="#fff" />
                </TouchableOpacity>

                {/* Speaker */}
                <TouchableOpacity
                    style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
                    onPress={handleToggleSpeaker}
                >
                    <Ionicons name={isSpeakerOn ? 'volume-high' : 'volume-mute'} size={28} color="#fff" />
=======
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
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        color: '#fff',
        fontSize: 20,
        marginBottom: 10,
    },
    channelText: {
        color: '#999',
        fontSize: 14,
    },
    fallbackText: {
        color: '#999',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    backButton: {
        backgroundColor: '#4a4e69',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    remoteVideoContainer: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    waitingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waitingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 20,
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    headerInfo: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    channelName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    duration: {
        fontSize: 14,
        color: '#b0b0b0',
        marginTop: 4,
    },
    localVideoContainer: {
        position: 'absolute',
        top: 120,
=======
    container: { flex: 1, backgroundColor: '#000' },
    loadingText: { color: '#fff', marginTop: 200, textAlign: 'center' },
    remoteVideoContainer: { flex: 1, backgroundColor: '#1a1a2e' },
    waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    waitingText: { color: '#fff', marginTop: 20 },
    localVideoContainer: {
        position: 'absolute',
        top: 100,
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
        right: 20,
        width: 120,
        height: 160,
        backgroundColor: '#2a2a3e',
        borderRadius: 12,
        overflow: 'hidden',
<<<<<<< HEAD
        borderWidth: 2,
        borderColor: '#fff',
=======
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
        zIndex: 10,
    },
    controls: {
        position: 'absolute',
        bottom: 50,
<<<<<<< HEAD
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 20,
=======
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
>>>>>>> ff9d0a84a0fa430682555dacd3d29ceee5bd1120
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
