export type RootStackParamList = {
  Login: undefined;
  AdvancedLogin: { emailPrefill?: string; admin?: boolean } | undefined;
    AdminLogin: { emailPrefill?: string; admin?: boolean } | undefined;
   TeacherLogin: { emailPrefill?: string; admin?: boolean } | undefined;

  OtpVerification: { email: string };
  FacultyChats:undefined;
AdminChats:undefined;
  Groups: undefined;
  Calls: undefined;
  Settings: undefined;
    LiveVideoCall: { channelName: string; callerId?: string; receiverId?: string; receiverName?: string };

  // ChatLayout: undefined;
  Chat: { channelId: string; channelName: string; recipientRole?: 'student' | 'faculty' | 'admin' };
  GroupChat: { groupId: string; groupName: string; isTeacher: boolean };
  AudioCall: { contactName: string; contactNumber: string; callerId?: string; receiverId?: string; channelName?: string };
  VideoCall: { contactName: string; contactNumber: string };
  Camera: undefined;
  QRScanner: undefined;
  CreateGroup: undefined;
  AddContact: undefined;
  Calendar: undefined;
  StudentSignup: undefined;
  TeacherSignup: undefined;
  AdminDashboard: undefined;
  Profile: undefined;
  Courses: undefined;
  CourseDetails: { courseId: string } | undefined;
  Attendance: undefined;
  Notifications: undefined;
  Help: undefined;
  Terms: undefined;
  Privacy: undefined;
  AppInfo: undefined;
  StarredMessages: undefined;
  Gallery: undefined;
  Status: undefined;
  AdminSignInScreen: undefined;
Language:undefined;
StatusScreen:undefined;
};

export type MainTabsParamList = {
  FacultyChats: undefined;
  Groups: undefined;
  Calls: undefined;
  Settings: undefined;
};

export type FacultyChatsTopTabsParamList = {
  All: undefined;
  Unread: undefined;
  Favourites: undefined;
  Groups: undefined;
};