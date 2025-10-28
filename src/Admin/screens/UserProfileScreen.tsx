import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  fatherName: string;
  operator: string;
  department: string;
  profilePicture?: string;
}

interface UserProfileScreenProps {
  userProfile: UserProfile;
  onClose: () => void;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  userProfile,
  onClose,
}) => {
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
                  : require('../assets/inframe-logo.jpg')
              }
              style={styles.profileImage}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userStatus}>Online</Text>
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
    color: '#25D366',
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
});

export default UserProfileScreen;