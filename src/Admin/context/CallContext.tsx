import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform, Alert } from 'react-native';

// ✅ Conditional import - only on web/browser
let AgoraRTC: any = null;
if (typeof window !== 'undefined' && Platform.OS === 'web') {
    AgoraRTC = require('agora-rtc-sdk-ng').default;
}

// Types (fallback for when Agora is not loaded)
type IAgoraRTCClient = any;
type ICameraVideoTrack = any;
type IMicrophoneAudioTrack = any;
type IAgoraRTCRemoteUser = any;

const APP_ID = '20e5fa9e1eb24b799e01c45eaca5c901';
const RTC_TOKEN_API = 'http://localhost:5200/web/agora/generate-rtc-token';

export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

interface CallData {
    callId: string;
    callType: CallType;
    callerName: string;
    callerId: string;
    receiverId: string;
    receiverName: string;
    channelName: string;
    status: CallStatus;
}

interface CallContextType {
    // Call State
    currentCall: CallData | null;
    callStatus: CallStatus;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    isSpeakerOn: boolean;
    
    // Call Actions
    startCall: (receiverId: string, receiverName: string, callType: CallType) => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => Promise<void>;
    endCall: () => Promise<void>;
    
    // Media Controls
    toggleAudio: () => void;
    toggleVideo: () => void;
    toggleSpeaker: () => void;
    switchCamera: () => void;
    
    // RTC Client & Tracks
    localVideoTrack: ICameraVideoTrack | null;
    localAudioTrack: IMicrophoneAudioTrack | null;
    remoteUsers: IAgoraRTCRemoteUser[];
    
