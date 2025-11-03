
import { RootState } from "@/src/Redux/Store/store"
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import { type CompositeNavigationProp, useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useSelector } from "react-redux"
import ChannelItemWithLongPress from "../components/ChannelItemWithLongPress"
import ChatThread from "../components/ChatThread"
import MainLayout from "../components/MainLayout"
import TopTabNavigation from "../components/TopTabNavigation"
import WebBackButton from "../components/WebBackButton"
import type { MainTabsParamList, RootStackParamList } from "../navigation/types"
import UserProfileScreen from "./UserProfileScreen"

const API_BASE_URL = "http://localhost:5200/web"

type StudentContact = {
  studentId: string
  studentName: string
  studentEmail?: string
}

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

type ChatsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Chats">,
  NativeStackNavigationProp<RootStackParamList>
>

const ChatsScreen = () => {
  const token = useSelector((state: RootState) => state.facultyStore.token)
  const navigation = useNavigation<ChatsNavigationProp>()
  const [rawContacts, setRawContacts] = useState<StudentContact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [activeTab, setActiveTab] = useState("All")
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)

  const channels = useMemo<Channel[]>(() => {
    return rawContacts.map((contact) => ({
      id: contact.studentId,
      name: contact.studentName,
      lastMessage: `Email: ${contact.studentEmail || "N/A"}`,
      time: "Now",
      unread: 0,
      isStarred: false,
      type: "personal",
      isArchived: false,
      isPinned: false,
    }))
  }, [rawContacts])

  // 🔍 Filter logic
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
    }

    if (searchText.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchText.toLowerCase()) ||
          c.lastMessage.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    return filtered
  }, [channels, activeTab, searchText])

  const handleTabChange = (tab: string) => setActiveTab(tab)
  const handleChannelPress = (channel: Channel) => {
    setSelectedChannel(channel)
    setShowUserProfile(false)
  }
  const handleGroupCreated = (newGroup: Channel) => setSelectedChannel(newGroup)

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
        email: selectedChannel.lastMessage.replace("Email: ", ""),
        phone: "+91 98765 43210",
        bio: "This is a sample bio for the user profile.",
        fatherName: "Father Name",
        operator: "John Doe",
        department: "Sales",
      }
    : null

  // 📡 Fetch all student contacts
  const fetchAllContacts = async () => {
    if (!token) {
      setError("Authentication token not found. Please log in.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const API_URL = `${API_BASE_URL}/faculty/view-contacts`

      const response = await axios.post(
        API_URL,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = response.data
      if (
        data?.status === 1 &&
        Array.isArray(data.facultyContactsList) &&
        data.facultyContactsList[0]?.facultyContacts
      ) {
        const contacts: StudentContact[] = data.facultyContactsList[0].facultyContacts
        console.log("✅ Contacts fetched successfully:", contacts)
        setRawContacts(contacts)
      } else {
        setError(data?.msg || "Failed to load contacts data.")
        setRawContacts([])
      }
    } catch (err: any) {
      console.error("🔥 Error fetching contacts:", err.response?.data || err.message)
      setError(err.response?.data?.msg || "Network error. Failed to fetch contacts.")
      setRawContacts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchAllContacts()
  }, [token])

  // 📍 Loader & Error UI
  const ListLoadingOrError = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredMessage}>
          <ActivityIndicator size="large" color="#075E54" />
          <Text style={styles.messageTextContent}>Loading student contacts...</Text>
        </View>
      )
    }
    if (error) {
      return (
        <View style={styles.centeredMessage}>
          <Ionicons name="alert-circle-outline" size={30} color="#FF6347" style={{ marginBottom: 10 }} />
          <Text style={styles.messageTextContent}>Error: {error}</Text>
          <TouchableOpacity onPress={fetchAllContacts} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return null
  }

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
        <View style={styles.rootRow}>
          {/* LEFT PANEL */}
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
            <ListLoadingOrError />

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
                  onUpdate={() => setRawContacts([...rawContacts])}
                />
              )}
              ListEmptyComponent={
                !isLoading && !error && filteredChannels.length === 0 ? (
                  <View style={styles.centeredMessage}>
                    <Text style={styles.messageTextContent}>
                      No student contacts found or matching the filter.
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>

          {/* CENTER CHAT AREA */}
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
        backgroundColor: "#e6ecf3",
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

    // 🔹 Search Bar
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

    // --- Loading/Error Styles ---
    centeredMessage: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 50
    },
    messageTextContent: {
        marginTop: 10,
        fontSize: 15,
        color: '#555',
        textAlign: 'center'
    },
    retryButton: {
        backgroundColor: '#075E54',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 15
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600'
    }
});