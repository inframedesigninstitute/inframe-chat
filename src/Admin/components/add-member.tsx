import { RootState } from "@/src/Redux/Store/store";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";

import CustomDialog from "./CustomDialog";

const API_BASE_URL = "http://localhost:5200/web"

type StudentContact = {
  studentId: string
  studentName: string
  studentEmail?: string
}

interface Contact {
  id: string
  name: string
  phone: string
  avatar?: string
  status?: string
  initials?: string
  bgColor?: string
}

interface AdminGroup {
  _id: string; // Group ID
  AdminGroupName: string;
  AdminGroupDescription: string;
  AdminGroupCreatedAt: string;
}

interface ChatItem {
  id: string
  name: string
  type: "group"
  lastMessage: string
  time: string
  unread: number
  isStarred: boolean
  isPinned: boolean
}

interface AddMemberModalProps {
  visible: boolean
  onClose: () => void
  onGroupCreated?: (group: ChatItem) => void
}

const ACTION_BUTTONS = [
  {
    id: "group",
    label: "New group",
    icon: "people",
    color: "#25D366",
  },
  {
    id: "contact",
    label: "New contact",
    icon: "person-add",
    color: "#25D366",
  },
]

interface AdminStoreSlice {
  token: string | null;
  AdminData?: {
    AdminId?: string;
    _id?: string;
    id?: string;
  } | null;
}


export default function AddMemberModal({ visible, onClose, onGroupCreated }: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeModal, setActiveModal] = useState<"main" | "newContact" | "newGroup">("main")
const admin = useSelector((state: RootState) => state.AdminStore.user);
const AdminId = admin?.id; // Ensure we have the correct admin ID

const AdminStore = useSelector((state: RootState) => state.AdminStore);
// const AdminId = AdminStore.user?.id;
const token = AdminStore.token;
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isContactsLoading, setIsContactsLoading] = useState(false)
  const [contactsError, setContactsError] = useState<string | null>(null)
  const [groups, setGroups] = useState<AdminGroup[]>([])
  const [isGroupsLoading, setIsGroupsLoading] = useState(false)
  const [groupsError, setGroupsError] = useState<string | null>(null)
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogData, setDialogData] = useState({
    type: "success" as "success" | "error" | "warning",
    title: "",
    message: "",
  });

  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState('')
  const [loading, setLoading] = useState(false) // Add Contact button loading state
  const [groupCreationLoading, setGroupCreationLoading] = useState(false); // Group creation loading state
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [groupSearchQuery, setGroupSearchQuery] = useState("")
  const [rawContacts, setRawContacts] = useState<StudentContact[]>([]);

  // States for Group Details Modal
  const [groupDetailsModalVisible, setGroupDetailsModalVisible] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [error, setError] = useState<string | null>(null);


  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const filteredGroupContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
      contact.phone.toLowerCase().includes(groupSearchQuery.toLowerCase()),
  )

  const handleActionButtonPress = (buttonId: string) => {
    if (buttonId === "contact") {
      setActiveModal("newContact")
    } else if (buttonId === "group") {
      setActiveModal("newGroup")
    }
  }




 
