"use client"

import Clipboard from "@react-native-clipboard/clipboard"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useState } from "react"
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
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useStarredMessages } from "../context/StarredMessagesContext"
import type { RootStackParamList } from "../navigation/types"
import BackButton from "./BackButton"
import { openDocumentPicker } from "./DocumentPicker"
import { openGallery } from "./GalleryPicker"
import LocationModal from "./LocationModal"
import MarqueeText from "./MarqueeText"
import MessageOptionsModal from "./MessageOptionsModal"
import QuizPollModal from "./QuizPollModal"
import AddMemberModal from "./add-member"

declare global {
    interface MediaStreamConstraints {
        video?: boolean | MediaTrackConstraints
        audio?: boolean | MediaTrackConstraints
    }

    class MediaRecorder {
        constructor(stream: MediaStream, options?: MediaRecorderOptions)
        ondataavailable: ((this: MediaRecorder, ev: BlobEvent) => any) | null
        onstop: ((this: MediaRecorder, ev: Event) => any) | null
        start: () => void
        stop: () => void
    }
    interface BlobEvent extends Event {
        readonly data: Blob
    }
    interface MediaStream {}
    interface MediaTrackConstraints {}
    interface MediaRecorderOptions {}

    interface Navigator {
        mediaDevices: {
            getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>
        }
    }
    const navigator: Navigator;
    // FIX: Declare document as an existing global variable of type any to satisfy TypeScript outside of a DOM environment.
    const document: any;
}

const { width } = Dimensions.get("window")

type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">
type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>

interface Message {
    id: string
    text: string
    isSent: boolean
    timestamp: string
    status: "sent" | "delivered" | "read"
}

