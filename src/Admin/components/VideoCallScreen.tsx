import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCall } from '../context/CallContext';

const { width, height } = Dimensions.get('window');

const VideoCallScreen: React.FC = () => {
    const navigation = useNavigation();
    const {
        currentCall,
        callStatus,
        isAudioMuted,
        isVideoMuted,
        isSpeakerOn,
        endCall,
        toggleAudio,
        toggleVideo,
        toggleSpeaker,
        switchCamera,
        localVideoTrack,
        remoteUsers,
    } = useCall();

    const [callDuration, setCallDuration] = useState(0);
    const localVideoRef = useRef<HTMLDivElement>(null);
    const remoteVideoRef = useRef<HTMLDivElement>(null);

    // Call Duration Timer
    useEffect(() => {
        if (callStatus === 'connected') {
            const interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [callStatus]);

    // Render local video
    useEffect(() => {
        if (Platform.OS === 'web' && localVideoTrack && localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
        }

        return () => {
            if (localVideoTrack) {
                localVideoTrack.stop();
            }
        };
    }, [localVideoTrack]);

    // Render remote video
    useEffect(() => {
        if (Platform.OS === 'web' && remoteUsers.length > 0 && remoteVideoRef.current) {
            const remoteUser = remoteUsers[0];
            if (remoteUser.videoTrack) {
                remoteUser.videoTrack.play(remoteVideoRef.current);
            }
        }
    }, [remoteUsers]);

    // Auto close when call ends
    useEffect(() => {
        if (callStatus === 'ended' || callStatus === 'idle') {
            navigation.goBack();
        }
    }, [callStatus, navigation]);

    const handleEndCall = async () => {
        await endCall();
        navigation.goBack();
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentCall) {
        return null;
    }

    const isVideoCall = currentCall.callType === 'video';

    return (
        <View style={styles.container}>
            {/* Remote Video (Full Screen) */}
            {isVideoCall && remoteUsers.length > 0 ? (
                <View style={styles.remoteVideoContainer}>
                    {Platform.OS === 'web' ? (
                        <div
                            ref={remoteVideoRef}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <View style={styles.videoPlaceholder}>
                            <Ionicons name="videocam-off" size={60} color="#fff" />
                            <Text style={styles.placeholderText}>Video not available on mobile yet</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.audioCallContainer}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarLargeText}>
                            {(currentCall.receiverName || currentCall.callerName).charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.remoteName}>
                        {currentCall.receiverName || currentCall.callerName}
                    </Text>
                </View>
            )}

            {/* Header (Name + Duration) */}
            <View style={styles.header}>
                <View style={styles.headerInfo}>
                    <Text style={styles.remoteName}>
                        {currentCall.receiverName || currentCall.callerName}
                    </Text>
                    <Text style={styles.callDuration}>
                        {callStatus === 'connected' ? formatDuration(callDuration) : 'Connecting...'}
                    </Text>
                </View>
            </View>

            {/* Local Video (Picture-in-Picture) */}
            {isVideoCall && (
                <View style={styles.localVideoContainer}>
                    {Platform.OS === 'web' ? (
                        <div
                            ref={localVideoRef}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 12,
                            }}
                        />
                    ) : (
                        <View style={styles.videoPlaceholder}>
                            <Ionicons name="person" size={40} color="#fff" />
                        </View>
                    )}
                </View>
            )}

            {/* Bottom Controls */}
            <View style={styles.controls}>
                {/* Audio Toggle */}
                <TouchableOpacity
                    style={[styles.controlButton, isAudioMuted && styles.controlButtonActive]}
                    onPress={toggleAudio}
                >
                    <Ionicons
                        name={isAudioMuted ? 'mic-off' : 'mic'}
                        size={28}
                        color="#fff"
                    />
                </TouchableOpacity>

                {/* Video Toggle (Video calls only) */}
                {isVideoCall && (
                    <TouchableOpacity
                        style={[styles.controlButton, isVideoMuted && styles.controlButtonActive]}
                        onPress={toggleVideo}
                    >
                        <Ionicons
                            name={isVideoMuted ? 'videocam-off' : 'videocam'}
                            size={28}
                            color="#fff"
                        />
                    </TouchableOpacity>
                )}

                {/* End Call */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.endCallButton]}
                    onPress={handleEndCall}
                >
                    <Ionicons name="call" size={28} color="#fff" />
                </TouchableOpacity>

                {/* Speaker Toggle */}
                <TouchableOpacity
                    style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
                    onPress={toggleSpeaker}
                >
                    <Ionicons
                        name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
                        size={28}
                        color="#fff"
                    />
                </TouchableOpacity>

                {/* Switch Camera (Video calls only) */}
                {isVideoCall && Platform.OS !== 'web' && (
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={switchCamera}
                    >
                        <Ionicons name="camera-reverse" size={28} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    remoteVideoContainer: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    audioCallContainer: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLarge: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#4a4e69',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarLargeText: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#fff',
    },
    videoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a3e',
    },
    placeholderText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 14,
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    headerInfo: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    remoteName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    callDuration: {
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

export default VideoCallScreen;