const fetchAllStudentContacts = async () => {
  if (!token?.trim()) {
    setContactsError("Authentication token not found.");
    return;
  }

  setIsContactsLoading(true);  // ✅ Add loading state
  setContactsError(null);

  try {
    const response = await axios.get(`${API_BASE_URL}/main-admin/view-all-students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data?.status === 1) {
      const contacts = response.data.allStudentData.map((s: any) => ({
        id: s._id || s.id,
        name: s.studentName,
        phone: s.studentEmail,
      }));
      setContacts(contacts);
    } else {
      setContacts([]);
      setContactsError(response.data?.msg || "Failed to load contacts.");
    }
  } catch (err: any) {
    console.error("Error fetching contacts:", err.response?.data || err.message);
    setContactsError(err.response?.data?.msg || "Failed to fetch student contacts.");
  } finally {
    setIsContactsLoading(false);
  }
};

  // 🎯 FIX: Groups Fetch Function updated to be more robust
  const fetchGroups = async () => {
    if (!token) {
      setGroupsError("Authentication token missing.");
      return;
    }

    setIsGroupsLoading(true);
    setGroupsError(null);

    try {
      const API_URL = `${API_BASE_URL}/main-admin/view-group`;
      console.log("📤 Fetching groups:", API_URL);

      const response = await axios.post(
        API_URL,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Group Response:", response.data);

      const data = response.data;

      if (data.status === 1 && Array.isArray(data.data)) {
        setGroups(data.data.map((g: any) => ({
          _id: g._id || g.groupId || g.AdminGroupId,
          AdminGroupName: g.AdminGroupName || g.groupName || "Unnamed Group",
          AdminGroupDescription: g.AdminGroupDescription || "",
          AdminGroupCreatedAt: g.AdminGroupCreatedAt || new Date().toISOString(),
        })));
        console.log("🎯 Groups fetched successfully:", data.data.length);
      }
      else {
        console.warn("⚠️ No valid group data found or status is not 1");
        setGroups([]);
        setGroupsError(data.msg || "No groups found for this Admin.");
      }
    } catch (error: any) {
      console.error("❌ Error fetching groups:", error.response?.data || error.message);
      setGroups([]);
      setGroupsError(error.response?.data?.msg || "Failed to fetch groups. Try again.");
    } finally {
      setIsGroupsLoading(false);
    }

  };


useEffect(() => {
  console.log("👀 useEffect triggered - visible:", visible, "token:", token);
  
  if (visible && token?.trim()) {
    setContactsError(null);
    setGroupsError(null);
    fetchAllStudentContacts();
    fetchGroups();
  } else if (visible && !token) {
    setContactsError("Authentication token not found.");
    setGroupsError("Authentication token not found.");
  }
}, [visible, token]);


  const toggleMemberSelection = (contactId: string) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
    } else {
      newSelected.add(contactId)
    }
    setSelectedMembers(newSelected)
  }

  const handleOpenGroupDetails = () => {
    if (selectedMembers.size === 0) {
      Alert.alert("Please select at least one member")
      return
    }
    setGroupDetailsModalVisible(true)
  }

 const handleCreateGroupAPI = async () => {
  if (!groupName.trim()) {
    Alert.alert("Group Name Required", "Please enter a name for the new group.");
    console.log("111111111111")
    return;
  }

  if (selectedMembers.size === 0) {
        console.log("111111111111000000000")

    Alert.alert("No Members Selected", "Please select members for the group.");
    return;
  }

  if (!token) {
        console.log("zzzzzzzzz111111111111")

    Alert.alert("Authentication Error", "Admin token not found. Please login again.");
    return;
  }

  if (!AdminId) {
        console.log("aaaaaaaaa111111111111")

    Alert.alert("Admin Error", "Admin ID not found. Cannot create group.");
    return;
  }

  setGroupCreationLoading(true);
  const memberIds = Array.from(selectedMembers);

  try {
    const API_URL = `${API_BASE_URL}/main-admin/create-group`;

    const response = await axios.post(
      API_URL,
      {
        mainAdminId: AdminId, // ✅ ensure AdminId is valid
        mainAdminGroupName: groupName.trim(),
        mainAdminGroupDescription: groupDescription.trim(),
        mainAdminGroupMembers: memberIds,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = response.data;

    if (result.status === 1) {
      const newGroup: ChatItem = {
        id: result.groupId || result.data?.groupId || `group-${Date.now()}`,
        name: groupName.trim(),
        type: "group",
        lastMessage: `Group created with ${selectedMembers.size} members.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        unread: 0,
        isStarred: false,
        isPinned: false,
      };

      onGroupCreated?.(newGroup);
      fetchGroups();

      setDialogData({
        type: "success",
        title: "Success",
        message: result.msg || "Group created successfully! Chat list is updated.",
      });
      setDialogVisible(true);

      // Reset form
      setSelectedMembers(new Set());
      setGroupSearchQuery("");
      setGroupName("");
      setGroupDescription("");
      setGroupDetailsModalVisible(false);
      setActiveModal("main");
      onClose();
    } else {
      setDialogData({
        type: "error",
        title: "Group Creation Failed",
        message: result.msg || "Failed to create group. Please try again.",
      });
      setDialogVisible(true);
    }
  } catch (error: any) {
    console.error("Create Group Error:", error.response?.data || error.message);
    setDialogData({
      type: "error",
      title: "Server Error",
      message: error.response?.data?.msg || "An unexpected error occurred during group creation. Please try again later.",
    });
    setDialogVisible(true);
  } finally {
    setGroupCreationLoading(false);
  }
};



  const handleCloseDialog = () => {
    setDialogVisible(false);
    if (dialogData.type === 'success' && activeModal === 'newContact') {
      setStudentName("");
      setStudentEmail("");
      setActiveModal("main");
    }
  };


  const handleSubmit = async () => {
    if (!studentEmail) {
      setDialogData({
        type: "warning",
        title: "Missing Field",
        message: "Please enter student email",
      });
      setDialogVisible(true);
      return;
    }

    setLoading(true);
    try {
      const API_URL = `${API_BASE_URL}/main-admin/add-contacts`;

      const response = await axios.post(
        API_URL,
        { studentName, studentEmail },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;

      if (result.status === 1) {
        setDialogData({
          type: "success",
          title: "Success",
          message: "Student added successfully! Please re-open the modal to see updated list.",
        });
        await fetchAllStudentContacts();
      } else if (result.status === -1) {
        setDialogData({
          type: "error",
          title: "Error",
          message: "Admin not found.",
        });
      } else if (result.status === -2) {
        setDialogData({
          type: "error",
          title: "Error",
          message: "Student not found or not approved.",
        });
      } else if (result.status === -3) {
        setDialogData({
          type: "warning",
          title: "Warning",
          message: "Student already in your contacts.",
        });
      } else {
        setDialogData({
          type: "error",
          title: "Error",
          message: result.msg || "Something went wrong. Please try again.",
        });
      }

      setDialogVisible(true);
    } catch (error) {
      console.error("Add Contact Error:", error);
      setDialogData({
        type: "error",
        title: "Server Error",
        message: "An unexpected error occurred. Please try again later.",
      });
      setDialogVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Functions (Same as before) ---

  const renderActionButton = (button: (typeof ACTION_BUTTONS)[0]) => (
    <TouchableOpacity key={button.id} style={styles.actionButton} onPress={() => handleActionButtonPress(button.id)}>
      <View style={[styles.actionIcon, { backgroundColor: button.color }]}>
        <Ionicons name={button.icon as any} size={24} color="#fff" />
      </View>
      <Text style={styles.actionLabel}>{button.label}</Text>
    </TouchableOpacity>
  )

  const renderGroupItem = ({ item }: { item: AdminGroup }) => (
    <TouchableOpacity style={styles.contactItem} onPress={() => Alert.alert(`Open Group: ${item.AdminGroupName}`)}>
      <View style={[styles.contactAvatar, { backgroundColor: '#66bb6a' }]}>
        <Ionicons name="people" size={24} color="#fff" />
      </View>
      <View style={styles.contactDetails}>
        <Text style={styles.contactName}>{item.AdminGroupName}</Text>
        <Text style={styles.contactStatus}>{item.AdminGroupDescription || "No description"}</Text>
      </View>
    </TouchableOpacity>
  )


  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity style={styles.contactItem}>
      <View style={[styles.contactAvatar, { backgroundColor: item.bgColor || "#E8E8E8" }]}>
        {item.initials ? (
          <Text style={styles.initialsText}>{item.initials}</Text>
        ) : (
          <Text style={styles.avatarEmoji}>{item.avatar}</Text>
        )}
      </View>
      <View style={styles.contactDetails}>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.phone && <Text style={styles.contactStatus}>{item.phone}</Text>}
      </View>
    </TouchableOpacity>
  )

  const renderGroupMemberItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedMembers.has(item.id)
    return (
      <TouchableOpacity style={styles.groupMemberItem} onPress={() => toggleMemberSelection(item.id)}>
        <View style={[styles.contactAvatar, { backgroundColor: item.bgColor || "#E8E8E8" }]}>
          {item.initials ? (
            <Text style={styles.initialsText}>{item.initials}</Text>
          ) : (
            <Text style={styles.avatarEmoji}>{item.avatar}</Text>
          )}
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.phone && <Text style={styles.contactStatus}>{item.phone}</Text>}
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    )
  }

  // Group Details Modal
  const renderGroupDetailsModal = () => (
    <Modal visible={groupDetailsModalVisible} animationType="fade" transparent={true} onRequestClose={() => setGroupDetailsModalVisible(false)}>
      <View style={styles.groupDetailsOverlay}>
        <View style={styles.groupDetailsContainer}>
          <Text style={styles.groupDetailsTitle}>Group Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Group Name*</Text>
            <TextInput
              style={styles.detailsInput}
              placeholder="Enter Group Name"
              placeholderTextColor="#999"
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.detailsInput, styles.descriptionInput]}
              placeholder="Enter a description for the group"
              placeholderTextColor="#999"
              value={groupDescription}
              onChangeText={setGroupDescription}
              multiline={true}
              numberOfLines={4}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => {
                setGroupDetailsModalVisible(false);
                setGroupName("");
                setGroupDescription("");
              }}
              disabled={groupCreationLoading}
            >
              <Text style={styles.modalButtonTextCancel}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButtonConfirm, groupCreationLoading && { opacity: 0.5 }]}
              onPress={handleCreateGroupAPI}
              disabled={groupCreationLoading || !groupName.trim()}
            >
              {groupCreationLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalButtonTextConfirm}>Create Group</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  const renderMainScreen = () => (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New chat</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name or number"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.actionButtonsContainer}>{ACTION_BUTTONS.map(renderActionButton)}</View>

          {/* Groups Section */}
          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>My Groups</Text>
            <View style={styles.divider} />

            {isGroupsLoading ? (
              <View style={styles.centeredMessage}>
                <ActivityIndicator size="small" color="#25D366" />
                <Text style={styles.messageTextContent}>Loading groups...</Text>
              </View>
            ) : groupsError ? (
              <View style={styles.centeredMessage}>
                <Ionicons name="alert-circle-outline" size={30} color="#FF6347" />
                <Text style={styles.messageTextContent}>{groupsError}</Text>
                <TouchableOpacity onPress={fetchGroups} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={groups}
                keyExtractor={(item) => item._id}
                renderItem={renderGroupItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                  <View style={styles.centeredMessage}>
                    <Text style={styles.messageTextContent}>No groups created yet.</Text>
                  </View>
                }
              />
            )}
          </View>

          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Contacts</Text>
            <View style={styles.divider} />

            {isContactsLoading ? (
              <View style={styles.centeredMessage}>
                <ActivityIndicator size="large" color="#25D366" />
                <Text style={styles.messageTextContent}>Loading contacts...</Text>
              </View>
            ) : contactsError ? (
              <View style={styles.centeredMessage}>
                <Ionicons name="alert-circle-outline" size={30} color="#FF6347" />
                <Text style={styles.messageTextContent}>Error: {contactsError}</Text>
                <TouchableOpacity onPress={fetchAllStudentContacts} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                renderItem={renderContactItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                  <View style={styles.centeredMessage}>
                    <Text style={styles.messageTextContent}>No contacts found.</Text>
                  </View>
                }
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )

  const renderNewContactScreen = () => (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={() => setActiveModal("main")}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setActiveModal("main")}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New contact</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Email */}
            <View style={styles.formGroup}>
              <View style={styles.inputWithIcon}>
                <Ionicons name="mail-outline" size={25} color="#000000ff" style={styles.formIcon} />
                <TextInput
                  style={styles.formInput}
                  placeholder="Student Email"
                  placeholderTextColor="#000000ff"
                  value={studentEmail}
                  onChangeText={setStudentEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>


            <View style={styles.formGroup}>
              <View style={styles.inputWithIcon}>
                <Ionicons name="person-outline" size={20} color="#000000ff" style={styles.formIcon} />
                <TextInput
                  style={styles.formInput}
                  placeholder="Full Name (Optional)"
                  placeholderTextColor="#000000ff"
                  value={studentName}
                  onChangeText={setStudentName}
                />
              </View>
            </View>


            <TouchableOpacity
              style={[styles.addButton, loading && { opacity: 0.3 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.addButtonText}>
                {loading ? 'Adding Contact...' : 'Add Contact'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>


        <CustomDialog
          visible={dialogVisible}
          type={dialogData.type}
          title={dialogData.title}
          message={dialogData.message}
          onClose={handleCloseDialog}
        />
      </SafeAreaView>
    </Modal>
  )

  const renderAddGroupScreen = () => (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={() => setActiveModal("main")}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setActiveModal("main")}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add group members</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name or number"
              placeholderTextColor="#999"
              value={groupSearchQuery}
              onChangeText={setGroupSearchQuery}
            />
          </View>

          <View style={styles.contactsSection}>
            {/* Displaying selected members at the top */}
            {selectedMembers.size > 0 && (
              <View style={styles.selectedMembersContainer}>
                <Text style={styles.selectedMembersTitle}>{selectedMembers.size} Members Selected:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedMembersScroll}>
                  {Array.from(selectedMembers).map((memberId) => {
                    const member = contacts.find(c => c.id === memberId);
                    if (!member) return null;
                    return (
                      <TouchableOpacity
                        key={member.id}
                        style={styles.selectedMemberChip}
                        onPress={() => toggleMemberSelection(member.id)}
                      >
                        <View style={[styles.contactAvatarSmall, { backgroundColor: member.bgColor || "#E8E8E8" }]}>
                          <Text style={styles.initialsTextSmall}>{member.initials}</Text>
                        </View>
                        <Ionicons name="close-circle" size={18} color="#fff" style={styles.removeIcon} />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>All Contacts</Text>
            <View style={styles.divider} />

            {isContactsLoading ? (
              <View style={styles.centeredMessage}>
                <ActivityIndicator size="large" color="#25D366" />
                <Text style={styles.messageTextContent}>Loading group members...</Text>
              </View>
            ) : contactsError ? (
              <View style={styles.centeredMessage}>
                <Ionicons name="alert-circle-outline" size={30} color="#FF6347" />
                <Text style={styles.messageTextContent}>Error loading members: {contactsError}</Text>
                <TouchableOpacity onPress={fetchAllStudentContacts} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredGroupContacts}
                keyExtractor={(item) => item.id}
                renderItem={renderGroupMemberItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                  <View style={styles.centeredMessage}>
                    <Text style={styles.messageTextContent}>No members found.</Text>
                  </View>
                }
              />
            )}
          </View>
        </ScrollView>

        {selectedMembers.size > 0 && (
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity style={styles.createGroupButton} onPress={handleOpenGroupDetails}>
              <Text style={styles.createGroupButtonText}>Next (Group Details)</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
      {renderGroupDetailsModal()}
      <CustomDialog
        visible={dialogVisible}
        type={dialogData.type}
        title={dialogData.title}
        message={dialogData.message}
        onClose={handleCloseDialog}
      />
    </Modal>
  )

  if (activeModal === "newContact") {
    return renderNewContactScreen()
  }

  if (activeModal === "newGroup") {
    return renderAddGroupScreen()
  }

  return renderMainScreen()
}



const styles = StyleSheet.create({
  container: {
    width: 500,
    backgroundColor: "#f0f0f3",
    alignSelf: "center",
    flex: 1,
    paddingVertical: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginHorizontal: 10,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    borderRadius: 30,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
    tintColor: "#888",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
    padding: 0,
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  contactsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#777",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  groupMemberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#25D366",
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  initialsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  contactStatus: {
    fontSize: 13,
    color: "#888",
    marginTop: 3,
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxSelected: {
    backgroundColor: "#25D366",
    borderColor: "#25D366",
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: { // 🆕 Added for Group Details Modal
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3faff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderCurve: "circular",
    borderWidth: 1,
    borderColor: "#2F2F2F",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  formIcon: {
    marginRight: 12,
    color: "#0c0808ff",
  },
  formInput: {
    flex: 1,
    fontSize: 18,
    color: "#000",
    padding: 0,
  },
  addButton: {
    backgroundColor: "#effff5ff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#0c0e0cff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 1,
  },
  addButtonText: {
    color: "#070505ff",
    fontSize: 19,
    fontWeight: "700",
  },
  bottomButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 0,
  },
  createGroupButton: {
    backgroundColor: "#25D366",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: 'center',
    flexDirection: 'row', // 🆕 To align text and icon
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  createGroupButtonText: {
    color: "#0f0909ff",
    fontSize: 16,
    fontWeight: "700",
  },
  centeredMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageTextContent: {
    marginTop: 10,
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: "#25D366",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // 🆕 Styles for Group Details Modal
  groupDetailsOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  groupDetailsContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  groupDetailsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 30,
    gap: 15,
  },
  modalButtonCancel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999',
    backgroundColor: '#f0f0f0',
    minWidth: 90,
    alignItems: 'center',
  },
  modalButtonConfirm: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#25D366',
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f0909ff',
  },
  // 🆕 Styles for Selected Members Chip
  selectedMembersContainer: {
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedMembersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  selectedMembersScroll: {
    flexDirection: 'row',
  },
  selectedMemberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  contactAvatarSmall: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  initialsTextSmall: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  removeIcon: {
    position: 'absolute',
    right: -5,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 9,
  }
});