export default function ChatThread({
    channel,
    onOpenProfile,
    onGroupCreated,
}: {
    channel: { id: string; name: string }
    onOpenProfile: () => void
    onGroupCreated?: (group: any) => void
}) {
    const route = useRoute<ChatScreenRouteProp>()
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

    const [messages, setMessages] = useState<Message[]>([
        { id: "1", text: "Hi there! How are you?", isSent: false, timestamp: "10:10", status: "read" },
        { id: "2", text: "I am good, fine @@@@!", isSent: true, timestamp: "10:11", status: "read" },
        { id: "3", text: "Great faculty 😊", isSent: false, timestamp: "10:12", status: "read" },
    ])
    const handleOpenCamera = () => {
        navigation.navigate("Camera")
    }
    const [newMessage, setNewMessage] = useState("")
    const [showAttachments, setShowAttachments] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [recording, setRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [chunks, setChunks] = useState<BlobPart[]>([])
    const [optionsModalVisible, setOptionsModalVisible] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const { addStarredMessage } = useStarredMessages()
    const [locationVisible, setLocationVisible] = useState<boolean>(false)
    const [showAddMemberModal, setShowAddMemberModal] = useState(false)
    const [chatMembers, setChatMembers] = useState<string[]>([])

    const handlePoll = () => {
        setModalVisible(true)
    }

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            setMessages([
                ...messages,
                {
                    id: Date.now().toString(),
                    text: newMessage,
                    isSent: true,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    status: "sent",
                },
            ])
            setNewMessage("")
        }
    }
    const handleDocument = () => {
        openDocumentPicker((fileName) => {
            setMessages([
                ...messages,
                {
                    id: Date.now().toString(),
                    text: `📄 Document: ${fileName}`,
                    isSent: true,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    status: "sent",
                },
            ])
        })
    }

    const handleGallery = () => {
        setShowAttachments(false)
    }

    const handleCamera = () => {
        setShowAttachments(false)
        navigation.navigate("Camera")
    }

    const handleAddMember = (contact: { id: string; name: string; phone: string }) => {
        setChatMembers([...chatMembers, contact.id])
        Alert.alert("Success", `${contact.name} added to the chat`)
    }

    const handleSendLocation = (coords: { latitude: number; longitude: number }) => {
        const locationMessage: Message = {
            id: Date.now().toString(),
            text: `📍 Location: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`,
            isSent: true,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "sent",
        }
        setMessages((prevMessages) => [...prevMessages, locationMessage])
        setLocationVisible(false)
    }

    const handleAudio = async () => {
        if (typeof MediaRecorder === 'undefined' || typeof navigator.mediaDevices === 'undefined') {
            console.error("MediaRecorder or navigator.mediaDevices not available. Are you running in a web environment or using a suitable polyfill?");
            return;
        }

        if (!mediaRecorder) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                const recorder = new MediaRecorder(stream)

                recorder.ondataavailable = (e: BlobEvent) => {
                    setChunks((prev: BlobPart[]) => [...prev, e.data])
                }

                recorder.onstop = () => {
                    const blob = new Blob(chunks as any, { type: "audio/webm" } as any)
                    const url = URL.createObjectURL(blob)
                    console.log("Audio saved:", url)

                    if (typeof document !== 'undefined' && document.createElement) {
                        const a = document.createElement("a")
                        a.href = url
                        a.download = "recording.webm"
                        a.click()
                    }

                    setChunks([])
                }

                recorder.start()
                setMediaRecorder(recorder)
                console.log("Recording started...")
            } catch (err) {
                console.error("Error accessing microphone:", err)
            }
        } else {
            mediaRecorder.stop()
            setMediaRecorder(null)
            console.log("Recording stopped...")
        }
    }
    const handleOpenGallery = () => {
        openGallery((imageUri: string) => {
            const message: Message = {
                id: Date.now().toString(),
                text: "📷 Image: " + imageUri,
                isSent: true,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                status: "sent",
            }
            setMessages([...messages, message])
        })
    }

    const renderMessage = ({ item }: { item: Message }) => (
        <TouchableOpacity
            onLongPress={() => {
                setSelectedMessage(item)
                setOptionsModalVisible(true)
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
    )

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
                    <TouchableOpacity style={styles.actionButton}>
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
                <TouchableOpacity style={styles.attachButtons} onPress={() => setShowAddMemberModal(true)}>
                    <Ionicons name="add" size={40} color="#000" />
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton} onPress={() => setShowAttachments(!showAttachments)}>
                        <Ionicons name="add" size={26} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cameraButton} onPress={handleOpenCamera}>
                        <Ionicons name="camera" size={20} color="#000000ff" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message..."
                        placeholderTextColor="#000000ff"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />

                    {newMessage.trim().length > 0 ? (
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleAudio}
                        >
                            <Ionicons name="mic" size={20} color="#ffffffff" />
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
            <MessageOptionsModal
                visible={optionsModalVisible}
                onClose={() => setOptionsModalVisible(false)}
                onReply={() => {
                    setNewMessage(`Replying to: ${selectedMessage?.text}`)
                    setOptionsModalVisible(false)
                }}
                onCopy={() => {
                    Clipboard.setString(selectedMessage?.text || "")

                    setOptionsModalVisible(false)
                }}
                onPin={() => {
                    Alert.alert("Pinned", "Message pinned successfully")
                    setOptionsModalVisible(false)
                }}
                onUnpin={() => {
                    Alert.alert("Unpinned", "Message unpinned successfully")
                    setOptionsModalVisible(false)
                }}
                onStar={() => {
                    if (selectedMessage) {
                        addStarredMessage({
                            id: selectedMessage.id,
                            text: selectedMessage.text,
                            senderName: channel.name || "User",
                            timestamp: new Date(),
                            chatName: channel.name || "Unknown Chat",
                            type: "text",
                        })
                        Alert.alert("Starred", "Message starred successfully")
                        setOptionsModalVisible(false)
                    }
                }}
                onDelete={() => {
                    setMessages(messages.filter((msg) => msg.id !== selectedMessage?.id))
                    setOptionsModalVisible(false)
                }}
                isPinned={false}
            />
            <Modal
                visible={showAttachments}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAttachments(false)}
            >
                <TouchableOpacity style={styles.attachmentOverlay} onPress={() => setShowAttachments(false)}>
                    <View style={styles.attachmentContainer}>
                        <View style={styles.attachmentHeader}>
                            <Text style={styles.attachmentTitle}>Share Content</Text>
                        </View>

                        <View style={styles.attachmentGrid}>
                            <View style={styles.attachmentRow}>
                                <TouchableOpacity style={styles.attachmentItem} onPress={handleOpenGallery}>
                                    <View style={[styles.attachmentIcon, { backgroundColor: "#9C27B0" }]}>
                                        <Ionicons name="images" size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.attachmentLabel}>Gallery</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.attachmentItem} onPress={handleCamera}>
                                    <View style={[styles.attachmentIcon, { backgroundColor: "#FF5722" }]}>
                                        <Ionicons name="camera" size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.attachmentLabel}>Camera</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.attachmentItem} onPress={() => setLocationVisible(true)}>
                                    <View style={[styles.attachmentIcon, { backgroundColor: "#4CAF50" }]}>
                                        <Ionicons name="location" size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.attachmentLabel}>Location</Text>
                                </TouchableOpacity>

                                <LocationModal
                                    visible={locationVisible}
                                    onClose={() => setLocationVisible(false)}
                                    onSend={handleSendLocation}
                                />
                            </View>

                            <View style={styles.attachmentRow}>
                                <TouchableOpacity style={styles.attachmentItem} onPress={handleDocument}>
                                    <View style={[styles.attachmentIcon, { backgroundColor: "#673AB7" }]}>
                                        <Ionicons name="document" size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.attachmentLabel}>Document</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.attachmentItem} onPress={handleAudio}>
                                    <View style={[styles.attachmentIcon, { backgroundColor: "#FF9800" }]}>
                                        <Ionicons name="mic" size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.attachmentLabel}>Audio</Text>
                                </TouchableOpacity>

                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity style={{ padding: 10 }} onPress={handlePoll}>
                                        <View style={[styles.attachmentIcon, { backgroundColor: "#673AB7" }]}>
                                            <MaterialIcons name="poll" size={24} color="#fff" />
                                        </View>
                                        <Text>Poll / Quiz</Text>
                                    </TouchableOpacity>

                                    <QuizPollModal visible={modalVisible} onClose={() => setModalVisible(false)} />
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <AddMemberModal
                visible={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                onGroupCreated={(group) => {
                    if (onGroupCreated) {
                        onGroupCreated(group)
                    }
                    setShowAddMemberModal(false)
                }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
    backButton: { marginRight: 12 },
    contactInfo: { flex: 1 },
    contactDetails: {},
    contactName: { fontSize: 16, fontWeight: "600" },
    contactNumber: { fontSize: 12, color: "#666" },
    headerActions: { flexDirection: "row" },
    actionButton: { marginLeft: 12 },
    cameraButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    attachButtons: {
        alignSelf: "flex-end",
        margin: 30,
        backgroundColor: "#c4e0daff",
        borderRadius: 30,
    },
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

    inputContainer: { flexDirection: "row", alignItems: "center", padding: 12, borderTopWidth: 1, borderColor: "#eee" },
    attachButton: { marginRight: 8 },
    textInput: {
        flex: 1,
        fontSize: 15,
        padding: 10,
        backgroundColor: "#f3f3f3",
        borderRadius: 20,
        textAlign: "left",
        color: "#000",
    },
    sendButton: { marginLeft: 8, backgroundColor: "#0d0c0e", padding: 10, borderRadius: 20 },

    attachmentOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    attachmentContainer: {
        backgroundColor: "#fff",
        padding: 20,
        width: 700,
        flex: 0.5,
        borderRadius: 50,
        alignSelf: "center",
    },
    attachmentTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },

    attachmentHeader: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },

    attachmentGrid: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 30,

        alignSelf: "center",
    },
    attachmentRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    attachmentItem: {
        alignItems: "center",
        width: (width - 600) / 6,
    },
    attachmentIcon: {
        width: 65,
        height: 66,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    attachmentLabel: {
        fontSize: 12,
        color: "#000000ff",
        textAlign: "center",
        fontWeight: "500",
    },
})