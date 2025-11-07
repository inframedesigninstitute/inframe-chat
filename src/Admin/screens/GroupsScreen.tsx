import { RootState } from "@/src/Redux/Store/store";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import ChannelItemWithLongPress from "../components/ChannelItemWithLongPress";
import ChatThread from "../components/ChatThread";
import MainLayout from "../components/MainLayout";
import TopTabNavigation from "../components/TopTabNavigation";
import WebBackButton from "../components/WebBackButton";
import type { MainTabsParamList, RootStackParamList } from "../navigation/types";
import UserProfileScreen from "./UserProfileScreen";

type GroupsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Groups">,
  NativeStackNavigationProp<RootStackParamList>
>;
type GroupContact = {
  groupId: string;
  groupName: string;
  membersCount?: number;
};

type Channel = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  isArchived?: boolean;
  isStarred?: boolean;
  type?: "personal" | "group";
  isPinned?: boolean;
  members?: number;
  isAdmin?: boolean;
};

const API_BASE_URL = "http://localhost:5200/web";

const GroupsScreen = () => {
  const navigation = useNavigation<GroupsNavigationProp>();
  const [channels, setChannels] = useState<Channel[]>([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const token = useSelector((state: RootState) => state.AdminStore.token);
  const [rawGroups, setRawGroups] = useState<GroupContact[]>([]); 

  // ✅ Fetch groups
  const fetchAllGroups = async () => {
    if (!token) return setError("Authentication token not found. Please log in.");
    setLoading(true); // 👈 Loading शुरू करें
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/main-admin/view-group`,
        {},
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );

      const data = response.data;
      if (data?.status === 1 && Array.isArray(data.data)) {
        const groups: GroupContact[] = data.data.map((g: any) => ({
          groupId: g._id || g.groupId || g.facultyGroupId,
          groupName: g.facultyGroupName || g.groupName || "Unnamed Group",
          membersCount: g.groupMembers?.length || 0,
        }));
        setRawGroups(groups); 
      } else {
        setRawGroups([]);
   
      }
    } catch (err: any) {
      console.error("Error fetching groups:", err.response?.data || err.message);
      setError("Failed to load groups. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    const mappedChannels: Channel[] = rawGroups.map((group) => ({
      id: group.groupId,
      name: group.groupName,
      lastMessage: `Members: ${group.membersCount || 0}`, 
      time: "", 
      unread: 0,
      type: "group", 
      isPinned: false,
      members: group.membersCount,
    }));
    setChannels(mappedChannels);
  }, [rawGroups]);

  // ✅ Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchAllGroups();
    }, [])
  );

  useEffect(() => {
    // Initial fetch for the first load
    fetchAllGroups();
  }, []);


  const filteredChannels = useMemo(() => {
    let filtered = channels;
       if (activeTab === "Unread") filtered = channels.filter((c) => (c.unread || 0) > 0);
    else if (activeTab === "Favourites") filtered = channels.filter((c) => c.isStarred);
   
  
    if (searchText.trim()) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchText.toLowerCase()) ||
          c.lastMessage.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return filtered;
  }, [channels, activeTab, searchText]);
  

  const handleTabChange = (tab: string) => setActiveTab(tab);

  const handleChannelPress = (channel: Channel) => {
    setSelectedChannel(channel);
    setShowUserProfile(false);
  };

  const handleGroupCreated = (newGroup: Channel) => {
    setChannels((prev) => {
      const exists = prev.some((g) => g.id === newGroup.id);
      if (exists) return prev;
      return [newGroup, ...prev];
    });
    setSelectedChannel(newGroup);
  };
const userProfile = selectedChannel
  ? {
      // FIX: Add the required 'id' property
      id: selectedChannel.id,
      name: selectedChannel.name,
      email: `${selectedChannel.name
        .toLowerCase()
        .replace(/\s+/g, ".")}@example.com`,
      phone: "+91 98765 43210",
      bio: "This is a sample bio.",
      fatherName: "Father Name",
      operator: "John Doe",
      department: "Sales",
      // 'groupMembers' is already present, which is correct
      groupMembers: [], 
    }
  : null;

  const ListLoadingOrError = () => {
    if (loading)
      return (
        <View style={styles.centeredMessage}>
          <ActivityIndicator size="large" color="#075E54" />
          <Text style={styles.messageTextContent}>Loading groups...</Text>
        </View>
      );
    if (error)
      return (
        <View style={styles.centeredMessage}>
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color="#FF6347"
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.messageTextContent}>{error}</Text>
          <TouchableOpacity onPress={fetchAllGroups} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    return null;
  };

  return (
    <MainLayout
      activeTab="Groups"
      showRightContent={showUserProfile}
      rightContent={
        userProfile ? (
          <UserProfileScreen userProfile={userProfile} onClose={() => setShowUserProfile(false)} />
        ) : null
      }
    >
      <View style={styles.container}>
        <View style={styles.rootRow}>
          {/* LEFT COLUMN */}
          <View style={styles.listColumn}>
            <View style={styles.header}>
              <WebBackButton />
              <Text style={styles.headerTitle}>Groups</Text>
              <TouchableOpacity>
              <Text style={styles.headerTitles}>Edit</Text>

              </TouchableOpacity>
            </View>

            {/* SEARCH BAR */}
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                placeholder="Ask Meta AI or Search"
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
              />
              <TouchableOpacity
                style={styles.qrButton}
                onPress={() => navigation.navigate("QRScanner")}
              >
                <Ionicons name="qr-code" size={20} color="#1a1b1bff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => navigation.navigate("Camera")}
              >
                <Ionicons name="camera" size={20} color="#0a0a0aff" />
              </TouchableOpacity>
            </View>

            <TopTabNavigation onTabChange={handleTabChange} />

            <ListLoadingOrError />

            {!loading && !error && (
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
                    onUpdate={() => fetchAllGroups()}
                     onDelete={(mId) => {
    setChannels((prev) => prev.filter((c) => c.id !== mId));
    fetchAllGroups();
  }}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.centeredMessage}>
                    <Text style={styles.messageTextContent}>No groups found.</Text>
                  </View>
                }
              />
            )}
          </View>

          {/* RIGHT COLUMN */}
          <View style={styles.chatColumn}>
            {selectedChannel ? (
              <ChatThread
                channel={selectedChannel}
                onOpenProfile={() => setShowUserProfile(true)}
                onGroupCreated={handleGroupCreated}
              />
            ) : (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>Select a group to start messaging</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </MainLayout>
  );
};

export default GroupsScreen

// Styles remain the same
const styles = StyleSheet.create({

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
  headerTitles: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000ff", alignContent:"flex-end" , marginStart: 190
  },

  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageTextContent: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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