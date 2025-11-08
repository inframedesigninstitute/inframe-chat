import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const API_BASE_URL = "http://localhost:5200/web";

// --- INTERFACES (Kept as is) ---
interface GroupMember {
    _id: string;
    phone: string;
    name?: string;
    status?: string;
    isAdmin: boolean;
    profilePicture?: string;
}

interface Contact {
    studentId: string;
    studentName: string;
    studentEmail?: string;
    profilePicture?: string;
}
interface EditGroupModalProps {
    visible: boolean;
    onClose: () => void;
    groupId: string;
    facultyId: string;
    token: string;
    groupName: string;
    groupDescription?: string;
    onGroupUpdated: (updatedGroup: any) => void;
}
interface GroupMembersModalProps {
    groupId: string;
    token: string;
    onClose: () => void;
    groupName: string;
}

interface PotentialMember {
    _id: string;
    name: string;
    phone: string;
    profilePicture?: string;
}

interface AddMembersModalProps {
    groupId: string;
    token: string;
    onClose: () => void;
    groupName: string;
    facultyId: string;
}

type StudentContact = {
    studentId: string;
    studentName: string;
    studentEmail?: string;
};


// --- EditGroupModal Component (Kept as is for context) ---
const EditGroupModal: React.FC<EditGroupModalProps> = ({
    visible,
    onClose,
    groupId,
    facultyId,
    token,
    groupName,
    groupDescription = "",
    onGroupUpdated,
}) => {
    const [newName, setNewName] = useState(groupName);
    const [newDescription, setNewDescription] = useState(groupDescription);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setNewName(groupName);
            setNewDescription(groupDescription);
        }
    }, [visible, groupName, groupDescription]);


    const handleUpdateGroup = async () => {
        if (!newName.trim()) {
            Alert.alert("Validation Error", "Group name cannot be empty.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/faculty/change-group-details`,
                {
                    facultyId,
                    groupId,
                    newGroupName: newName.trim(),
                    newGroupDescription: newDescription.trim(),
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = response.data;
            console.log("Edit group response:", data);

            if (data.status === 1) {
                Alert.alert("Success", "Group details updated successfully.");
                onGroupUpdated(data.updatedGroup);
                onClose();
            } else {
                Alert.alert("Error", data.msg || "Failed to update group.");
            }
        } catch (err: any) {
            console.error("Error updating group:", err.response?.data || err.message);
            Alert.alert("Error", "Something went wrong while updating group details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={modalStyles.overlay}>
                <View style={modalStyles.modalContainer}>
                    <Text style={modalStyles.headerTitle}>Edit Group</Text>

                    <TextInput
                        style={modalStyles.input}
                        placeholder="Enter new group name"
                        value={newName}
                        onChangeText={setNewName}
                    />

                    <TextInput
                        style={[modalStyles.input, { height: 90 }]}
                        placeholder="Enter group description"
                        value={newDescription}
                        multiline
                        onChangeText={setNewDescription}
                    />

                    <View style={modalStyles.buttonRow}>
                        <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
                            <Text style={modalStyles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={modalStyles.updateButton}
                            onPress={handleUpdateGroup}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={modalStyles.updateText}>Update</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


// --- AddGroupMembersModal Component (Kept as is for context) ---
const AddGroupMembersModal: React.FC<AddMembersModalProps> = ({
    groupId,
    token,
    onClose,
    facultyId,
    groupName,
}) => {
    const [availableContacts, setAvailableContacts] = useState<PotentialMember[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [studentEmail, setStudentEmail] = useState('')
    const [studentName, setStudentName] = useState("")
    const [members, setMembers] = useState<GroupMember[]>([]);

    const [groupCreationLoading, setGroupCreationLoading] = useState(false); // Group creation loading state
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogData, setDialogData] = useState({
        type: "success" as "success" | "error" | "warning",
        title: "",
        message: "",
    });
    // ✅ Fetch Faculty Contacts



    const fetchContacts = async () => {
        if (!token) {
            setError("Authentication token not found. Please log in.");
            return;
        }

        setLoading(true);
        setError(null);

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
                const students: Contact[] = data.allStudentData.map((student: any) => ({
                    studentId: student._id || student.id,
                    studentName: student.studentName || "Unnamed Student",
                    studentEmail: student.studentEmail || "N/A",
                    profilePicture:
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                }));

                setContacts(students);
                setFilteredContacts(students);
            } else {
                setContacts([]);
                setFilteredContacts([]);
                setError("No students found.");
            }
        } catch (err: any) {
            console.error("Error fetching students:", err.message);
            setError("Failed to fetch student contacts.");
            setContacts([]);
            setFilteredContacts([]);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchContacts();
    }, [token]);


    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (!text.trim()) {
            setFilteredContacts(contacts);
        } else {
            const filtered = contacts.filter(
                (c) =>
                    c.studentName.toLowerCase().includes(text.toLowerCase()) ||
                    c.studentEmail?.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredContacts(filtered);
        }
    };

    const toggleSelectMember = (memberId: string) => {
        setSelectedMembers((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    };


    //       faculty/add-new-member {memberId}
    const addNewMember = () => {
        const memberIds = Array.from(selectedMembers)
        console.log(memberIds)
    }


 const handleCreatAddMemberGroupAPI = async () => {
        if (!token) {
            setDialogData({
                type: "error",
                title: "Unauthorized",
                message: "Authentication token missing. Please log in again.",
            });
            setDialogVisible(true);
            return;
        }

        if (!facultyId || !groupId) {
            setDialogData({
                type: "error",
                title: "Missing Data",
                message: "Faculty ID or Group ID is missing.",
            });
            setDialogVisible(true);
            return;
        }

        if (selectedMembers.length === 0) {
            setDialogData({
                type: "warning",
                title: "No Members Selected",
                message: "Please select at least one member to add.",
            });
            setDialogVisible(true);
            return;
        }

        setIsAdding(true);

        try {
            for (const memberId of selectedMembers) {
                const selectedMember = contacts.find((m) => m.studentId === memberId);
                if (!selectedMember) continue;

                // ✅ Build payload exactly as backend expects
                const payload = {
                    facultyId,
                    groupId,
                    memberId: selectedMember.studentId,
                    memberName: selectedMember.studentName,
                    memberType: "student",
                };

                console.log("📤 Sending payload:", payload);

                const response = await axios.post(
                    `${API_BASE_URL}/main-admin/add-new-member`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const result = response.data;
                console.log("✅ Response:", result);

                if (result.status !== 1) {
                    console.error("❌ Add Member Failed:", result.msg);
                    setDialogData({
                        type: "error",
                        title: "Add Failed",
                        message: result.msg || "Could not add member to the group.",
                    });
                    setDialogVisible(true);
                    continue;
                }
            }

            // ✅ All done successfully
            setDialogData({
                type: "success",
                title: "Success",
                message: "All selected members have been added successfully!",
            });
            setDialogVisible(true);

            // Refresh updated data
            await fetchContacts();
            onClose();
        } catch (error: any) {
            console.error("Error adding member:", error.response?.data || error.message);
            setDialogData({
                type: "error",
                title: "Server Error",
                message:
                    error.response?.data?.msg || "Something went wrong while adding member.",
            });
            setDialogVisible(true);
        } finally {
            setIsAdding(false);
        }
    };

    const renderContactItem = (contact: Contact) => {
        const isSelected = selectedMembers.includes(contact.studentId);
        return (
            <TouchableOpacity
                key={contact.studentId}
                style={modalStyles.memberItemAdd}
                onPress={() => toggleSelectMember(contact.studentId)}
            >
                <View style={modalStyles.profileImageContainer}>
                    <Image
                        source={{
                            uri:
                                contact.profilePicture ||
                                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                        }}
                        style={modalStyles.profileImage}
                    />
                </View>

                <View style={modalStyles.memberInfo}>
                    <Text style={modalStyles.memberName} numberOfLines={1}>
                        {contact.studentName}
                    </Text>
                </View>

                <Ionicons
                    name={isSelected ? "checkbox-outline" : "square-outline"}
                    size={24}
                    color={isSelected ? "#075E54" : "#666"}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={modalStyles.addModalOverlay}>
            <View style={modalStyles.addModalContent}>
                <View style={modalStyles.header}>
                    <TouchableOpacity onPress={onClose} style={modalStyles.iconButton}>
                        <Ionicons name="close" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={modalStyles.headerTitle} numberOfLines={1}>
                        Add to {groupName}{" "}
                        {selectedMembers.length > 0 && ` (${selectedMembers.length})`}
                    </Text>
                    <TouchableOpacity
                        disabled={selectedMembers.length === 0 || isAdding}
                        style={modalStyles.iconButton}
                    >
                        {isAdding ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons
                                onPress={handleCreatAddMemberGroupAPI}
                                name="checkmark-circle"
                                size={22}
                                color={selectedMembers.length > 0 ? "#fff" : "#888"}
                            />

                        )}
                    </TouchableOpacity>
                </View>

                <View style={modalStyles.searchContainerAdd}>
                    <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
                    <TextInput
                        style={modalStyles.searchInput}
                        placeholder="Search student by name or email"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                {loading ? (
                    <View style={modalStyles.centeredMessage}>
                        <ActivityIndicator size="large" color="#075E54" />
                        <Text style={modalStyles.messageTextContent}>Loading students...</Text>
                    </View>
                ) : error && filteredContacts.length === 0 ? (
                    <View style={modalStyles.centeredMessage}>
                        <Text style={[modalStyles.messageTextContent, { color: "#FF6347" }]}>
                            {error}
                        </Text>
                        <TouchableOpacity onPress={fetchContacts} style={modalStyles.retryButton}>
                            <Text style={modalStyles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredContacts.length === 0 ? (
                    <View style={modalStyles.centeredMessage}>
                        <Text style={modalStyles.messageTextContent}>No matching members found.</Text>
                    </View>
                ) : (
                    <ScrollView style={modalStyles.scrollView}>
                        <Text style={modalStyles.listHeader}>
                            Available Contacts ({filteredContacts.length})
                        </Text>
                        {filteredContacts.map(renderContactItem)}
                    </ScrollView>
                )}
            </View>
        </View>
    );
};


// --- MAIN GROUP MEMBERS MODAL (Fixed) ---
const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
    groupId,
    token,
    onClose,
    groupName,
}) => {
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    // 1. New state for Edit Group Modal
    const [showEditGroupModal, setShowEditGroupModal] = useState(false);
    // 2. New state for group details (to pass to EditGroupModal)
    const [currentGroupName, setCurrentGroupName] = useState(groupName);
    const [currentGroupDescription, setCurrentGroupDescription] = useState("");


    // FIX: Placeholder facultyId is required for AddGroupMembersModal
    // In a real app, this should come from context or props.
    const FACULTY_ID_PLACEHOLDER = "FACULTY_ID_REQUIRED";

    const fetchContacts = async () => {
        if (!token) {
            setError("Authentication token not found. Please log in.");
            return;
        }

        if (!groupId) {
            setError("Group ID is missing. Please try again.");
            console.error("❌ Missing groupId in fetchContacts");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log("🔍 Fetching members for groupId:", groupId);

            const { data } = await axios.post(
                `${API_BASE_URL}/main-admin/view-faculty-group-members`,
                { groupId },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("✅ API Response:", data);

            if (data?.status === 1) {
                const membersList = data?.data || [];

                if (Array.isArray(membersList) && membersList.length > 0) {
                    const formatted: GroupMember[] = membersList.map((m: any, i: number) => ({
                        _id: m._id,
                        phone: m.memberId || "N/A",
                        name: m.memberName?.trim() || "Unnamed Member",
                        status: "Active",
                        isAdmin: i === 0,
                        profilePicture:
                            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                    }));

                    setMembers(formatted);
                } else {
                    setError("No members found in this group.");
                    setMembers([]);
                }
            } else if (data?.status === -1) {
                setError("This group was not found in the database. It may have been deleted or created by another user.");
                setMembers([]);
            } else {
                setError(data?.msg || "Failed to load group members.");
                setMembers([]);
            }
        } catch (err: any) {
            console.error(" Error fetching contacts:", err.response?.data || err.message);
            setError("Network error occurred while fetching members.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (mId: string) => {
        if (!token) {
            setError("Authentication token not found.");
            return;
        }

        try {
            setRemovingId(mId);
            setError(null);

            const { data } = await axios.post(
                `${API_BASE_URL}/faculty/remove-from-group/${mId}`,
                { groupId },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.status === 1) {
                setMembers((prev) => prev.filter((m) => m._id !== mId));
            } else {
                setError(data.msg || "Failed to remove member.");
            }
        } catch (err: any) {
            console.error("Error removing member:", err.response?.data || err.message);
            setError("Network or server error occurred.");
        } finally {
            setRemovingId(null);
        }
    };

    const handleOpenAddMemberModal = () => setShowAddMemberModal(true);
    const handleCloseAddMemberModal = () => {
        setShowAddMemberModal(false);
        fetchContacts(); // Refresh list after adding members
    };

    // 3. Handlers for Edit Group Modal
    const handleOpenEditGroupModal = () => setShowEditGroupModal(true);
    const handleCloseEditGroupModal = () => setShowEditGroupModal(false);
    const handleGroupUpdated = (updatedGroup: any) => {
        // This function will update the local state when the edit modal successfully changes the group details
        setCurrentGroupName(updatedGroup.groupName);
        setCurrentGroupDescription(updatedGroup.groupDescription || "");
        // Optionally re-fetch members if the update could affect the member list (not usually the case for name/description)
    };


    useEffect(() => {
        fetchContacts();
    }, [groupId, token]);

    const sortedMembers = [...members].sort((a, b) =>
        a.isAdmin === b.isAdmin ? 0 : a.isAdmin ? -1 : 1
    );

    const renderMemberItem = (member: GroupMember) => (
        <View key={member._id} style={modalStyles.memberItem}>
            <View style={modalStyles.profileImageContainer}>
                <Image
                    source={{
                        uri:
                            member.profilePicture ||
                            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                    }}
                    style={modalStyles.profileImage}
                />
            </View>
            <View style={modalStyles.memberInfo}>
                <Text style={modalStyles.memberName} numberOfLines={1}>
                    {member.name || `+${member.phone}`}
                </Text>
                <Text style={modalStyles.memberStatus}>{member.status}</Text>
            </View>

            {member.isAdmin && <Text style={modalStyles.adminTag}>Admin</Text>}

            <TouchableOpacity
                style={modalStyles.removeButton}
                onPress={() => handleRemoveMember(member._id)}
                disabled={removingId === member._id}
            >
                {removingId === member._id ? (
                    <ActivityIndicator size="small" color="#FF4500" />
                ) : (
                    <Ionicons name="remove-circle-outline" size={24} color="#FF4500" />
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            {showAddMemberModal && (
                <AddGroupMembersModal
                    groupId={groupId}
                    facultyId={FACULTY_ID_PLACEHOLDER}
                    token={token}
                    onClose={handleCloseAddMemberModal}
                    groupName={currentGroupName}
                />
            )}

            {/* 4. Include the EditGroupModal component */}
            <EditGroupModal
                visible={showEditGroupModal}
                onClose={handleCloseEditGroupModal}
                groupId={groupId}
                facultyId={FACULTY_ID_PLACEHOLDER} // Needs actual facultyId
                token={token}
                groupName={currentGroupName}
                groupDescription={currentGroupDescription}
                onGroupUpdated={handleGroupUpdated}
            />

            <View style={modalStyles.container}>
                <View style={modalStyles.header}>
                    <TouchableOpacity onPress={onClose} style={modalStyles.iconButton}>
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>

                    <Text style={modalStyles.headerTitle} numberOfLines={1}>
                        {currentGroupName}
                    </Text>

                    {/* 5. FIX: Call the handler function, not the component itself */}
                    <TouchableOpacity
                        style={modalStyles.iconButton}
                        onPress={handleOpenEditGroupModal}
                    >
                        <Ionicons name="create-outline" size={22} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={modalStyles.iconButton}
                        onPress={handleOpenAddMemberModal}
                    >
                        <Ionicons name="person-add-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={modalStyles.subHeader}>
                    <Text style={modalStyles.memberCountText}>
                        {members.length} members
                    </Text>
                </View>

                {loading ? (
                    <View style={modalStyles.centeredMessage}>
                        <ActivityIndicator size="large" color="#121414ff" />
                        <Text style={modalStyles.messageTextContent}>Loading members...</Text>
                    </View>
                ) : error ? (
                    <View style={modalStyles.centeredMessage}>
                        <Text style={[modalStyles.messageTextContent, { color: "#FF6347" }]}>
                            {error}
                        </Text>
                        <TouchableOpacity onPress={fetchContacts} style={modalStyles.retryButton}>
                            <Text style={modalStyles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : members.length === 0 ? (
                    <View style={modalStyles.centeredMessage}>
                        <Text style={modalStyles.messageTextContent}>No members found.</Text>
                    </View>
                ) : (
                    <ScrollView style={modalStyles.scrollView}>
                        {sortedMembers.map(renderMemberItem)}
                    </ScrollView>
                )}
            </View>
        </>
    );
};

// --- Stylesheet (Kept as is for context) ---
const modalStyles = StyleSheet.create({
    container: {
        width: "60%",
        backgroundColor: "#fff",
        alignSelf: "center",
        height: "80%",
        borderRadius: 10,
        overflow: "hidden",
        elevation: 20,
    },
    addModalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    addModalContent: {
        width: "60%",
        backgroundColor: "#fff",
        height: "80%",
        borderRadius: 10,
        overflow: "hidden",
        elevation: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#075E54",
    },
    iconButton: { paddingHorizontal: 6 },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        marginHorizontal: 8,
    },
    subHeader: {
        padding: 16,
        backgroundColor: "#f5f5f5",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    memberCountText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    scrollView: { flex: 1 },
    memberItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    memberItemAdd: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    profileImageContainer: { marginRight: 12 },
    profileImage: { width: 48, height: 48, borderRadius: 24 },
    memberInfo: { flex: 1 },
    memberName: { fontSize: 16, fontWeight: "500", color: "#000" },
    memberStatus: { fontSize: 14, color: "#666" },
    adminTag: {
        fontSize: 12,
        color: "#075E54",
        fontWeight: "600",
        marginLeft: 10,
        backgroundColor: "#e6ffef",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    centeredMessage: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
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
    searchContainerAdd: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#f9f9f9",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
    },
    listHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#e6ffef",
        fontSize: 14,
        fontWeight: "600",
        color: "#075E54",
    },
    removeButton: { padding: 6 },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        color: "#333",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: "#ccc",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    cancelText: {
        color: "#333",
        fontWeight: "bold",
    },
    updateButton: {
        backgroundColor: "#1E90FF",
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 8,
    },
    updateText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default GroupMembersModal;