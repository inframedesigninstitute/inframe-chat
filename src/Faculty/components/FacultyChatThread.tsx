"use client"

import Clipboard from "@react-native-clipboard/clipboard"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useEffect, useState } from "react"
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
import { useAgoraRTM } from "../hooks/useAgoraRTM"
import type { RootStackParamList } from "../navigation/types"
import BackButton from "./BackButton"
import { openDocumentPicker } from "./DocumentPicker"
import { openGallery } from "./GalleryPicker"
import LocationModal from "./LocationModal"
import MarqueeText from "./MarqueeText"
import MessageOptionsModal from "./MessageOptionsModal"
import QuizPollModal from "./QuizPollModal"
import AddMemberModal from "./add-member"

// --- Newly added imports for API integration ---
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
// --------------------------------------------------

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
  interface MediaStream { }
  interface MediaTrackConstraints { }
  interface MediaRecorderOptions { }

  interface Navigator {
    mediaDevices: {
      getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>
    }
  }
  const navigator: Navigator
  const document: any
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
  userName?: string
}

export default function ChatThread({
  channel,
  onOpenProfile,
  onGroupCreated,
  userId = "user123",
  userName = "You",
}: {
  channel: { id: string; name: string; userType?: string } // note: userType optional, if you pass it backend will use it
  onOpenProfile: () => void
  onGroupCreated?: (group: any) => void
  userId?: string
  userName?: string
}) {
  const route = useRoute<ChatScreenRouteProp>()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const {
    messages: agoraMessages,
    isConnected,

    sendMessage: agoraSendMessage,
  } = useAgoraRTM({
    channelId: channel.id,
    userId,
    userName,
  })

  // initial sample messages (kept as you had them)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi there! How are you?",
      isSent: false,
      timestamp: "10:10",
      status: "read",
      userName: channel.name,
    },
    { id: "2", text: "I am good, fine!", isSent: true, timestamp: "10:11", status: "read", userName: userName },
    { id: "3", text: "Great! 😊", isSent: false, timestamp: "10:12", status: "read", userName: channel.name },
  ])

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

  // ----------------- API CONFIG -----------------
  const API_BASE = (process.env.BACKEND_URL as string) || "http://localhost:5200" // change to your backend url if needed

  // helper to find a saved auth token (tries common keys)
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const possibleKeys = ["token", "authToken", "studentToken", "facultyToken", "AdminToken"]
      for (const key of possibleKeys) {
        const t = await AsyncStorage.getItem(key)
        if (t) return t
      }
      return null
    } catch (err) {
      console.warn("getAuthToken error", err)
      return null
    }
  }
  // ------------------------------------------------

  // Fetch chat history from backend when component mounts or channel changes
  useEffect(() => {
    let mounted = true

    const fetchHistory = async () => {
      try {
        const token = await getAuthToken()
        // assume route: GET /api/messages/:userType/:userId
        const otherUserId = channel?.id
        const otherUserType = (channel?.userType || "student").toLowerCase() // default to 'student' if not provided
        if (!otherUserId) return

        const url = `${API_BASE}/api/messages/${otherUserType}/${otherUserId}`
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined

        const res = await axios.get(url, { headers })
        // If backend wraps in { status, msg, data } then adjust accordingly. Here we expect array of messages in res.data or res.data.data
        const msgs = Array.isArray(res.data) ? res.data : res.data?.data ?? []
        if (!mounted) return

        // map backend message shape -> Message (keep your isSent logic)
        const converted = msgs.map((m: any) => ({
          id: String(m._id ?? m.id ?? Date.now()), // fallback id
          text: m.text ?? "",
          isSent: String(m.senderId) === String(userId), // determine sent vs received
          timestamp:
            m.timestamp && typeof m.timestamp === "string"
              ? m.timestamp
              : m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : new Date(m.createdAt ?? Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "read" as const,
          userName: m.senderName ?? (String(m.senderId) === String(userId) ? userName : channel?.name ?? "User"),
        }))

        // Replace initial sample messages with fetched history
        setMessages(converted)
      } catch (err) {
        console.error("Failed to fetch chat history:", err)
        // keep existing messages if fetch fails
      }
    }

    fetchHistory()

    return () => {
      mounted = false
    }
  }, [channel?.id]) // re-run if channel changes

  // Merge in realtime agora messages — append (not overwrite)
  useEffect(() => {
    if (agoraMessages.length > 0) {
      const convertedMessages = agoraMessages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        isSent: msg.isSent,
        timestamp: msg.timestamp,
        status: "read" as const,
        userName: msg.userName,
      }))
      // append new messages to existing list (avoid erasing history)
      setMessages((prev) => {
        // naive dedupe: ignore incoming messages whose id already exists
        const existingIds = new Set(prev.map((p) => p.id))
        const toAdd = convertedMessages.filter((c) => !existingIds.has(c.id))
        return [...prev, ...toAdd]
      })
    }
  }, [agoraMessages])

  const handlePoll = () => {
    setModalVisible(true)
  }

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      // keep local message object for immediate UI response
      const localMsg: Message = {
        id: Date.now().toString(),
        text: newMessage,
        isSent: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
        userName: userName,
      }

      if (isConnected) {
        const success = await agoraSendMessage(newMessage)
        if (!success) {
          Alert.alert("Error", "Failed to send message via Agora RTM")
          // still try to save to DB so it's not lost
        } else {
          // optionally mark as delivered locally (you can update later via read receipts)
          localMsg.status = "delivered"
        }
      } else {
        // offline branch — still push local msg
      }

      // add local message to UI immediately
      setMessages((prev) => [...prev, localMsg])

      // Attempt to save message to backend DB
      try {
        const token = await getAuthToken()
        const otherUserId = channel?.id
        const otherUserType = (channel?.userType || "student").toLowerCase()

        if (otherUserId) {
          const url = `${API_BASE}/api/messages/send`
          const headers = token ? { Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" }
          // body according to your backend sendMsgController
          const body = {
            receiverId: otherUserId,
            receiverType: otherUserType,
            text: newMessage,
          }
          await axios.post(url, body, { headers })
          // backend returns saved message — you can merge it if you want
        }
      } catch (err) {
        console.error("Failed to save message to DB:", err)
      }

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
          userName: userName,
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
      userName: userName,
    }
    setMessages((prevMessages) => [...prevMessages, locationMessage])
    setLocationVisible(false)
  }

  const handleAudio = async () => {
    if (typeof MediaRecorder === "undefined" || typeof navigator.mediaDevices === "undefined") {
      console.error("MediaRecorder or navigator.mediaDevices not available")
      return
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

          if (typeof document !== "undefined" && document.createElement) {
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
        userName: userName,
      }
      setMessages([...messages, message])
    })
  }

  const handleOpenCamera = () => {
    navigation.navigate("Camera")
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
            <Text style={styles.contactNumber}>{isConnected ? "Online" : "Connecting..."}</Text>
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
            <TouchableOpacity style={styles.sendButton} onPress={handleAudio}>
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
  errorText: { fontSize: 10, color: "#d32f2f", marginLeft: 4 },
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
