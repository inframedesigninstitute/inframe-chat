"use client";

import Clipboard from "@react-native-clipboard/clipboard";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { useEffect, useState } from "react";
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

// Agora
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

export default function ChatThread({
    channel,
    onOpenProfile,
    onGroupCreated,
}: {
    channel: { id: string; name: string };
    onOpenProfile: () => void;
    onGroupCreated?: (group: any) => void;
}) {
    const route = useRoute<ChatScreenRouteProp>();
    const navigation = useNavigation<ChatScreenNavigationProp>();

    // Messages per channel
    const [messages, setMessages] = useState<{ [channelId: string]: Message[] }>({});
    const [newMessage, setNewMessage] = useState("");
    const [showAttachments, setShowAttachments] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const { addStarredMessage } = useStarredMessages();
    const [locationVisible, setLocationVisible] = useState<boolean>(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [chatMembers, setChatMembers] = useState<string[]>([]);

    // Agora
    const [rtmEngine, setRtmEngine] = useState<any>(null);
    const APP_ID = "20e5fa9e1eb24b799e01c45eaca5c901";
    const API_URL = "http://localhost:5200/web/agora/generate-rtm-token"; // Replace with your backend

    useEffect(() => {
        const setupAgora = async () => {
            try {
                const uid = `user_${Date.now()}`;
                const { data } = await axios.post(API_URL, { uid });
                const token = data.agoraToken;

                const engine = new (RtmEngineClass as any)();
                await engine.createInstance(APP_ID);
                await engine.loginV2(token, uid);
                await engine.joinChannel(channel.id);

                engine.addListener("MessageReceived", (msg: MessageEvent) => {
                    const incomingMsg: Message = {
                        id: Date.now().toString(),
                        text: (msg as any).text || (msg as any).message || "New message",
                        isSent: false,
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        status: "delivered",
                    };

                    setMessages(prev => ({
                        ...prev,
                        [channel.id]: [...(prev[channel.id] || []), incomingMsg],
                    }));
                });

                setRtmEngine(engine);
            } catch (err) {
                console.log("Agora setup error:", err);
            }
        };

        setupAgora();

        return () => {
            if (rtmEngine) {
                rtmEngine.logout();
                rtmEngine.destroyClient();
            }
        };
    }, [channel.id]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const newMsg: Message = {
            id: Date.now().toString(),
            text: newMessage,
            isSent: true,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "sent",
        };

        setMessages(prev => ({
            ...prev,
            [channel.id]: [...(prev[channel.id] || []), newMsg],
        }));

        if (rtmEngine) {
            await rtmEngine.sendMessageToChannel({ text: newMessage }, channel.id);
        }

        setNewMessage("");
    };

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
            setMessages(prev => ({
                ...prev,
                [channel.id]: [...(prev[channel.id] || []), docMsg],
            }));
        });
    };

    const handleAddMember = (contact: { id: string; name: string; phone: string }) => {
        setChatMembers(prev => [...prev, contact.id]);
        Alert.alert("Success", `${contact.name} added to the chat`);
    };

    const handleSendLocation = (coords: { latitude: number; longitude: number }) => {
        const locationMessage: Message = {
            id: Date.now().toString(),
            text: `📍 Location: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`,
            isSent: true,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "sent",
        };
        setMessages(prev => ({
            ...prev,
            [channel.id]: [...(prev[channel.id] || []), locationMessage],
        }));
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
            setMessages(prev => ({
                ...prev,
                [channel.id]: [...(prev[channel.id] || []), message],
            }));
        });
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
            {/* Header */}
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
                    data={messages[channel.id] || []}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                />

                <TouchableOpacity style={styles.addButton} onPress={() => setShowAddMemberModal(true)}>
                    <Ionicons name="add" size={36} color="#000" />
                </TouchableOpacity>

                {/* Input Field */}
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

            {/* Modals */}
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
                    setMessages(prev => ({
                        ...prev,
                        [channel.id]: prev[channel.id]?.filter((msg) => msg.id !== selectedMessage?.id) || [],
                    }));
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
                onGroupCreated={(group) => {
                    onGroupCreated?.(group);
                    setShowAddMemberModal(false);
                }}
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
