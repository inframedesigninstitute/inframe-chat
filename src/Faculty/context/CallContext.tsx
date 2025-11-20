/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

// 🔥 Fix: window undefined TypeScript error
declare const window: any;

// Conditional Agora import
let AgoraRTC: any = null;
if (typeof window !== 'undefined' && Platform.OS === 'web') {
    AgoraRTC = require('agora-rtc-sdk-ng').default;
}

// Types (fallback)
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
    currentCall: CallData | null;
    callStatus: CallStatus;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    isSpeakerOn: boolean;

    startCall: (receiverId: string, receiverName: string, callType: CallType) => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => Promise<void>;
    endCall: () => Promise<void>;

    toggleAudio: () => void;
    toggleVideo: () => void;
    toggleSpeaker: () => void;
    switchCamera: () => void;

    localVideoTrack: ICameraVideoTrack | null;
    localAudioTrack: IMicrophoneAudioTrack | null;
    remoteUsers: IAgoraRTCRemoteUser[];

    rtcClient: IAgoraRTCClient | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within CallProvider');
    return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentCall, setCurrentCall] = useState<CallData | null>(null);
    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    const [rtcClient, setRtcClient] = useState<IAgoraRTCClient | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

    const rtcClientRef = useRef<IAgoraRTCClient | null>(null);

    // Initialize Agora Client
    useEffect(() => {
        if (typeof window !== 'undefined' && Platform.OS === 'web' && AgoraRTC) {
            const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

            client.on('user-published', async (user: any, mediaType: any) => {
                console.log('📢 User published:', user.uid, mediaType);
                await client.subscribe(user, mediaType);

                setRemoteUsers((prev) => {
                    if (prev.find((u) => u.uid === user.uid)) return prev;
                    return [...prev, user];
                });
            });

            client.on('user-unpublished', (user: any, mediaType: any) => {
                console.log('📢 User unpublished:', user.uid, mediaType);
            });

            client.on('user-left', (user: any) => {
                console.log('📢 User left:', user.uid);
                setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
            });

            rtcClientRef.current = client;
            setRtcClient(client);

            return () => client.removeAllListeners();
        }
    }, []);

    // Generate Token
    const generateRTCToken = async (channelName: string, uid: string): Promise<string> => {
        const response = await axios.post(RTC_TOKEN_API, { channelName, uid });
        if (response.data.status !== 1) throw new Error('Token generation failed');
        return response.data.token;
    };

    // Start Call
    const startCall = async (receiverId: string, receiverName: string, callType: CallType) => {
        if (typeof window === 'undefined' || Platform.OS !== 'web') {
            Alert.alert('Not Supported', 'Calling works only on web.');
            return;
        }

        if (!rtcClientRef.current) throw new Error('RTC client not initialized');

        const currentUserId = (await AsyncStorage.getItem('USERID')) || 'user_' + Date.now();
        const currentUserName = (await AsyncStorage.getItem('USERNAME')) || 'User';

        const channelName = `call_${currentUserId}_${receiverId}_${Date.now()}`;

        const callData: CallData = {
            callId: channelName,
            callType,
            callerId: currentUserId,
            callerName: currentUserName,
            receiverId,
            receiverName,
            channelName,
            status: 'calling',
        };

        setCurrentCall(callData);
        setCallStatus('calling');

        const token = await generateRTCToken(channelName, currentUserId);

        await rtcClientRef.current.join(APP_ID, channelName, token, currentUserId);

        if (callType === 'video') {
            const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            setLocalAudioTrack(audioTrack);
            setLocalVideoTrack(videoTrack);
            await rtcClientRef.current.publish([audioTrack, videoTrack]);
        } else {
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            setLocalAudioTrack(audioTrack);
            await rtcClientRef.current.publish(audioTrack);
        }
    };

    // Accept Call
    const acceptCall = async () => {
        if (!currentCall || !rtcClientRef.current) return;

        setCallStatus('connected');

        const uid = (await AsyncStorage.getItem('USERID')) || 'user_' + Date.now();
        const token = await generateRTCToken(currentCall.channelName, uid);

        await rtcClientRef.current.join(APP_ID, currentCall.channelName, token, uid);

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
    };

    // Reject Call
    const rejectCall = async () => {
        setCallStatus('ended');

        setTimeout(() => {
            setCurrentCall(null);
            setCallStatus('idle');
        }, 1000);
    };

    // End Call
    const endCall = async () => {
        if (localAudioTrack) localAudioTrack.close();
        if (localVideoTrack) localVideoTrack.close();

        if (rtcClientRef.current) await rtcClientRef.current.leave();

        setRemoteUsers([]);
        setCallStatus('ended');
        setIsAudioMuted(false);
        setIsVideoMuted(false);

        setTimeout(() => {
            setCurrentCall(null);
            setCallStatus('idle');
        }, 800);
    };

    // Controls
    const toggleAudio = () => {
        if (localAudioTrack) {
            const m = !isAudioMuted;
            localAudioTrack.setEnabled(!m);
            setIsAudioMuted(m);
        }
    };

    const toggleVideo = () => {
        if (localVideoTrack) {
            const m = !isVideoMuted;
            localVideoTrack.setEnabled(!m);
            setIsVideoMuted(m);
        }
    };

    const toggleSpeaker = () => setIsSpeakerOn((p) => !p);

    const switchCamera = async () => {
        if (localVideoTrack) {
            try {
                const label = localVideoTrack.getTrackLabel();
                await localVideoTrack.setDevice(label.includes('front') ? 'back' : 'front');
            } catch (e) {
                console.log('Camera switch error:', e);
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
