import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AddContactScreen from '../screens/AddContactScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdvancedLoginScreen from '../screens/AdvancedLoginScreen';
import AppInfoScreen from '../screens/AppInfoScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import AudioCallScreen from '../screens/AudioCallScreen';
import CameraScreen from '../screens/CameraScreen';
import ChatScreen from '../screens/ChatScreen';
import CourseDetailsScreen from '../screens/CourseDetailsScreen';
import CoursesScreen from '../screens/CoursesScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import HelpScreen from '../screens/EnhancedHelpScreen';
import EnhancedSettingsScreen from '../screens/EnhancedSettingsScreen';
import GalleryScreen from '../screens/GalleryScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import LoginScreen from '../screens/LoginScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import StarredMessagesScreen from '../screens/StarredMessagesScreen';
import StatusScreen from '../screens/StatusScreen';
import StudentSignupScreen from '../screens/StudentSignupScreen';
import TeacherSignupScreen from '../screens/TeacherSignupScreen';
import TermsScreen from '../screens/TermsScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import MainTabs from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AdvancedLogin" component={AdvancedLoginScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />

      <Stack.Screen name="MainTabs" component={MainTabs} />

      <Stack.Screen name="Chat" component={ChatScreen} options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="AudioCall" component={AudioCallScreen} options={{ presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="AddContact" component={AddContactScreen} options={{ presentation: 'modal', headerShown: false }} />

      <Stack.Screen name="StudentSignup" component={StudentSignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TeacherSignup" component={TeacherSignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />

      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Courses" component={CoursesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Help" component={HelpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StarredMessages" component={StarredMessagesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={EnhancedSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Gallery" component={GalleryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AppInfo" component={AppInfoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Status" component={StatusScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
