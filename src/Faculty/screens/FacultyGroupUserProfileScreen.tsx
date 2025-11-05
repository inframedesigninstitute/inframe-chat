import type { RootState } from "@/src/Redux/Store/store"; // 2. Import RootState (adjust path if needed)
import React, { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux'; // 1. Import useSelector
import GroupMembersModal from '../components/GroupMembersModal';

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

                {/* Professional Information */}
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

                {/* Bio Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.bioText}>{userProfile.bio}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="call" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Call</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="videocam" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Video Call</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="mail" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Message</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Group Members Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                {/* 5. FIX: Pass groupId and token instead of members */}
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
    // ... (Your original styles remain the same) ...
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
        backgroundColor: '#075E54',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
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