import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MainLayout from '../components/MainLayout';
import WebBackButton from '../components/WebBackButton';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/types';
import UserProfileScreen from './UserProfileScreen';

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const EnhancedSettingsScreen = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { user, setUser } = useUser();
  
  // Notification Settings
  const [chatTones, setChatTones] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [groupTones, setGroupTones] = useState(true);

  // Chat Settings
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [showUserProfile, setShowUserProfile] = useState(false);

  const handleEditProfile = () => {
    setShowUserProfile(true);
  };

  const handleEditPicture = () => {
    Alert.alert('Edit Picture', 'Picture editing functionality will be implemented');
  };

  const handleChatTheme = () => {
    Alert.alert(
      'Chat Theme',
      'Choose your chat theme',
      [
        { text: 'Default', onPress: () => setSelectedTheme('default') },
        { text: 'Dark', onPress: () => setSelectedTheme('dark') },
        { text: 'Blue', onPress: () => setSelectedTheme('blue') },
        { text: 'Green', onPress: () => setSelectedTheme('green') },
      ]
    );
  };

  const handleStarredMessages = () => {
    navigation.navigate('StarredMessages');
  };

  const handleBackgroundPicture = () => {
    Alert.alert('Background Picture', 'Background picture selection will be implemented');
  };

  const handleConnectERP = () => {
    Alert.alert('Connect to ERP', 'ERP integration will be implemented');
  };

  const handleConnectAlumnus = () => {
    Alert.alert('Connect to Alumnus App', 'Alumnus app integration will be implemented');
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color="#075E54" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color="#999" />}
    </TouchableOpacity>
  );

  const userProfile = user ? {
    name: user.name || 'Your Name',
    email: user.email || 'your.email@example.com',
    phone: user.phoneNumber || '+91 98765 43210',
    bio: user.bio || 'This is a sample bio for the user profile.',
    fatherName: user.fatherName || 'Father Name',
    operator: 'John Doe', // Default operator since not in User interface
    department: user.department || 'Sales',
    profilePicture: user.profilePicture,
  } : null;

  return (
    <MainLayout
      activeTab="Settings"
      showRightContent={showUserProfile}
      rightContent={userProfile ? (
        <UserProfileScreen
          userProfile={userProfile}
          onClose={() => setShowUserProfile(false)}
        />
      ) : null}
      onRightContentClose={() => setShowUserProfile(false)}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <WebBackButton />
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.profileSection} onPress={handleEditProfile}>
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  user?.profilePicture
                    ? { uri: user.profilePicture }
                    : require('../../assets/inframe-logo.jpg')
                }
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.editImageButton} onPress={handleEditPicture}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Your Name'}</Text>
              <Text style={styles.profileBio}>
                {user?.bio || 'Bio not editable - contact admin to update'}
              </Text>
              <Text style={styles.profileRole}>
                {user?.role === 'student' ? 'Student' : 
                 user?.role === 'faculty' ? 'Faculty' : 'Admin'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Chat Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat Settings</Text>
          
          <SettingItem
            icon="color-palette"
            title="Chat Theme"
            subtitle={`Current: ${selectedTheme}`}
            onPress={handleChatTheme}
          />
          
          <SettingItem
            icon="star"
            title="Starred Messages"
            subtitle="Important messages you've starred"
            onPress={handleStarredMessages}
          />
          
          <SettingItem
            icon="image"
            title="Background Picture"
            subtitle="Customize your chat background"
            onPress={handleBackgroundPicture}
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingItem
            icon="musical-notes"
            title="Chat Tones"
            subtitle="Play sound for new messages"
            rightElement={
              <Switch
                value={chatTones}
                onValueChange={setChatTones}
                trackColor={{ false: '#ccc', true: '#075E54' }}
              />
            }
          />
          
          <SettingItem
            icon="phone-portrait"
            title="Vibrate"
            subtitle="Vibrate for notifications"
            rightElement={
              <Switch
                value={vibrate}
                onValueChange={setVibrate}
                trackColor={{ false: '#ccc', true: '#075E54' }}
              />
            }
          />
          
          <SettingItem
            icon="people"
            title="Group Tones"
            subtitle="Play sound for group messages"
            rightElement={
              <Switch
                value={groupTones}
                onValueChange={setGroupTones}
                trackColor={{ false: '#ccc', true: '#075E54' }}
              />
            }
          />
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          
          <SettingItem
            icon="mail"
            title="Support Email"
            subtitle="support@inframe.edu"
            onPress={() => Alert.alert('Support', 'Email: support@inframe.edu')}
          />
          
          <SettingItem
            icon="shield-checkmark"
            title="Admin Support"
            subtitle="Contact admin for technical issues"
            onPress={() => Alert.alert('Admin Support', 'admin@inframe.edu')}
          />
          
          <SettingItem
            icon="school"
            title="Faculty Support"
            subtitle="Academic support and guidance"
            onPress={() => Alert.alert('Faculty Support', 'faculty@inframe.edu')}
          />
          
          <SettingItem
            icon="document-text"
            title="Terms & Conditions"
            onPress={() => navigation.navigate('Terms')}
          />
          
          <SettingItem
            icon="lock-closed"
            title="Privacy Policy"
            onPress={() => navigation.navigate('Privacy')}
          />
          
          <SettingItem
            icon="information-circle"
            title="App Info"
            onPress={() => navigation.navigate('AppInfo')}
          />
        </View>

        {/* Connected Apps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Apps</Text>
          
          <SettingItem
            icon="desktop"
            title="ERP Panel"
            subtitle="Connect to institutional ERP system"
            onPress={handleConnectERP}
          />
          
          <SettingItem
            icon="people-circle"
            title="Alumnus App"
            subtitle="Connect with alumni network"
            onPress={handleConnectAlumnus}
          />
        </View>

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Tools</Text>
            
            <SettingItem
              icon="settings"
              title="Admin Dashboard"
              subtitle="Manage user approvals and system settings"
              onPress={() => navigation.navigate('AdminDashboard')}
            />
          </View>
        )}

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: () => {
                      setUser(null);
                      navigation.navigate('Login');
                    }
                  },
                ]
              );
            }}
          >
            <Ionicons name="log-out" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </SafeAreaView>
    </MainLayout>
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#075E54',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#075E54',
    borderRadius: 12,
    padding: 4,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 12,
    color: '#075E54',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
});

export default EnhancedSettingsScreen;