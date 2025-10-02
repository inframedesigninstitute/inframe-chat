import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TopBar from '../components/TopBar';
import { MainTabsParamList, RootStackParamList } from '../navigation/types';

type SettingsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Settings'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type SettingItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconType: 'material' | 'ionicon';
  onPress: () => void;

};

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsNavigationProp>();

  const handleAddGroup = () => {
    console.log('Navigate to Create Group Screen');
  };

  const handleOpenCamera = () => {
    console.log('Open Camera');
  };

  const settingsItems: SettingItem[] = [
    {
      id: '1',
      title: 'Profile',
      subtitle: 'Bio (non-editable), picture editable',
      icon: 'person',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: '2',
      title: 'Chats',
      subtitle: 'Theme, wallpapers, chat history',
      icon: 'chatbubble',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('Status'),
    },
    {
      id: '3',
      title: 'Notifications',
      subtitle: 'Chat tones, vibrate, group tone',
      icon: 'notifications',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: '4',
      title: 'Courses',
      subtitle: 'Enrolled courses and details',
      icon: 'book',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('Courses'),
    },
    {
      id: '5',
      title: 'Attendance',
      subtitle: 'View attendance per course',
      icon: 'calendar',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('Attendance'),
    },
    {
      id: '6',
      title: 'Help',
      subtitle: 'Support & policies',
      icon: 'help-circle',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('Help'),
    },
    {
      id: '7',
      title: 'Terms & Conditions',
      subtitle: 'Legal',
      icon: 'document-text',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('Terms'),
    },
    {
      id: '8',
      title: 'Privacy Policy',
      subtitle: 'Legal',
      icon: 'shield',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('Privacy'),
    },
    {
      id: '9',
      title: 'App Info',
      subtitle: 'Version and build',
      icon: 'information-circle',
      iconType: 'ionicon',
      onPress: () => navigation.navigate('AppInfo'),
    },
    {
      id: '10',
      title: 'Logout',
      subtitle: 'Sign out of the app',
      icon: 'log-out',
      iconType: 'ionicon',
      onPress: () => console.log('Logout'),
    },
  ];

  const renderSettingItem = ({ item }: { item: SettingItem }) => (
    <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {item.iconType === 'material' ? (
            <MaterialIcons name={item.icon as any} size={24} color="#666" />
          ) : (
            <Ionicons name={item.icon as any} size={24} color="#666" />
          )}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* TopBar */}
      <TopBar onAddGroup={handleAddGroup} onOpenCamera={handleOpenCamera} />

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileLeft}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>V</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Vikram chaoudhary</Text>
            <Text style={styles.profileStatus}>Available</Text>
          </View>
        </View>
        {/* <View style={styles.profileRight}>
          <TouchableOpacity style={styles.profileButton}>
            <MaterialIcons name="qr-code" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="add-circle" size={20} color="#25D366" />
          </TouchableOpacity>
        </View> */}
      </View>

      {/* Settings List */}
      <FlatList
        data={settingsItems}
        keyExtractor={item => item.id}
        renderItem={renderSettingItem}
        style={styles.settingsList}
      />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0', marginLeft:30,marginRight:30,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f1f1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    color: '#0a0808ff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    marginLeft:10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 16,
    color: '#666',
  },
  profileRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    padding: 8,
    marginLeft: 8,
  },
  settingsList: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    fontSize: 14,
    color: '#666',
  },
});