    // Internal
    rtcClient: IAgoraRTCClient | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCall must be used within CallProvider');
    }
    return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Call State
    const [currentCall, setCurrentCall] = useState<CallData | null>(null);
    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    
    // RTC State
    const [rtcClient, setRtcClient] = useState<IAgoraRTCClient | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    
    const rtcClientRef = useRef<IAgoraRTCClient | null>(null);

    // Initialize RTC Client
    useEffect(() => {
        if (typeof window !== 'undefined' && Platform.OS === 'web' && AgoraRTC) {
            const client = AgoraRTC.createClient({ 
                mode: 'rtc', 
                codec: 'vp8' 
            });
            
            // Event Handlers
            client.on('user-published', async (user, mediaType) => {
                console.log('📢 User published:', user.uid, mediaType);
                await client.subscribe(user, mediaType);
                
                setRemoteUsers(prev => {
                    const exists = prev.find(u => u.uid === user.uid);
                    if (exists) return prev;
                    return [...prev, user];
                });
            });
            
            client.on('user-unpublished', (user, mediaType) => {
                console.log('📢 User unpublished:', user.uid, mediaType);
            });
            
            client.on('user-left', (user) => {
                console.log('📢 User left:', user.uid);
                setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
            });
            
            rtcClientRef.current = client;
            setRtcClient(client);
            
            return () => {
                client.removeAllListeners();
            };
        }
    }, []);

    // Generate RTC Token
    const generateRTCToken = async (channelName: string, uid: string): Promise<string> => {
        try {
            const response = await axios.post(RTC_TOKEN_API, {
                channelName,
                uid,
            });
            
            if (response.data.status === 1) {
                console.log('✅ RTC Token generated:', response.data.token);
                return response.data.token;
            }
            
            throw new Error('Token generation failed');
        } catch (error) {
            console.error('❌ RTC Token Error:', error);
            throw error;
        }
    };

    // Start Call (Outgoing)
    const startCall = async (receiverId: string, receiverName: string, callType: CallType) => {
        try {
            console.log('🔍 ========== START CALL DEBUG ==========');
            console.log('🔍 Window exists:', typeof window !== 'undefined');
            console.log('🔍 Platform:', Platform.OS);
            console.log('🔍 AgoraRTC loaded:', !!AgoraRTC);
            console.log('🔍 RTC Client:', !!rtcClientRef.current);
            
            if (typeof window === 'undefined' || Platform.OS !== 'web') {
                Alert.alert('Not Supported', 'Calling is only available on web platform');
                return;
            }

            if (!AgoraRTC) {
                throw new Error('Agora SDK not loaded');
            }

            if (!rtcClientRef.current) {
                throw new Error('RTC Client not initialized');
            }

            const currentUserId = await AsyncStorage.getItem('USERID') || 'user_' + Date.now();
            const currentUserName = await AsyncStorage.getItem('USERNAME') || 'User';
            const channelName = `call_${currentUserId}_${receiverId}_${Date.now()}`;
            
            console.log('📞 Starting call...');
            console.log('   Channel:', channelName);
            console.log('   Caller:', currentUserId);
            console.log('   Receiver:', receiverId);
            console.log('   Type:', callType);

            // Create call data
            const callData: CallData = {
                callId: channelName,
                callType,
                callerName: currentUserName,
                callerId: currentUserId,
                receiverId,
                receiverName,
                channelName,
                status: 'calling',
            };

            setCurrentCall(callData);
            setCallStatus('calling');

            // Generate token
            const token = await generateRTCToken(channelName, currentUserId);

            // Join channel
            await rtcClientRef.current.join(APP_ID, channelName, token, currentUserId);
            console.log('✅ Joined RTC channel');

            // Create local tracks
            if (AgoraRTC) {
                if (callType === 'video') {
                    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                    setLocalAudioTrack(audioTrack);
                    setLocalVideoTrack(videoTrack);
                    
                    // Publish tracks
                    await rtcClientRef.current.publish([audioTrack, videoTrack]);
                    console.log('✅ Published video & audio tracks');
                } else {
                    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                    setLocalAudioTrack(audioTrack);
                    
                    // Publish audio track
                    await rtcClientRef.current.publish(audioTrack);
                    console.log('✅ Published audio track');
                }
            }

            // TODO: Send call notification via RTM to receiver
            // This will trigger IncomingCallScreen on receiver's device

        } catch (error) {
            console.error('❌ Start call error:', error);
            setCallStatus('idle');
            setCurrentCall(null);
        }
    };

    // Accept Call (Incoming)
    const acceptCall = async () => {
        try {
            if (!currentCall || !rtcClientRef.current) {
                throw new Error('No active call to accept');
            }

            console.log('✅ Accepting call...');
            setCallStatus('connected');

            const currentUserId = await AsyncStorage.getItem('USERID') || 'user_' + Date.now();
            const token = await generateRTCToken(currentCall.channelName, currentUserId);

            // Join channel
            await rtcClientRef.current.join(APP_ID, currentCall.channelName, token, currentUserId);

            // Create local tracks
            if (AgoraRTC) {
                if (currentCall.callType === 'video') {
                    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                    setLocalAudioTrack(audioTrack);
                    setLocalVideoTrack(videoTrack);
                    await rtcClientRef.current.publish([audioTrack, videoTrack]);
                } else {
                    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                    setLocalAudioTrack(audioTrack);
                    await rtcClientRef.current.publish(audioTrack);
                }
            }

            console.log('✅ Call accepted and joined');

        } catch (error) {
            console.error('❌ Accept call error:', error);
            endCall();
        }
    };

    // Reject Call
    const rejectCall = async () => {
        console.log('❌ Call rejected');
        setCallStatus('ended');
        
        // TODO: Send reject notification via RTM
        
        setTimeout(() => {
            setCurrentCall(null);
            setCallStatus('idle');
        }, 1000);
    };

    // End Call
    const endCall = async () => {
        try {
            console.log('📴 Ending call...');

            // Close local tracks
            if (localAudioTrack) {
                localAudioTrack.close();
                setLocalAudioTrack(null);
            }
            if (localVideoTrack) {
                localVideoTrack.close();
                setLocalVideoTrack(null);
            }

            // Leave channel
            if (rtcClientRef.current) {
                await rtcClientRef.current.leave();
            }

            // Reset state
            setRemoteUsers([]);
            setCallStatus('ended');
            setIsAudioMuted(false);
            setIsVideoMuted(false);

            // TODO: Send end call notification via RTM

            setTimeout(() => {
                setCurrentCall(null);
                setCallStatus('idle');
            }, 1000);

            console.log('✅ Call ended');

        } catch (error) {
            console.error('❌ End call error:', error);
        }
    };

    // Toggle Audio (Mute/Unmute)
    const toggleAudio = () => {
        if (localAudioTrack) {
            const newState = !isAudioMuted;
            localAudioTrack.setEnabled(!newState);
            setIsAudioMuted(newState);
            console.log(`🎤 Audio ${newState ? 'muted' : 'unmuted'}`);
        }
    };

    // Toggle Video (On/Off)
    const toggleVideo = () => {
        if (localVideoTrack) {
            const newState = !isVideoMuted;
            localVideoTrack.setEnabled(!newState);
            setIsVideoMuted(newState);
            console.log(`📹 Video ${newState ? 'off' : 'on'}`);
        }
    };

    // Toggle Speaker
    const toggleSpeaker = () => {
        setIsSpeakerOn(prev => !prev);
        console.log(`🔊 Speaker ${!isSpeakerOn ? 'on' : 'off'}`);
        // Note: Speaker control is platform-specific
    };

    // Switch Camera (Front/Back)
    const switchCamera = async () => {
        if (localVideoTrack) {
            try {
                await localVideoTrack.setDevice(
                    localVideoTrack.getTrackLabel().includes('front') 
                        ? 'back' 
                        : 'front'
                );
                console.log('📷 Camera switched');
            } catch (error) {
                console.error('❌ Switch camera error:', error);
            }
        }
    };

    const value: CallContextType = {
        currentCall,
        callStatus,
        isAudioMuted,
        isVideoMuted,
        isSpeakerOn,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleAudio,
        toggleVideo,
        toggleSpeaker,
        switchCamera,
        localVideoTrack,
        localAudioTrack,
        remoteUsers,
        rtcClient,
    };

    return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

