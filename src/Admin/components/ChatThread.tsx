import Clipboard from "@react-native-clipboard/clipboard";
import { useNavigation, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
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

const CURRENT_USER_ID = "6614140024479903b22b1111";
const CURRENT_USER_TYPE = "Faculty";

const RTM_TOKEN_API_URL = "http://localhost:5200/web/agora/generate-rtm-token";
const SEND_MSG_API_URL = "http://localhost:5200/web/messages/send-msg";
const SHOW_MSG_API_URL = "http://localhost:5200/web/messages/show-msg";
const APP_ID = "20e5fa9e1eb24b799e01c45eaca5c901";

export default function ChatThread({
    channel,
    onOpenProfile,
    onGroupCreated,
    backendToken, // ✅ JWT token passed from login
}: {
    channel: { id: string; name: string };
    onOpenProfile: () => void;
    onGroupCreated?: (group: any) => void;
    backendToken: string;
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

    const [rtmEngine, setRtmEngine] = useState<any>(null);
    const [agoraToken, setAgoraToken] = useState<string | null>(null);
    const channelRef = useRef(channel);

    const { addStarredMessage } = useStarredMessages();

    useEffect(() => {
        channelRef.current = channel;
    }, [channel]);

    // --- Fetch messages from backend ---
    const fetchMessages = useCallback(async () => {
        if (!backendToken) {
            Alert.alert("Authentication Error", "JWT token not available yet.");
            return;
        }

        try {
            const url = `${SHOW_MSG_API_URL}/${channel.id}/Student`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${backendToken}` },
            });

            const fetchedMsgs: Message[] = response.data.map((msg: any) => ({
                id: msg._id,
                text: msg.text,
                isSent: msg.senderId === CURRENT_USER_ID,
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                status: "read" as const,
            }));

            setMessages(fetchedMsgs);
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 401) {
                    Alert.alert("Access Denied", "Unauthorized. Token is invalid for fetching history.");
                } else if (error.response.status === 404) {
                    Alert.alert("Route Error", `Cannot GET ${error.config?.url}. Check your Express server route.`);
                }
            }
            console.error("Error fetching chat history:", error);
        }
    }, [channel.id, backendToken]);

    // --- Setup Agora RTM ---
    useEffect(() => {
        const setupAgora = async () => {
            if (rtmEngine) {
                try {
                    await rtmEngine.logout();
                    await rtmEngine.destroyClient();
                } catch (e) {
                    console.warn("Error cleaning up previous RTM client:", e);
                }
            }

            fetchMessages();

            try {
                const uid = CURRENT_USER_ID;
                const { data } = await axios.post(RTM_TOKEN_API_URL, { uid });
                const token = data.agoraToken;
                setAgoraToken(token);

                const engine = new (RtmEngineClass as any)();
                await engine.createInstance(APP_ID);

                engine.addListener("MessageReceived", (event: MessageEvent) => {
                    const msg = event as any;
                    const receivedChannelId = msg.channelId || msg.channelName;
                    if (receivedChannelId !== channelRef.current.id) return;

                    const incomingMsg: Message = {
                        id: Date.now().toString(),
                        text: msg.text || msg.message || "New message",
                        isSent: false,
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        status: "delivered",
                    };

                    setMessages(prev => [...prev, incomingMsg]);
                });

                await engine.loginV2(token, uid);
                await engine.joinChannel(channel.id);

                setRtmEngine(engine);
            } catch (err) {
                console.error("Agora RTM setup error:", err);
                Alert.alert("RTM Init Error", "Failed to initialize RTM engine.");
            }
        };

        setupAgora();

        return () => {
            if (rtmEngine) {
                rtmEngine.logout();
                rtmEngine.destroyClient();
            }
        };
    }, [channel.id, fetchMessages]);

    // --- Send message ---
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageText = newMessage.trim();
        const tempId = Date.now().toString();

        const newMsg: Message = {
            id: tempId,
            text: messageText,
            isSent: true,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "sent",
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");

        // Send via RTM
        if (rtmEngine && agoraToken) {
            try {
                await rtmEngine.sendMessageToChannel({ text: messageText }, channel.id);
            } catch (e) {
                console.error("RTM Send Error:", e);
            }
        } else {
            Alert.alert("Error", "RTM Engine not initialized. Message sent only to DB.");
        }

        // Send to backend
        try {
            if (!backendToken) throw new Error("Backend JWT missing");

            const response = await axios.post(SEND_MSG_API_URL, {
                receiverId: channel.id,
                receiverType: "Student",
                text: messageText,
            }, {
                headers: { Authorization: `Bearer ${backendToken}` },
            });

            setMessages(prev => prev.map(msg =>
                msg.id === tempId ? { ...msg, id: response.data._id, status: 'delivered' } : msg
            ));
        } catch (e) {
            console.error("DB Send Error:", e);
            Alert.alert("Persistence Failed", "Message sent real-time but failed to save in the database.");
        }
    };

    // --- Other handlers remain intact ---
    const handleOpenCamera = () => navigation.navigate("Camera");

    const handleDocument = () => {
        openDocumentPicker((fileName) => {
            const docMsg: Message = {
                id: Date.now().toString(),
                text: `📄 Document: ${fileName}`,
                isSent: true,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "sent",
        };
        setMessages(prev => [...prev, locationMessage]);
        setLocationVisible(false);
    };

    const handleAudio = async () => Alert.alert("Recording", "Audio recording feature coming soon!");

    const handleOpenGallery = () => {
        openGallery((imageUri: string) => {
            const message: Message = {
                id: Date.now().toString(),
                text: "📷 Image: " + imageUri,
                isSent: true,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate("LiveVideoCall", { channelName: channel.name })}
                    >
                        <Ionicons name="videocam" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
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
});