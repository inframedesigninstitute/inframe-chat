import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  CompositeNavigationProp,
  useNavigation
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
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
import ChatThread from "../components/ChatThread";
import MainLayout from "../components/MainLayout";
import TopTabNavigation from "../components/TopTabNavigation";
import WebBackButton from "../components/WebBackButton";
import type { MainTabsParamList, RootStackParamList } from "../navigation/types";
import UserProfileScreen from "./UserProfileScreen";

const API_BASE_URL = "http://localhost:5200/web";

type StudentContact = {
  studentId: string;
  studentName: string;
  studentEmail?: string;
};

type FacultyContact = {
  facultyId: string;
  facultyName: string;
  facultyEmail?: string;
};

type GroupContact = {
  groupId: string;
  groupName: string;
  membersCount?: number;
};

type UnifiedContact = {
  id: string;
  name: string;
  email?: string;
  type: "student" | "faculty";
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

type ChatsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Chats">,
  NativeStackNavigationProp<RootStackParamList>
>;

const ChatsScreen = () => {
  const token = useSelector((state: RootState) => state.AdminStore.token);
  const navigation = useNavigation<ChatsNavigationProp>();

  const [rawContacts, setRawContacts] = useState<UnifiedContact[]>([]);
  const [rawGroups, setRawGroups] = useState<GroupContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // 🧩 Combine unified contacts & groups into channel list
  const channels = useMemo<Channel[]>(() => {
    const personalChannels = rawContacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      lastMessage: `Email: ${contact.email || "N/A"}`,
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

    return [...personalChannels, ...groupChannels];
  }, [rawContacts, rawGroups]);

  // 🔍 Filter logic
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
    setRawContacts((prev) => prev.filter((c) => c.id !== id));
    setRawGroups((prev) => prev.filter((g) => g.groupId !== id));
  };

  // ✅ Fetch all students
  const fetchAllStudentContacts = async () => {
    if (!token) return setError("Authentication token not found. Please log in.");
    try {
      const API_URL = `${API_BASE_URL}/main-admin/view-all-students`;
      const response = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      if (data?.status === 1 && Array.isArray(data.allStudentData)) {
        return data.allStudentData.map((student: any) => ({
          id: student._id || student.id,
          name: student.studentName || "Unnamed Student",
          email: student.studentEmail || "N/A",
          type: "student" as const,
        }));
      }
      return [];
    } catch (err: any) {
      console.error("Error fetching students:", err.message);
      setError("Failed to fetch student contacts.");
      return [];
    }
  };

  // ✅ Fetch all faculties
  const fetchAllFacultyContacts = async () => {
    if (!token) return setError("Authentication token not found. Please log in.");
    try {
      const API_URL = `${API_BASE_URL}/main-admin/view-all-faculties`;
      const response = await axios.get(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      if (data?.status === 1 && Array.isArray(data.allfacultyData)) {
        return data.allfacultyData.map((faculty: any) => ({
          id: faculty._id || faculty.id,
          name: faculty.facultyName || "Unnamed Faculty",
          email: faculty.facultyEmail || "N/A",
          type: "faculty" as const,
        }));
      }
      return [];
    } catch (err: any) {
      console.error("Error fetching faculties:", err.message);
      setError("Failed to fetch faculty contacts.");
      return [];
    }
  };

  const FacultyAllGroups = async () => {
    if (!token) return setError("Authentication token not found. Please log in.");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/main-admin/view-all-faculties-groups`
      );
      const data = response.data;

      if (data?.status === 1 && Array.isArray(data.data)) {
        const allGroups = data.data.flatMap((faculty: any) =>
          (faculty.facultyGroups || []).map((group: any) => ({
            groupId: group._id || `${faculty._id}-${group.facultyGroupName}`,
            groupName: group.facultyGroupName || "Unnamed Group",
            membersCount: group.facultyGroupMembers?.length || 0,
          }))
        );
        setRawGroups((prev) => [...prev, ...allGroups]);
      } else {
        setError(data?.msg || "No faculty groups found.");
      }
    } catch (err: any) {
      console.error("Error fetching faculty groups:", err.message);
    }
  };

  const fetchAllGroups = async () => {
    if (!token) return setError("Authentication token not found. Please log in.");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/main-admin/view-group`,
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
          groupId: g._id || g.mainAdminId,
          groupName: g.mainAdminGroupName || g.groupName || "Unnamed Group",
          membersCount: g.groupMembers?.length || 0,
        }));
        setRawGroups((prev) => [...prev, ...groups]);
      }
    } catch (err: any) {
      console.error("Error fetching groups:", err.message);
    }
  };

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [students, faculties] = await Promise.all([
          fetchAllStudentContacts(),
          fetchAllFacultyContacts(),
        ]);
        setRawContacts([...students, ...faculties]);
        await Promise.all([fetchAllGroups(), FacultyAllGroups()]);
      } catch (e) {
        console.error("Data load error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [token]);

  const ListLoadingOrError = () => {
    if (isLoading)
      return (
        <View style={styles.centeredMessage}>
          <ActivityIndicator size="large" color="#075E54" />
          <Text style={styles.messageTextContent}>
            Loading contacts & groups...
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
              setError(null);
              setIsLoading(true);
              setRawContacts([]);
              setRawGroups([]);
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
      activeTab="Chats"
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
                  onUpdate={() => {}}
                  onDelete={(id) => handleDeleteChannel(id)}
                />
              )}
              ListEmptyComponent={
                !isLoading && !error && filteredChannels.length === 0 ? (
                  <View style={styles.centeredMessage}>
                    <Text style={styles.messageTextContent}>
                      No contacts or groups found.
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

export default ChatsScreen;

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
  centeredMessage: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  messageTextContent: {
    marginTop: 10,
    fontSize: 15,
    color: "#555",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#075E54",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },
});
