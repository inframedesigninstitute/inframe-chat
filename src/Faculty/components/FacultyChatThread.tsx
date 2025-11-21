import Clipboard from "@react-native-clipboard/clipboard";
import { useNavigation, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// ✅ Conditional import for AudioRecorderPlayer (native only)
let AudioRecorderPlayer: any = null;
if (Platform.OS !== 'web') {
    try {
        AudioRecorderPlayer = require("react-native-audio-recorder-player").default;
    } catch (e) {
        console.warn("⚠️ AudioRecorderPlayer not available");
    }
}

import { useStarredMessages } from "../context/StarredMessagesContext";
import type { RootStackParamList } from "../navigation/types";
import BackButton from "./BackButton";
import { openDocumentPicker } from "./DocumentPicker";
import { openGallery } from "./GalleryPicker";
import LocationModal from "./LocationModal";
import MarqueeText from "./MarqueeText";
import MessageOptionsModal from "./MessageOptionsModal";
import QuizPollModal from "./QuizPollModal";
import AddMemberModal from "./add-member";

import AsyncStorage from "@react-native-async-storage/async-storage";
import RtmEngineClass, { MessageEvent } from "agora-react-native-rtm";

const { width } = Dimensions.get("window");

type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;
type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Message {
    id: string;
    text: string;
    isSent: boolean;
    timestamp: string;
    status: "sent" | "delivered" | "read";
}

const RTM_TOKEN_API_URL = "http://localhost:5200/web/agora/generate-rtm-token";
const SEND_MSG_API_URL = "http://localhost:5200/web/messages/send-msg";
const SHOW_MSG_API_URL = "http://localhost:5200/web/messages/show-msg";
const APP_ID = "20e5fa9e1eb24b799e01c45eaca5c901";

export default function ChatThread({
    channel,
    onOpenProfile,
    onGroupCreated,
    onNewMessage,
}: {
    channel: { id: string; name: string };
    onOpenProfile: () => void;
    onGroupCreated?: (group: any) => void;
    onNewMessage?: (channelId: string, message: string) => void;
}) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [showAttachments, setShowAttachments] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [locationVisible, setLocationVisible] = useState<boolean>(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>("");

    const [agoraToken, setagoraToken] = useState<string | null>(null);
    const [rtmEngine, setRtmEngine] = useState<any>(null);
    const channelRef = useRef(channel);

    // 🎤 Audio Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recordingUri, setRecordingUri] = useState<string>("");
    const audioRecorderPlayer = useRef<any>(null);
    const recordingInterval = useRef<any>(null);
    const recordingAnimation = useRef(new Animated.Value(1)).current;

    const { addStarredMessage } = useStarredMessages();

    useEffect(() => {
        channelRef.current = channel;
    }, [channel]);

    // 🎤 Initialize Audio Recorder (Mobile only)
    useEffect(() => {
        // Only initialize on native platforms (iOS/Android)
        if (Platform.OS === 'web') {
            console.log("⚠️ Audio recording not supported on web");
            return;
        }

        const initRecorder = () => {
            try {
                if (!AudioRecorderPlayer) {
                    console.warn("⚠️ AudioRecorderPlayer not available");
                    return;
                }
                audioRecorderPlayer.current = new AudioRecorderPlayer();
                console.log("✅ Faculty: Audio recorder initialized");
            } catch (e) {
                console.warn("⚠️ Faculty: Audio recorder init failed:", e);
            }
        };
        initRecorder();

        return () => {
            // Cleanup on unmount
            if (isRecording && audioRecorderPlayer.current) {
                try {
                    audioRecorderPlayer.current.stopRecorder();
                } catch (e) {
                    console.warn("Cleanup error:", e);
                }
            }
            if (recordingInterval.current) {
                clearInterval(recordingInterval.current);
            }
        };
    }, []);

    // ✅ Get current user ID from AsyncStorage
    useEffect(() => {
        const loadCurrentUserId = async () => {
            try {
                let storedUserId = await AsyncStorage.getItem('USERID');

                if (!storedUserId) {
                    console.warn("⚠️ USERID not found in AsyncStorage. Using fallback...");
                    // Fallback: Use a default faculty ID for testing
                    storedUserId = "faculty_default_001";
                    await AsyncStorage.setItem('USERID', storedUserId);
                }

                setCurrentUserId(storedUserId);
                console.log("✅ Faculty Current User ID loaded:", storedUserId);
            } catch (error) {
                console.error("Error loading user ID:", error);
                // Emergency fallback
                setCurrentUserId("faculty_fallback_001");
            }
        };
        loadCurrentUserId();
    }, []);

    const fetchMessages = useCallback(async (userId: string) => {
        try {
            const authToken = await AsyncStorage.getItem('FACULTYTOKEN');
            if (!authToken) {
                Alert.alert("Authentication Error", "Token not available yet.");
                return;
            }

            // ✅ Backend only supports personal chats
            const url = `${SHOW_MSG_API_URL}/${userId}`;

            console.log(`Faculty Fetching messages from:`, url);

            const response = await axios.post(
                url,
                {},  // Empty body - authMiddleware provides user data
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Faculty Fetched Messages:", response.data);
            console.log('res', response)

            if (response.status === 200) {

                const msgsArray = Array.isArray(response.data.Message)
                    ? response.data.Message
                    : [];

                const transformedMessages = msgsArray.map((msg: any) => ({
                    id: String(msg._id),
                    text: msg.text,
                    isSent: msg.senderId === currentUserId,
                    timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    status: "delivered",
                }));

                // ⭐ REPLACE ALL MESSAGES (correct behavior on fetch)
                setMessages(transformedMessages);
            }


            // ⭐ Transform backend messages for UI - FIXED sender check
            // const transformedMessages = response.data.map((msg: any) => {
            //     // ✅ Get sender ID from multiple possible fields and convert to string
            //     const msgSenderId = String(msg.senderId || msg.sender?._id || msg.sender?.id || msg.from || '');

            //     // ✅ Get current user ID and convert to string for comparison
            //     const currentUserIdStr = String(currentUserId || '');

            //     // ✅ Compare both as strings (handles ObjectId vs string comparison)
            //     const isSentByMe = msgSenderId === currentUserIdStr;

            //     console.log(`📨 Faculty Message: "${msg.text?.substring(0, 20)}..."`);
            //     console.log(`   ├─ Sender ID: "${msgSenderId}" (type: ${typeof msgSenderId})`);
            //     console.log(`   ├─ Current User: "${currentUserIdStr}" (type: ${typeof currentUserIdStr})`);
            //     console.log(`   ├─ Match: ${msgSenderId === currentUserIdStr}`);
            //     console.log(`   └─ isSent: ${isSentByMe} ${isSentByMe ? '👉 RIGHT' : '👈 LEFT'}`);

            //     return {
            //         id: msg._id,
            //         text: msg.text,
            //       isSent: true,
            //         timestamp: new Date(msg.createdAt || msg.timestamp || Date.now()).toLocaleTimeString(undefined, {
            //             hour: "2-digit",
            //             minute: "2-digit",
            //         }),
            //         status: "delivered",
            //     };
            // });

            // setMessages(transformedMessages);

        } catch (error) {
            console.error("Error fetching messages:", error);
            Alert.alert("Error", "Failed to load messages.");
        }
    }, [currentUserId]);

    console.log('all msg', messages);





    useEffect(() => {
        const setupAgora = async () => {
            // Wait for currentUserId to be loaded
            if (!currentUserId) {
                console.log("⏳ Waiting for faculty current user ID...");
                return;
            }

            console.log("🚀 Faculty: Starting Agora RTM setup with user ID:", currentUserId);

            if (rtmEngine) {
                try {
                    await rtmEngine.logout();
                    await rtmEngine.destroyClient();
                } catch (e) {
                    console.warn("Error cleaning previous RTM client:", e);
                }
            }

            try {
                const uid = currentUserId;

                // 👉 Step 1: Fetch RTM Token FIRST
                const { data } = await axios.post(RTM_TOKEN_API_URL, { uid });
                const agoraToken = data.agoraToken;

                // Save agora token
                setagoraToken(agoraToken);
                console.log("Faculty Agora Token:", agoraToken);

                // 👉 Step 2: Now safely call fetchMessages after token is set
                const userId = channel.id;

                fetchMessages(userId);

                // 👉 Step 3: Setup RTM
                const engine = new (RtmEngineClass as any)();
                await engine.createInstance(APP_ID);

                engine.addListener("MessageReceived", (event: MessageEvent) => {
                    const msg = event as any;

                    try {
                        // ✅ Check if this is a call notification
                        const messageText = msg.text || msg.message || "";
                        const callData = JSON.parse(messageText);

                        if (callData.type === 'video_call' || callData.type === 'audio_call') {
                            console.log('📞 Faculty: Incoming call notification:', callData);

                            // Show alert for incoming call
                            Alert.alert(
                                `Incoming ${callData.type === 'video_call' ? 'Video' : 'Audio'} Call`,
                                `${callData.callerName} is calling you`,
                                [
                                    {
                                        text: 'Decline',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Accept',
                                        onPress: () => {
                                            if (callData.type === 'video_call') {
                                                navigation.navigate('LiveVideoCall', {
                                                    channelName: callData.channelName
                                                });
                                            } else {
                                                navigation.navigate('AudioCall', {
                                                    contactName: callData.callerName,
                                                    contactNumber: callData.callerId,
                                                });
                                            }
                                        },
                                    },
                                ],
                            );
                            return;
                        }
                    } catch (e) {
                    }

                    // Regular text message
                    const incomingMsg: Message = {
                        id: Date.now().toString(),
                        text: msg.text || msg.message || "New message",
                        isSent: true,
                        timestamp: new Date().toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        status: "delivered",
                    };

                    setMessages(prev => [...prev, incomingMsg]);

                    // ✅ Notify parent component to update chat list
                    if (onNewMessage) {
                        onNewMessage(channel.id, msg.text || msg.message || "New message");
                    }
                });

                await engine.loginV2(agoraToken, uid);
                await engine.joinChannel(channel.id);

                setRtmEngine(engine);

            } catch (err: any) {
                console.error("Faculty Agora RTM setup error:", err);
                // ✅ Don't show alert on web - RTM doesn't work on web platform
                if (Platform.OS !== 'web') {
                    Alert.alert("RTM Init Error", "Failed to initialize RTM engine.");
                }
            }
        };

        setupAgora();

        return () => {
            if (rtmEngine) {
                rtmEngine.logout();
                rtmEngine.destroyClient();
            }
        };
    }, [channel.id, currentUserId]);

    // ✅ Handle Video Call
    const handleVideoCall = async () => {
        try {
            console.log('📹 Faculty: Starting video call with:', channel.name);

            const callChannelName = `call_${currentUserId}_${channel.id}_${Date.now()}`;

            // Send RTM notification
            if (rtmEngine) {
                const callData = {
                    type: 'video_call',
                    callerId: currentUserId,
                    callerName: 'Faculty',
                    channelName: callChannelName,
                    timestamp: Date.now(),
                };

                try {
                    await rtmEngine.sendMessageToPeer({
                        text: JSON.stringify(callData),
                    }, channel.id);
                    console.log('✅ Call notification sent');
                } catch (rtmError) {
                    console.error('❌ RTM send error:', rtmError);
                }
            }

            // Navigate to LiveVideoCall
            navigation.navigate('LiveVideoCall', { channelName: callChannelName });

        } catch (error: any) {
            console.error('❌ Video call error:', error);
            Alert.alert('Call Failed', 'Unable to start video call');
        }
    };

    // ✅ Handle Audio Call
    const handleAudioCall = async () => {
        try {
            console.log('📞 Faculty: Starting audio call with:', channel.name);

            const callChannelName = `call_${currentUserId}_${channel.id}_${Date.now()}`;

            // Send RTM notification
            if (rtmEngine) {
                const callData = {
                    type: 'audio_call',
                    callerId: currentUserId,
                    callerName: 'Faculty',
                    channelName: callChannelName,
                    timestamp: Date.now(),
                };

                try {
                    await rtmEngine.sendMessageToPeer({
                        text: JSON.stringify(callData),
                    }, channel.id);
                    console.log('✅ Call notification sent');
                } catch (rtmError) {
                    console.error('❌ RTM send error:', rtmError);
                }
            }

            // Navigate to AudioCall
            navigation.navigate('AudioCall', {
                contactName: channel.name,
                contactNumber: channel.id,
            });

        } catch (error) {
            console.error('❌ Audio call error:', error);
            Alert.alert('Call Failed', 'Unable to start audio call');
        }
    };



    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageText = newMessage.trim();
        const tempId = Date.now().toString();

        const newMsg: Message = {
            id: tempId,
            text: messageText,
            isSent: true,
            timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
            status: "sent",
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");

        const storedToken = await AsyncStorage.getItem('FACULTYTOKEN');
        const userId = await AsyncStorage.getItem('USERID');

        // ✅ Notify parent component to update chat list with sent message
        if (onNewMessage) {
            onNewMessage(channel.id, messageText);
        }

        if (rtmEngine) {
            try {
                await rtmEngine.sendMessageToChannel({ text: messageText }, channel.id);
            } catch (e) {
                console.error("Faculty RTM Send Error:", e);
            }
        }

        try {
            const receiverId = channel.id;

            const response = await axios.post(
                SEND_MSG_API_URL,
                {
                    receiverId,  // ✅ Backend needs this
                    text: messageText,  // ✅ Backend needs this
                    // senderId & senderType automatically set by authMiddleware
                },
                {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setMessages(prev =>
                prev.map(msg =>
                    msg.id === tempId ? { ...msg, id: response.data._id, status: 'delivered' } : msg
                )
            );

        } catch (e) {
            console.error("Faculty DB Send Error:", e);
            Alert.alert("Persistence Failed", "Message sent real-time but failed to save in the database.");
        }
    };



    // Corrected and retained declaration of handleOpenCamera
    const handleOpenCamera = () =>
        navigation.navigate("Camera", {
            onPictureTaken: (imageUri: string) => {
                const message: Message = {
                    id: Date.now().toString(),
                    text: "📷 Image: " + imageUri,
                    isSent: true,
                    timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
                    status: "sent",
                };
                setMessages(prev => [...prev, message]);
            }
        } as never); // Used 'as never' to bypass the type issue for the sake of compiling the provided logic.
    // NOTE: A proper fix would involve updating RootStackParamList to include the 'onPictureTaken' prop for the 'Camera' route.

    const handleDocument = () => {
        openDocumentPicker((fileName) => {
            const docMsg: Message = {
                id: Date.now().toString(),
                text: `📄 Document: ${fileName}`,
                isSent: true,
                timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
                status: "sent",
            };
            setMessages(prev => [...prev, docMsg]);
        });
    };

    const handleSendLocation = (coords: { latitude: number; longitude: number }) => {
        const locationMessage: Message = {
            id: Date.now().toString(),
            text: `📍 Location: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`,
            isSent: true,
            timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
            status: "sent",
        };
        setMessages(prev => [...prev, locationMessage]);
        setLocationVisible(false);
    };

    // 🎤 Start Audio Recording
    const handleStartRecording = async () => {
        try {
            // Check if running on web
            if (Platform.OS === 'web') {
                Alert.alert("Not Supported", "Voice recording is only available on mobile devices (iOS/Android)");
                return;
            }

            if (!audioRecorderPlayer.current) {
                Alert.alert("Error", "Audio recorder not initialized");
                return;
            }

            console.log("🎤 Faculty: Starting audio recording...");
            setIsRecording(true);
            setRecordingDuration(0);

            // Start recording
            const path = Platform.select({
                ios: 'recording.m4a',
                android: `recording_${Date.now()}.mp3`,
                web: 'recording.webm',
            }) || 'recording.mp3';

            const uri = await audioRecorderPlayer.current.startRecorder(path);
            setRecordingUri(uri);
            console.log("✅ Faculty: Recording started:", uri);

            // Start timer
            recordingInterval.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

            // Start pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(recordingAnimation, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(recordingAnimation, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: false,
                    }),
                ])
            ).start();

        } catch (error) {
            console.error("❌ Faculty: Recording error:", error);
            Alert.alert("Recording Error", "Failed to start recording");
            setIsRecording(false);
        }
    };

    // 🛑 Stop and Send Recording
    const handleStopAndSendRecording = async () => {
        try {
            if (!audioRecorderPlayer.current) return;

            console.log("🛑 Faculty: Stopping recording...");

            if (recordingInterval.current) {
                clearInterval(recordingInterval.current);
                recordingInterval.current = null;
            }

            const result = await audioRecorderPlayer.current.stopRecorder();
            audioRecorderPlayer.current.removeRecordBackListener();
            console.log("✅ Faculty: Recording stopped:", result);

            setIsRecording(false);

            // Send the audio file
            if (recordingUri || result) {
                await sendAudioMessage(recordingUri || result);
            }

            setRecordingUri("");
            setRecordingDuration(0);

        } catch (error) {
            console.error("❌ Faculty: Stop recording error:", error);
            Alert.alert("Error", "Failed to stop recording");
        }
    };

    // ❌ Cancel Recording
    const handleCancelRecording = async () => {
        try {
            if (!audioRecorderPlayer.current) return;

            console.log("❌ Faculty: Cancelling recording...");

            if (recordingInterval.current) {
                clearInterval(recordingInterval.current);
                recordingInterval.current = null;
            }

            await audioRecorderPlayer.current.stopRecorder();
            audioRecorderPlayer.current.removeRecordBackListener();

            setIsRecording(false);
            setRecordingUri("");
            setRecordingDuration(0);

            console.log("✅ Faculty: Recording cancelled");
        } catch (error) {
            console.error("❌ Faculty: Cancel recording error:", error);
        }
    };

    // 📤 Send Audio Message
    const sendAudioMessage = async (audioUri: string) => {
        try {
            console.log("📤 Faculty: Sending audio message:", audioUri);

            const storedToken = await AsyncStorage.getItem('FACULTYTOKEN');
            if (!storedToken) {
                Alert.alert("Error", "Auth token missing. Cannot send audio.");
                return;
            }

            const formData = new FormData();
            formData.append('receiverId', channel.id);
            formData.append('text', `🎤 Voice message (${recordingDuration}s)`);

            // Append the audio file
            const fileName = `audio_${Date.now()}.${Platform.OS === 'ios' ? 'm4a' : 'mp3'}`;
            const audioFile: any = {
                uri: audioUri,
                type: 'audio/mp4',
                name: fileName,
            };
            formData.append('files', audioFile);

            const response = await axios.post(
                `http://localhost:5200/web/messages/send-msg/${channel.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log("✅ Faculty: Audio message sent:", response.data);

            // Add to local messages
            const newMsg: Message = {
                id: response.data._id || Date.now().toString(),
                text: `🎤 Voice message (${recordingDuration}s)`,
                isSent: true,
                timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
                status: "delivered",
            };
            setMessages(prev => [...prev, newMsg]);

            // Notify parent to update chat list
            if (onNewMessage) {
                onNewMessage(channel.id, `🎤 Voice message (${recordingDuration}s)`);
            }

        } catch (error) {
            console.error("❌ Faculty: Send audio error:", error);
            Alert.alert("Error", "Failed to send audio message");
        }
    };

    const handleAudio = handleStartRecording;

    const handleOpenGallery = () => {
        openGallery((imageUri: string) => {
            const message: Message = {
                id: Date.now().toString(),
                text: "📷 Image: " + imageUri,
                isSent: true,
                timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
                status: "sent",
            };
            setMessages(prev => [...prev, message]);
        });
    };

    const handleGroupCreation = (members: any) => {
        if (!Array.isArray(members) || members.length === 0) {
            Alert.alert("Error", "No members selected for group creation.");
            setShowAddMemberModal(false);
            return;
        }

        const newGroup = {
            id: `group_${Date.now()}`,
            name: `Group with ${members.length} members`,
            members: members.map((m: any) => m.id),
        };
        Alert.alert("Group Created", `Group ${newGroup.name} created with ${members.length} members.`);

        onGroupCreated?.(newGroup);
        setShowAddMemberModal(false);
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <TouchableOpacity
            onLongPress={() => {
                setSelectedMessage(item);
                setOptionsModalVisible(true);
            }}
            activeOpacity={0.8}
        >
            <View style={[styles.messageContainer, item.isSent ? styles.sentMessage : styles.receivedMessage]}>
                <View style={[styles.messageBubble, item.isSent ? styles.sentBubble : styles.receivedBubble]}>
                    <Text style={[styles.messageText, item.isSent ? styles.sentText : styles.receivedText]}>{item.text}</Text>
                    <View style={styles.messageFooter}>
                        <Text style={styles.timestamp}>{item.timestamp}</Text>
                        {item.isSent && (
                            <Ionicons
                                name={item.status === "read" ? "checkmark-done" : "checkmark"}
                                size={12}
                                color={item.status === "read" ? "#4CAF50" : "#666"}
                            />
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <TouchableOpacity style={styles.contactInfo} onPress={onOpenProfile}>
                    <View style={styles.contactDetails}>
                        <Text style={styles.contactName}>{channel?.name || "User"}</Text>
                        <Text style={styles.contactNumber}>Online</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    {/* Video Call Button */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleVideoCall}
                    >
                        <Ionicons name="videocam" size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Audio Call Button */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleAudioCall}
                    >
                        <Ionicons name="call" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <MarqueeText
                text={`Chatting with ${channel?.name || "User"}`}
                speed={50}
                textStyle={{ color: "#2e7d32", fontSize: 14, fontWeight: "500" }}
                containerStyle={{ backgroundColor: "#e8f5e8", marginVertical: 4 }}
            />

            <KeyboardAvoidingView style={styles.messagesContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                />

                <TouchableOpacity style={styles.addButton} onPress={() => setShowAddMemberModal(true)}>
                    <Ionicons name="add" size={36} color="#000" />
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                    {isRecording ? (
                        // 🎤 Recording UI (WhatsApp-like)
                        <View style={styles.recordingContainer}>
                            <TouchableOpacity
                                style={styles.cancelRecordingButton}
                                onPress={handleCancelRecording}
                            >
                                <Ionicons name="trash" size={20} color="#FF3B30" />
                            </TouchableOpacity>

                            <View style={styles.recordingInfo}>
                                <Animated.View style={{ transform: [{ scale: recordingAnimation }] }}>
                                    <View style={styles.recordingDot} />
                                </Animated.View>
                                <Text style={styles.recordingTimer}>
                                    {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                                </Text>
                                <Text style={styles.recordingText}>Recording...</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.sendRecordingButton}
                                onPress={handleStopAndSendRecording}
                            >
                                <Ionicons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // 📝 Normal Message Input
                        <>
                            <TouchableOpacity style={styles.attachButton} onPress={() => setShowAttachments(!showAttachments)}>
                                <Ionicons name="add" size={26} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cameraButton} onPress={handleOpenCamera}>
                                <Ionicons name="camera" size={20} color="#000" />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Type a message..."
                                placeholderTextColor="#999"
                                value={newMessage}
                                onChangeText={setNewMessage}
                                multiline
                            />
                            {newMessage.trim() ? (
                                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                                    <Ionicons name="send" size={20} color="#fff" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.sendButton} onPress={handleAudio}>
                                    <Ionicons name="mic" size={20} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>

            <MessageOptionsModal
                visible={optionsModalVisible}
                onClose={() => setOptionsModalVisible(false)}
                onReply={() => {
                    setNewMessage(`Replying to: ${selectedMessage?.text}`);
                    setOptionsModalVisible(false);
                }}
                onCopy={() => {
                    Clipboard.setString(selectedMessage?.text || "");
                    setOptionsModalVisible(false);
                }}
                onPin={() => {
                    Alert.alert("Pinned", "Message pinned successfully");
                    setOptionsModalVisible(false);
                }}
                onUnpin={() => {
                    Alert.alert("Unpinned", "Message unpinned successfully");
                    setOptionsModalVisible(false);
                }}
                onStar={() => {
                    if (selectedMessage) {
                        addStarredMessage({
                            id: selectedMessage.id,
                            text: selectedMessage.text,
                            senderName: channel.name,
                            timestamp: new Date(),
                            chatName: channel.name,
                            type: "text",
                        });
                        Alert.alert("Starred", "Message starred successfully");
                        setOptionsModalVisible(false);
                    }
                }}
                onDelete={() => {
                    setMessages(prev => prev.filter((msg) => msg.id !== selectedMessage?.id));
                    setOptionsModalVisible(false);
                }}
                isPinned={false}
            />

            <Modal visible={showAttachments} transparent animationType="slide" onRequestClose={() => setShowAttachments(false)}>
                <TouchableOpacity style={styles.attachmentOverlay} onPress={() => setShowAttachments(false)}>
                    <View style={styles.attachmentContainer}>
                        <Text style={styles.attachmentTitle}>Share Content</Text>
                        <View style={styles.attachmentRow}>
                            <TouchableOpacity style={styles.attachmentItem} onPress={handleOpenGallery}>
                                <View style={[styles.attachmentIcon, { backgroundColor: "#9C27B0" }]}>
                                    <Ionicons name="images" size={24} color="#fff" />
                                </View>
                                <Text style={styles.attachmentText}>Gallery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.attachmentItem} onPress={handleOpenCamera}>
                                <View style={[styles.attachmentIcon, { backgroundColor: "#FF5722" }]}>
                                    <Ionicons name="camera" size={24} color="#fff" />
                                </View>
                                <Text style={styles.attachmentText}>Camera</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.attachmentItem} onPress={() => setLocationVisible(true)}>
                                <View style={[styles.attachmentIcon, { backgroundColor: "#4CAF50" }]}>
                                    <Ionicons name="location" size={24} color="#fff" />
                                </View>
                                <Text style={styles.attachmentText}>Location</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.attachmentRow}>
                            <TouchableOpacity style={styles.attachmentItem} onPress={handleDocument}>
                                <View style={[styles.attachmentIcon, { backgroundColor: "#673AB7" }]}>
                                    <Ionicons name="document" size={24} color="#fff" />
                                </View>
                                <Text style={styles.attachmentText}>Document</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.attachmentItem} onPress={handleAudio}>
                                <View style={[styles.attachmentIcon, { backgroundColor: "#FF9800" }]}>
                                    <Ionicons name="mic" size={24} color="#fff" />
                                </View>
                                <Text style={styles.attachmentText}>Audio</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.attachmentItem} onPress={() => setModalVisible(true)}>
                                <View style={[styles.attachmentIcon, { backgroundColor: "#3F51B5" }]}>
                                    <MaterialIcons name="poll" size={24} color="#fff" />
                                </View>
                                <Text style={styles.attachmentText}>Poll/Quiz</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <QuizPollModal visible={modalVisible} onClose={() => setModalVisible(false)} />
            <LocationModal visible={locationVisible} onClose={() => setLocationVisible(false)} onSend={handleSendLocation} />
            <AddMemberModal
                visible={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                onGroupCreated={handleGroupCreation}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
    contactInfo: { flex: 1 },
    contactDetails: {},
    contactName: { fontSize: 16, fontWeight: "600" },
    contactNumber: { fontSize: 12, color: "#666" },
    headerActions: { flexDirection: "row" },
    actionButton: { marginLeft: 12 },
    messagesContainer: { flex: 1 },
    messagesList: { flex: 1 },
    messagesContent: { padding: 12 },
    messageContainer: { marginVertical: 4 },
    sentMessage: { alignSelf: "flex-end" },
    receivedMessage: { alignSelf: "flex-start" },
    messageBubble: { padding: 12, borderRadius: 16 },
    sentBubble: { backgroundColor: "#2563eb" },
    receivedBubble: { backgroundColor: "#f3f3f3" },
    messageText: { fontSize: 14 },
    sentText: { color: "#fff" },
    receivedText: { color: "#000" },
    messageFooter: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    timestamp: { fontSize: 10, color: "#666" },
    addButton: { alignSelf: "flex-end", margin: 20, backgroundColor: "#c4e0da", borderRadius: 30, padding: 8 },
    inputContainer: { flexDirection: "row", alignItems: "center", padding: 12, borderTopWidth: 1, borderColor: "#eee" },
    attachButton: { marginRight: 8 },
    textInput: { flex: 1, fontSize: 15, padding: 10, backgroundColor: "#f3f3f3", borderRadius: 20, color: "#000" },
    sendButton: { marginLeft: 8, backgroundColor: "#000", padding: 10, borderRadius: 20 },
    cameraButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#e0e0e0", justifyContent: "center", alignItems: "center", marginRight: 8 },
    attachmentOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    attachmentContainer: { backgroundColor: "#fff", padding: 20, width: "90%", borderRadius: 20, alignSelf: "center", marginBottom: 30 },
    attachmentTitle: { fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 10 },
    attachmentRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
    attachmentItem: { alignItems: "center" },
    attachmentIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 6 },
    attachmentText: { fontSize: 12, textAlign: "center" },

    // 🎤 Recording Styles (WhatsApp-like)
    recordingContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingVertical: 8,
    },
    cancelRecordingButton: {
        padding: 10,
        backgroundColor: "#FFE5E5",
        borderRadius: 20,
        marginRight: 10,
    },
    recordingInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: 20,
        padding: 10,
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#FF3B30",
        marginRight: 8,
        
    },
    recordingTimer: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginRight: 8,
    },
    recordingText: {
        fontSize: 14,
        color: "#666",
    },
    sendRecordingButton: {
        marginLeft: 10,
        backgroundColor: "#25D366",
        padding: 12,
        borderRadius: 25,
    },
});