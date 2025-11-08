import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const API_BASE_URL = "http://localhost:5200/web";

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

//  <Modal
//         visible={isEditModalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setIsEditModalVisible(false)}
//       >
//         <View style={modalStyles.editOverlay}>
//           <View style={modalStyles.editModalContent}>
//             <Text style={modalStyles.editTitle}>Edit Group</Text>

//             <TextInput
//               style={modalStyles.input}
//               placeholder="Group Name"
//               value={editGroupName}
//               onChangeText={setEditGroupName}
//             />

//             <TextInput
//               style={[modalStyles.input, { height: 80 }]}
//               placeholder="Group Description"
//               multiline
//               value={editGroupDescription}
//               onChangeText={setEditGroupDescription}
//             />

//             <View style={modalStyles.editButtons}>
//               <TouchableOpacity
//                 style={[modalStyles.saveButton, { backgroundColor: "#075E54" }]}
//                 onPress={handleSaveEdit}
//               >
//                 <Text style={{ color: "#fff" }}>Save</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[modalStyles.saveButton, { backgroundColor: "#888" }]}
//                 onPress={() => setIsEditModalVisible(false)}
//               >
//                 <Text style={{ color: "#fff" }}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>


// --- ADD GROUP MEMBERS MODAL ---










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
    const [groupCreationLoading, setGroupCreationLoading] = useState(false); // Group creation loading state

    // ✅ Fetch Faculty Contacts
    const fetchContacts = async () => {
        if (!token) return setError("Authentication token not found.");

        setGroupCreationLoading(true)

        try {
            setLoading(true);
            setError(null);

            const response = await axios.post(
                `${API_BASE_URL}/main-admin/view-contacts`,
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
                const list: Contact[] = data.facultyContactsList[0].facultyContacts.map((c: any) => ({
                    studentId: c.studentId,
                    studentName: c.studentName,
                    studentEmail: c.studentEmail,
                    profilePicture:
                        c.profilePicture ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                }));

                setContacts(list);
                setFilteredContacts(list);
            } else {
                setError(data?.msg || "Failed to load contacts.");
            }
        } catch (err: any) {
            console.error("Error fetching contacts:", err.response?.data || err.message);
            setError("Failed to fetch contacts.");
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


    //     faculty/add-new-member {memberId}
    const addNewMember = () => {
        const memberIds = Array.from(selectedMembers)
        console.log(memberIds)
    }

    const handleCreatAddMemberGroupAPI = async () => {
        if (!token) {
            Alert.alert("Error", "Authentication token missing!");
            return;
        }

        if (!groupId) {
            Alert.alert("Error", "Group ID missing!");
            return;
        }

        if (selectedMembers.length === 0) {
            Alert.alert("No Members Selected", "Please select at least one member to add.");
            return;
        }

        setIsAdding(true);

        try {
            for (const memberId of selectedMembers) {
                const selectedMember = contacts.find((c) => c.studentId === memberId);
                if (!selectedMember) continue;

                const payload = {

                    groupId: groupId,
                    memberId: memberId,
                    memberName: selectedMember.studentName,
                    memberType: "student",
                };

                console.log("📤 Sending add member payload:", payload);

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

                if (result.status !== 1) {
                    console.error("❌ Failed to add member:", result.msg);
                    Alert.alert("Failed", result.msg || "Something went wrong");
                    continue;
                }

                console.log("✅ Member added:", result.updatedGroup);
            }

            Alert.alert("Success", "All selected members added successfully!");
            onClose();

        } catch (error: any) {
            console.error("Error adding new members:", error.response?.data || error.message);
            Alert.alert("Error", error.response?.data?.msg || "Something went wrong while adding members.");
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








// --- MAIN GROUP MEMBERS MODAL ---
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

    const fetchContacts = async () => {
           if (!token) return setError("Authentication token not found. Please log in.");
   
           try {
               setLoading(true);
               setError(null);
   
               const { data } = await axios.post(
                   `${API_BASE_URL}/faculty/view-group-members`,
                   { groupId },
                   {
                       headers: {
                           "Content-Type": "application/json",
                           Authorization: `Bearer ${token}`,
                       },
                   }
               );
   
               if (data?.status === 1) {
                   const groupData = data?.facultyGroup?.[0];
                   const membersList = groupData?.facultyGroupMembers || [];
   
                   if (Array.isArray(membersList) && membersList.length > 0) {
                       const formatted: GroupMember[] = membersList.map((m: any, i: number) => ({
                           _id: m._id,
                           phone: m.memberId,
                           name: ` ${m.memberName} `,
                           status: "Active",
                           isAdmin: i === 0,
                           profilePicture:
                               "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                       }));
   
                       setMembers(formatted);
                   } else {
                       setError("No members found.");
                   }
               } else {
                   setError(data?.msg || "Failed to load members.");
               }
           } catch (err: any) {
               console.error("Error fetching contacts:", err.response?.data || err.message);
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
                `${API_BASE_URL}/main-admin/remove-from-group/${mId}`,
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
        fetchContacts();
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
                    facultyId="FacultyId"
                    token={token}
                    onClose={handleCloseAddMemberModal}
                    groupName={groupName}


                />
            )}

            <View style={modalStyles.container}>
                <View style={modalStyles.header}>
                    <TouchableOpacity onPress={onClose} style={modalStyles.iconButton}>
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>

                    <Text style={modalStyles.headerTitle} numberOfLines={1}>
                        {groupName}
                    </Text>

                    <TouchableOpacity
                        style={modalStyles.iconButton}
                        onPress={() => console.log("Edit group clicked")}
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
    //      addModalOverlay: { flex: 1, backgroundColor: "#00000099", justifyContent: "center" },
    //   addModalContent: {
    //     backgroundColor: "#fff",
    //     margin: 20,
    //     borderRadius: 10,
    //     overflow: "hidden",
    //     height: "85%",
    //   },
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
});

export default GroupMembersModal;
