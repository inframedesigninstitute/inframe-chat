import type { RootState } from "../../Redux/Store/store"; // 2. Import RootState (adjust path if needed)
import axios from "axios";
import React, { useState } from 'react';
import {
    Alert, // Imported Alert for native dialogs
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux'; 
import GroupMembersModal from '../components/GroupMembersModal';

const API_BASE_URL = "http://localhost:5200/web";


interface GroupMember {
    phone: string;
    name?: string;
    status?: string;
    isAdmin: boolean;
    profilePicture?: string;
}


interface GroupMembersModalProps {
    groupId: string;
    token: string;
    onClose: () => void;
    groupName: string;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    bio: string;
    fatherName: string;
    operator: string;
    department: string;
    profilePicture?: string;
    groupMembers: GroupMember[];
}

interface UserProfileScreenProps {
    userProfile: UserProfile;
    onClose: () => void;
}



const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
    userProfile,
    onClose,
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const memberCount = userProfile.groupMembers.length;

    const token = useSelector((state: RootState) => state.facultyStore.token);

    const handleStatusPress = () => {
        setIsModalVisible(true);
    };

    const handleDeleteStudent = () => {
        if (!token) {
            Alert.alert("Authentication Error", "Authentication token not found.");
            return;
        }

        // FIX: Use Alert.alert for confirmation instead of the web-specific `confirm`
        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete ${userProfile.name} (${userProfile.id})? This action cannot be undone.`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { data } = await axios.post(
                                `http://localhost:5200/web/faculty/remove-member/${userProfile.id}`,
                                { facultyId: userProfile.operator }, // 👈 replace with actual faculty ID if available
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            if (data.status === 1) {
                                Alert.alert("Success", "Student deleted successfully!");
                                onClose(); // close profile after delete
                            } else {
                                Alert.alert("Failed", data.msg || "Failed to delete student.");
                            }
                        } catch (error: any) {
                            console.error("Error deleting student:", error.response?.data || error.message);
                            Alert.alert("Server Error", "Server error occurred while deleting student.");
                        }
                    }
                }
            ]
        );
    };


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#075E54" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Profile Image Section */}
                <View style={styles.profileImageSection}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={
                                userProfile.profilePicture
                                    ? { uri: userProfile.profilePicture }
                                    // NOTE: Replace local require with URI for web compatibility
                                    : { uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }
                            }
                            style={styles.profileImage}
                        />
                        <View style={styles.onlineIndicator} />
                    </View>
                    <Text style={styles.userName}>{userProfile.name}</Text>

                    {/* UPDATED: TouchableOpacity instead of Text */}
                    <TouchableOpacity onPress={handleStatusPress}>
                        <Text style={styles.userStatus}>
                            Group ·**{memberCount} members**
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="mail" size={20} color="#075E54" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{userProfile.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="call" size={20} color="#075E54" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{userProfile.phone}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="person" size={20} color="#075E54" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Father's Name</Text>
                            <Text style={styles.infoValue}>{userProfile.fatherName}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Information</Text>

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="person-circle" size={20} color="#075E54" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Operator</Text>
                            <Text style={styles.infoValue}>{userProfile.operator}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="business" size={20} color="#075E54" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Department</Text>
                            <Text style={styles.infoValue}>{userProfile.department}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={handleDeleteStudent}>
                    <Ionicons name="trash-outline" size={20} color="#000000ff" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>



            </ScrollView>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                {token && userProfile.id ? (
                    <GroupMembersModal
                        groupId={userProfile.id}
                        token={token}
                        onClose={() => setIsModalVisible(false)}
                        groupName={userProfile.name}
                    />
                ) : (
                    <View style={styles.modalError}>
                        <Text style={styles.modalErrorText}>Group ID or Token missing.</Text>
                        <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                            <Text style={styles.modalCloseLink}>Close</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#075E54',
    },
    closeButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    profileImageSection: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#25D366',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    userStatus: {
        fontSize: 14,
        color: '#080a09ff',
        fontWeight: '500',
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 8,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#075E54',
        marginBottom: 16,
        marginHorizontal: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    bioText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginHorizontal: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#a5e4a5ff',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        marginLeft: 50,
        marginRight: 50
    },
    actionButtonText: {
        color: '#030303ff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    // New styles for modal error fallback
    modalError: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalErrorText: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 20,
    },
    modalCloseLink: {
        fontSize: 16,
        color: '#25D366',
        textDecorationLine: 'underline',
    }
});

export default UserProfileScreen;