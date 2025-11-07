import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
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

interface StudentContact {
    studentId: string;
    studentName: string;
    studentEmail?: string;
}

interface GroupMembersModalProps {
    groupId: string;
    token: string;
    onClose: () => void;
    groupName: string;
}

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

    // ✅ Fetch all contacts
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
                    const formatted: GroupMember[] = membersList.map(

                        (m: any, i: number) => ({
                            _id: m._id,
                            phone: m.memberId,
                            name: ` ${i + 1} ${m.memberName} `,
                            status: "Active",
                            isAdmin: i === 0,
                            profilePicture: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                        })
                    );

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
        console.log('group id ', groupId)
        console.log('member id which is deleted', mId)
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

            if (!data || typeof data !== "object") {
                setError("Unexpected server response.");
                await fetchContacts();
                return;
            }

            if (data.status === 1) {
                setMembers((prevMembers) =>
                    Array.isArray(prevMembers)
                        ? prevMembers.filter((m) => m._id !== mId)
                        : []
                );
            } else {
                // ❌ Failed deletion → refresh from server so UI stays correct
                setError(data.msg || "Failed to remove member from group.");
                console.warn("Backend error:", data);
                await fetchContacts(); // 🔄 restore actual data
            }
        } catch (err: any) {
            console.error("Error removing member:", err.response?.data || err.message);
            setError("Network or server error occurred while removing member.");
            await fetchContacts(); // 🔄 in case of failure, restore actual data
        } finally {
            setRemovingId(null);
        }
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
                <Text style={modalStyles.memberStatus} numberOfLines={1}>
                    {member.status}
                </Text>
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

    // ✅ Main render conditionally
    return (
        <View style={modalStyles.container}>
            {/* Header */}
            <View style={modalStyles.header}>
                <TouchableOpacity onPress={onClose} style={modalStyles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={modalStyles.headerTitle} numberOfLines={1}>
                    {groupName}
                </Text>
                <Ionicons name="search" size={24} color="#fff" />
            </View>

            {/* Sub-header */}
            <View style={modalStyles.subHeader}>
                <Text style={modalStyles.memberCountText}>
                    {members.length} members
                </Text>
            </View>

            {/* Content */}
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
                    <TouchableOpacity
                        onPress={fetchContacts}
                        style={modalStyles.retryButton}
                    >
                        <Text style={modalStyles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : members.length === 0 ? (
                <View style={modalStyles.centeredMessage}>
                    <Text style={modalStyles.messageTextContent}>
                        No members found.
                    </Text>
                </View>
            ) : (
                <ScrollView style={modalStyles.scrollView}>
                    {sortedMembers.map(renderMemberItem)}
                </ScrollView>
            )}
        </View>
    );
};


const modalStyles = StyleSheet.create({
    container: {
        width: "60%",
        backgroundColor: '#fff',
        alignContent: "center",
        alignSelf: "center",
        height: '80%',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 20,
    },
    removeButton: {
        padding: 8,
        marginLeft: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#075E54',
    },
    backButton: { paddingRight: 16 },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    searchContainer: { paddingLeft: 16 },
    subHeader: {
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    memberCountText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    scrollView: { flex: 1 },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    profileImageContainer: { marginRight: 12 },
    profileImage: { width: 48, height: 48, borderRadius: 24 },
    memberInfo: { flex: 1, justifyContent: 'center' },
    memberName: { fontSize: 16, fontWeight: '500', color: '#000' },
    memberStatus: { fontSize: 14, color: '#666' },
    adminTag: {
        fontSize: 12,
        color: '#075E54',
        fontWeight: '600',
        marginLeft: 10,
        backgroundColor: '#e6ffef',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    centeredMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
});

export default GroupMembersModal;