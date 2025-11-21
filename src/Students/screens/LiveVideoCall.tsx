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
    const { channelName } = route.params;

    const [isJoined, setIsJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [remoteUsers, setRemoteUsers] = useState<any[]>([]);

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

                // Get current user ID (Student)
                const currentUserId = await AsyncStorage.getItem('USERID') || 'student_' + Date.now();
                console.log('Student User ID:', currentUserId);

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

                    if (mediaType === 'video') {
                        setRemoteUsers(prev => {
                            const exists = prev.find(u => u.uid === user.uid);
                            if (exists) return prev;
                            return [...prev, user];
                        });

                        // Play remote video
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
                    console.log('📢 User unpublished:', user.uid, mediaType);
                    if (mediaType === 'video') {
                        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
                    }
                });

                client.on('user-left', (user: any) => {
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
                if (localVideoRef.current) {
                    videoTrack.play(localVideoRef.current);
                }

                // Publish tracks
                await client.publish([audioTrack, videoTrack]);
                console.log('✅ Published local tracks');

                setIsLoading(false);

            } catch (error: any) {
                console.error('❌ Video call error:', error);
                setIsLoading(false);
                Alert.alert('Call Failed', error.message || 'Failed to start video call');
            }
        };

        initCall();

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
            console.log(`🎤 Audio ${!isMuted ? 'muted' : 'unmuted'}`);
        }
    };

    const handleToggleVideo = () => {
        if (localVideoTrackRef.current) {
            localVideoTrackRef.current.setEnabled(isVideoOff);
            setIsVideoOff(!isVideoOff);
            console.log(`📹 Video ${!isVideoOff ? 'off' : 'on'}`);
        }
    };

    const handleToggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
        console.log(`🔊 Speaker ${!isSpeakerOn ? 'on' : 'off'}`);
    };

    const handleEndCall = async () => {
        try {
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
            navigation.goBack();
        }
    };

    // Mobile fallback
    if (Platform.OS !== 'web') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Ionicons name="videocam-off" size={80} color="#666" />
                    <Text style={styles.fallbackText}>
                        Video calling is currently only supported on web
                    </Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.loadingText}>Connecting to call...</Text>
                    <Text style={styles.channelText}>{channelName}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Remote Video (Full Screen) */}
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
                        <Text style={styles.waitingText}>Waiting for others to join...</Text>
                    </View>
                )}
            </View>

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
                {/* Mute */}
                <TouchableOpacity
                    style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                    onPress={handleToggleMute}
                >
                    <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={28} color="#fff" />
                </TouchableOpacity>

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
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
        right: 20,
        width: 120,
        height: 160,
        backgroundColor: '#2a2a3e',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff',
        zIndex: 10,
    },
    controls: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 20,
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
