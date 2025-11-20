import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
    CompositeNavigationProp,
    useFocusEffect,
    useNavigation,
} from "@react-navigation/native";
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
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/Store/store";
import AddMemberModal from "../components/add-member";
import ChannelItemWithLongPress from "../components/ChannelItemWithLongPress";
import ChatThread from "../components/FacultyChatThread";
import MainLayout from "../components/MainLayout";
import TopTabNavigation from "../components/TopTabNavigation";
import WebBackButton from "../components/WebBackButton";
import type { MainTabsParamList, RootStackParamList } from "../navigation/types";
import UserProfileScreen from "./FacultyStudentUserProfileScreen";

const API_BASE_URL = "http://localhost:5200/web";

type StudentContact = {
  studentId: string;
  studentName: string;
  studentEmail?: string;
};

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
};

type FacultyChatsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "FacultyChats">,
  NativeStackNavigationProp<RootStackParamList>
>;

const FacultyChatsScreen = () => {
  const token = useSelector((state: RootState) => state.facultyStore.token);
  const navigation = useNavigation<FacultyChatsNavigationProp>();

  const [rawContacts, setRawContacts] = useState<StudentContact[]>([]);
  const [rawGroups, setRawGroups] = useState<GroupContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Combine both contacts & groups
  const channels = useMemo<Channel[]>(() => {
    const studentChannels = rawContacts.map((contact) => ({
      id: contact.studentId,
      name: contact.studentName,
      lastMessage: `Email: ${contact.studentEmail || "N/A"}`,
      time: "Now",
      unread: 0,
      isStarred: false,
      type: "personal" as const,
      isArchived: false,
      isPinned: false,
    }));

    const groupChannels = rawGroups.map((group) => ({
      id: group.groupId,
      name: group.groupName,
      lastMessage: `Members: ${group.membersCount ?? 0}`,
      time: "Now",
      unread: 0,
      isStarred: false,
      type: "group" as const,
      isArchived: false,
      isPinned: false,
    }));

    return [...studentChannels, ...groupChannels];
  }, [rawContacts, rawGroups]);

  // Filter logic
  const filteredChannels = useMemo(() => {
    let filtered = channels;
    if (activeTab === "Unread")
      filtered = channels.filter((c) => (c.unread || 0) > 0);
    else if (activeTab === "Favourites")
      filtered = channels.filter((c) => c.isStarred);
    else if (activeTab === "Groups")
      filtered = channels.filter((c) => c.type === "group");

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
    setRawGroups((prev) => {
      const exists = prev.some((g) => g.groupId === newGroup.id);
      if (exists) return prev;
      return [
        ...prev,
        { groupId: newGroup.id, groupName: newGroup.name, membersCount: 1 },
      ];
    });
  };

  const handleDeleteChannel = (id: string) => {
    setRawContacts((prev) => prev.filter((c) => c.studentId !== id));
    setRawGroups((prev) => prev.filter((g) => g.groupId !== id));
    console.log("Channel deleted:", id);
  };

  // ✅ Handle new message and update chat list
  const handleNewMessage = (channelId: string, messageText: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Check if channel exists in contacts
    const contactExists = rawContacts.some((c) => c.studentId === channelId);
    const groupExists = rawGroups.some((g) => g.groupId === channelId);

    // If channel doesn't exist, add it to contacts (this handles cross-platform messaging)
    if (!contactExists && !groupExists && selectedChannel) {
      console.log("Faculty: Adding new contact from incoming message:", channelId);
      setRawContacts((prev) => [
        {
          studentId: channelId,
          studentName: selectedChannel.name || "New Contact",
          studentEmail: "N/A",
        },
        ...prev,
      ]);
    }

    // Update last message time for existing channels
    console.log("Faculty: Updating last message for channel:", channelId, messageText);
  };

  const fetchAllContacts = async () => {
    if (!token) return setError("Authentication token not found. Please log in.");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/faculty/view-contacts`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      if (data?.status === 1 && data.facultyContactsList?.[0]?.facultyContacts) {
        const contacts: StudentContact[] = data.facultyContactsList[0].facultyContacts;
        setRawContacts(contacts);
      } else setError(data?.msg || "Failed to load contacts data.");
    } catch (err: any) {
      console.error("Error fetching contacts:", err.response?.data || err.message);
      setError("Failed to fetch contacts.");
    }
  };

  // ✅ Fetch faculty groups
  const fetchAllGroups = async () => {
    if (!token) return setError("Authentication token not found. Please log in.");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/faculty/view-group`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      if (data?.status === 1 && Array.isArray(data.data)) {
        const groups: GroupContact[] = data.data.map((g: any) => ({
          groupId: g._id || g.groupId || g.facultyGroupId,
          groupName: g.facultyGroupName || g.groupName || "Unnamed Group",
          membersCount: g.groupMembers?.length || 0,
        }));
        setRawGroups(groups);
      } else setRawGroups([]);
    } catch (err: any) {
      console.error("Error fetching groups:", err.response?.data || err.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchAllContacts();
        fetchAllGroups();
      }
    }, [token])
  );

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      Promise.all([fetchAllContacts(), fetchAllGroups()])
        .catch((e) => console.error(e))
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  const ListLoadingOrError = () => {
    if (isLoading)
      return (
        <View style={styles.centeredMessage}>
          <ActivityIndicator size="large" color="#075E54" />
          <Text style={styles.messageTextContent}>
            Loading student contacts & groups...
          </Text>
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
          <Text style={styles.messageTextContent}>Error: {error}</Text>
          <TouchableOpacity
            onPress={() => {
              fetchAllContacts();
              fetchAllGroups();
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    return null;
  };

  return (
    <MainLayout
      activeTab="FacultyChats"
      showRightContent={showUserProfile}
      rightContent={
        selectedChannel ? (
          <UserProfileScreen
            userProfile={{
              id: selectedChannel.id,
              name: selectedChannel.name,
              email: selectedChannel.lastMessage.replace("Email: ", ""),
              phone: "+91 98765 43210",
              bio: "Sample bio.",
              fatherName: "Father Name",
              operator: "John Doe",
              department: "Sales",
              groupMembers: [],
            }}
            onClose={() => setShowUserProfile(false)}
          />
        ) : null
      }
    >
      <View style={styles.container}>
        <View style={styles.rootRow}>
          <View style={styles.listColumn}>
            <View style={styles.header}>
              <WebBackButton />
              <Text style={styles.headerTitle}>Chats</Text>
            </View>

            <View style={styles.searchContainer}>
              <MaterialIcons
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Ask Meta AI or Search"
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
              />

              <TouchableOpacity
                style={styles.attachButton}
                onPress={() => setShowAddMemberModal(true)}
              >
                <Ionicons name="add" size={30} color="#000" />
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
                  onUpdate={() => fetchAllContacts()}
                  onDelete={(id) => handleDeleteChannel(id)} // ✅ required prop fixed
                />
              )}
              ListEmptyComponent={
                !isLoading && !error && filteredChannels.length === 0 ? (
                  <View style={styles.centeredMessage}>
                    <Text style={styles.messageTextContent}>
                      No student contacts or groups found.
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>

          <View style={styles.chatColumn}>
            {selectedChannel ? (
              <ChatThread
                channel={selectedChannel}
                onOpenProfile={() => setShowUserProfile(true)}
                onGroupCreated={handleGroupCreated}
                onNewMessage={handleNewMessage}
              />
            ) : (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>
                  Select a chat to start messaging
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <AddMemberModal
        visible={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onGroupCreated={(group) => {
          handleGroupCreated(group);
          setShowAddMemberModal(false);
        }}
      />
    </MainLayout>
  );
};

export default FacultyChatsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e6ecf3" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 10,
  },
  attachButton: { marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#075E54" },
  rootRow: { flex: 1, flexDirection: "row" },
  listColumn: {
    width: 400,
    maxWidth: 450,
    minWidth: 260,
    borderRightWidth: 1,
    borderRightColor: "#e2e6ea",
    backgroundColor: "#fefefe",
  },
  chatColumn: {
    flex: 1,
    backgroundColor: "#f9fbfd",
    borderLeftWidth: 1,
    borderLeftColor: "#dde2e8",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  searchIcon: { marginRight: 12, color: "#333" },
  searchInput: { flex: 1, fontSize: 16, color: "#000" },
  cameraButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e8eaf0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f6fa",
  },
  emptyChatText: { color: "#64748b", fontSize: 15, fontWeight: "500" },
  centeredMessage: { justifyContent: "center", alignItems: "center", padding: 20, marginTop: 50 },
  messageTextContent: { marginTop: 10, fontSize: 15, color: "#555", textAlign: "center" },
  retryButton: {
    backgroundColor: "#075E54",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },
});
