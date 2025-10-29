"use client"

import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import { type CompositeNavigationProp, useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useMemo, useState } from "react"
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import ChannelItemWithLongPress from "../components/ChannelItemWithLongPress"
import ChatThread from "../components/ChatThread"
import MainLayout from "../components/MainLayout"
import TopTabNavigation from "../components/TopTabNavigation"
import WebBackButton from "../components/WebBackButton"
import type { MainTabsParamList, RootStackParamList } from "../navigation/types"
import UserProfileScreen from "./UserProfileScreen"

type ChatsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Chats">,
  NativeStackNavigationProp<RootStackParamList>
>

type Channel = {
  id: string
  name: string
  lastMessage: string
  time: string
  unread?: number
  isArchived?: boolean
  isStarred?: boolean
  type?: "personal" | "group"
  isPinned?: boolean
}

const initialChannels: Channel[] = [
  {
    id: "1",
    name: "Vikram  faculty ",
    lastMessage: "✓✓ signon name father name batch course...",
    time: "12:07 am",
    unread: 1,
    isStarred: false,
    type: "personal",
  },
  { id: "2", name: "fdhd", lastMessage: "✓✓ Vvvv", time: "Yesterday", unread: 0, isStarred: true, type: "personal" },
  { id: "3", name: "Bhavesh", lastMessage: "82000", time: "Yesterday", unread: 0, isStarred: false, type: "personal" },
  {
    id: "4",
    name: "+91 8765987643",
    lastMessage: "Internet services have been resumed...",
    time: "Yesterday",
    unread: 0,
    isStarred: false,
    type: "personal",
  },
  {
    id: "5",
    name: "Code Step by Step 🧠",
    lastMessage: "+91 63826 37219 joined using a group...",
    time: "Yesterday",
    unread: 1,
    isStarred: false,
    type: "group",
  },
  {
    id: "6",
    name: "Sunil 🍪😊",
    lastMessage: "✓✓ 📷 Photo",
    time: "Yesterday",
    unread: 0,
    isStarred: true,
    type: "personal",
  },
  {
    id: "7",
    name: "Business Group",
    lastMessage: "Announcements ▸ HCL...",
    time: "9:36 am",
    unread: 3,
    isStarred: false,
    type: "group",
  },
  {
    id: "8",
    name: "Educational Group",
    lastMessage: "✓✓ cha.zip",
    time: "9:36 am",
    unread: 0,
    isStarred: true,
    type: "group",
  },
  { id: "9", name: "Rahul", lastMessage: "gfdgf", time: "8:06 am", unread: 2, isStarred: false, type: "personal" },
  {
    id: "10",
    name: "Family Group",
    lastMessage: "Good morning everyone!",
    time: "7:50 am",
    unread: 5,
    isStarred: false,
    type: "group",
  },
]

const ChatsScreen = () => {
  const navigation = useNavigation<ChatsNavigationProp>()
  const [channels, setChannels] = useState(initialChannels)
  const [searchText, setSearchText] = useState("")
  const [activeTab, setActiveTab] = useState("All")
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)

  const filteredChannels = useMemo(() => {
    let filtered = channels

    switch (activeTab) {
      case "Unread":
        filtered = channels.filter((c) => (c.unread || 0) > 0)
        break
      case "Favourites":
        filtered = channels.filter((c) => c.isStarred)
        break
      case "Groups":
        filtered = channels.filter((c) => c.type === "group")
        break
      default:
        filtered = channels
    }

    if (searchText.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchText.toLowerCase()) ||
          c.lastMessage.toLowerCase().includes(searchText.toLowerCase()),
      )
    }

    return filtered
  }, [channels, activeTab, searchText])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const handleAddGroup = () => {
    console.log("Navigate to Create Group Screen")
  }

  const handleOpenCamera = () => {
    console.log("Open Camera")
  }

  const handleChannelPress = (channel: Channel) => {
    setSelectedChannel(channel)
    setShowUserProfile(false)
    // navigation.navigate("ChatThread", { channel }) // removed
  }

  const handleGroupCreated = (newGroup: Channel) => {
    setChannels([newGroup, ...channels])
    setSelectedChannel(newGroup)
  }

  type UserProfile = {
    name: string
    email: string
    phone: string
    bio: string
    fatherName: string
    operator: string
    department: string
  }

  const userProfile: UserProfile | null = selectedChannel
    ? {
        name: selectedChannel.name,
        email: `${selectedChannel.name.toLowerCase().replace(" ", ".")}@example.com`, // ✅ template literal
        phone: "+91 98765 43210",
        bio: "This is a sample bio for the user profile.",
        fatherName: "Father Name",
        operator: "John Doe",
        department: "Sales",
      }
    : null

  return (
    <MainLayout
      activeTab="Chats"
      showRightContent={showUserProfile}
      rightContent={
        userProfile ? <UserProfileScreen userProfile={userProfile} onClose={() => setShowUserProfile(false)} /> : null
      }
      onRightContentClose={() => setShowUserProfile(false)}
    >
      <View style={styles.container}>
        {/* Two-column content to match the reference image */}
        <View style={styles.rootRow}>
          {/* LEFT: Channel list (narrow) */}
          <View style={styles.listColumn}>
            <View style={styles.header}>
              <WebBackButton />
              <Text style={styles.headerTitle}>Chats</Text>
            </View>

            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                placeholder="Ask Meta AI or Search"
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
              />
              <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate("QRScanner")}>
                <Ionicons name="qr-code" size={20} color="#1a1b1bff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraButton} onPress={() => navigation.navigate("Camera")}>
                <Ionicons name="camera" size={20} color="#0a0a0aff" />
              </TouchableOpacity>
            </View>

            <TopTabNavigation onTabChange={handleTabChange} />

            <FlatList
              data={filteredChannels}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ChannelItemWithLongPress
                  channel={{
                    id: item.id,
                    name: item.name,
                    lastMessage: item.lastMessage,
                    timestamp: item.time,
                    unread: item.unread,
                    isGroup: item.type === "group",
                    isPinned: item.isPinned,
                  }}
                  onPress={() => handleChannelPress(item)}
                  onUpdate={() => setChannels([...channels])}
                />
              )}
            />
          </View>

          {/* CENTER: Chat thread */}
          <View style={styles.chatColumn}>
            {selectedChannel ? (
              <ChatThread
                channel={selectedChannel}
                onOpenProfile={() => setShowUserProfile(true)}
                onGroupCreated={handleGroupCreated}
              />
            ) : (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>Select a chat to start messaging</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </MainLayout>
  )
}

