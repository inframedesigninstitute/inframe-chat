import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddContactScreen from '../screens/AddContactScreen';
import AdminChatsScreen from '../screens/AdminChatsScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminSignupScreen from '../screens/AdminSignInScreen';
import AppInfoScreen from '../screens/AppInfoScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import AudioCallScreen from '../screens/AudioCallScreen';
import CalendarScreen from '../screens/CalendarScreen';
import CallsScreen from '../screens/CallsScreen';
import CameraScreen from '../screens/CameraScreen';
import ChatScreen from '../screens/ChatScreen';
import CourseDetailsScreen from '../screens/CourseDetailsScreen';
import CoursesScreen from '../screens/CoursesScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import HelpScreen from '../screens/EnhancedHelpScreen';
import EnhancedSettingsScreen from '../screens/EnhancedSettingsScreen';
import GalleryScreen from '../screens/GalleryScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import GroupsScreen from '../screens/GroupsScreen';
import LiveVideoCall from '../screens/LiveVideoCall';
import NotificationsScreen from '../screens/NotificationsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import StarredMessagesScreen from '../screens/StarredMessagesScreen';
import StatusScreen from '../screens/StatusScreen';
import TermsScreen from '../screens/TermsScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import { RootStackParamList } from './types';

// ✅ Import new call screens
import OutgoingCallScreen from '../../components/OutgoingCallScreen';
import IncomingCallScreen from '../../components/IncomingCallScreen';
import ActiveVideoCallScreen from '../../components/VideoCallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="AdminLogin" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminSignInScreen" component={AdminSignupScreen} />


      <Stack.Screen name="AdminChats" component={AdminChatsScreen} />
     {/* <Stack.Screen name="AdminChats" component={AdminChatsScreen} /> */}


      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen name="Calls" component={CallsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen 
        name="GroupChat" 
        component={GroupChatScreen} 
        options={{ presentation: 'modal' }}
      />
      {/* Old call screens (keeping for backward compatibility) */}
      <Stack.Screen name="AudioCall" component={AudioCallScreen} options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ presentation: 'fullScreenModal' }} />
      
      {/* ✅ New Agora call screens */}
      <Stack.Screen name="OutgoingCall" component={OutgoingCallScreen} options={{ presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen name="IncomingCall" component={IncomingCallScreen} options={{ presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen name="ActiveVideoCall" component={ActiveVideoCallScreen} options={{ presentation: 'fullScreenModal', headerShown: false }} />
      
      <Stack.Screen name="Camera" component={CameraScreen} options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddContact" component={AddContactScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Courses" component={CoursesScreen} />
      <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="StarredMessages" component={StarredMessagesScreen} />
      <Stack.Screen name="Settings" component={EnhancedSettingsScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="AppInfo" component={AppInfoScreen} />
      <Stack.Screen name="Status" component={StatusScreen} />
<Stack.Screen
  name="LiveVideoCall"
  component={LiveVideoCall}
  options={{ presentation: "fullScreenModal" }}
/>

    </Stack.Navigator>
  );
};

export default RootNavigator;