export default ChatsScreen

const styles = StyleSheet.create({
  // 🔹 Root Container
  container: {
    flex: 1,
    backgroundColor: "#e6ecf3", // soft neutral background
  },

  // 🔹 Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backButton: { marginRight: 14 },
  contactInfo: { flex: 1 },
  contactName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  contactNumber: { fontSize: 12, color: "#4caf50", marginTop: 2 },
  headerActions: { flexDirection: "row" },
  actionButton: {
    marginLeft: 10,
    backgroundColor: "#f2f4f8",
    padding: 10,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#075E54",
  },

  rootRow: {
    flex: 1,
    flexDirection: "row",
  },
  listColumn: {
    width: 400,
    maxWidth: 450,
    minWidth: 260,
    borderRightWidth: 1,
    borderRightColor: "#e2e6ea",
    backgroundColor: "#fefefe",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  chatColumn: {
    flex: 1,
    backgroundColor: "#f9fbfd",
    borderLeftWidth: 1,
    borderLeftColor: "#dde2e8",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  // 🔹 Search Bar (Glassmorphism)
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  searchIcon: { marginRight: 12, color: "#333" },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  qrButton: { marginLeft: 10, padding: 6 },

  // 🔹 Chat Empty Screen
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f6fa",
  },
  emptyChatText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "500",
  },

  // 🔹 Messages
  messagesContainer: { flex: 1 },
  messagesList: { flex: 1 },
  messagesContent: { padding: 14 },

  messageContainer: {
    marginVertical: 6,
    transform: [{ scale: 1 }],
  },
  sentMessage: { alignSelf: "flex-end" },
  receivedMessage: { alignSelf: "flex-start" },

  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  sentBubble: {
    backgroundColor: "#007aff",
    borderTopRightRadius: 0,
    shadowColor: "#007aff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  receivedBubble: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  sentText: { color: "#fff" },
  receivedText: { color: "#111" },

  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timestamp: { fontSize: 10, color: "#777", marginRight: 4 },

  // 🔹 Input Bar
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  attachButton: {
    marginRight: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    padding: 8,
    elevation: 5,
  },
  cameraButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e8eaf0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    elevation: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 25,
    color: "#000",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#007aff",
    padding: 12,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#007aff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },

  // 🔹 Attachment Overlay
  attachmentOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  attachmentContainer: {
    backgroundColor: "#ffffffee",
    padding: 25,
    width: "90%",
    flex: 0.5,
    borderRadius: 30,
    alignSelf: "center",
    elevation: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  attachmentHeader: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  attachmentTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#1a1a1a",
  },
  attachmentGrid: {
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
  },
  attachmentIcon: {
    width: 70,
    height: 70,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#eaf2ff",
    elevation: 8,
    shadowColor: "#007aff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  attachmentLabel: {
    fontSize: 12,
    color: "#000",
    textAlign: "center",
    fontWeight: "500",
  },

  // 🔹 Floating Attach Button
  attachButtons: {
    alignSelf: "flex-end",
    margin: 24,
    backgroundColor: "#00bcd4",
    borderRadius: 30,
    padding: 12,
    elevation: 10,
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});

