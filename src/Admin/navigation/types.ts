export type RootStackParamList = {
  Login: undefined;
  AdvancedLogin: { emailPrefill?: string; admin?: boolean } | undefined;
    AdminLogin: { emailPrefill?: string; admin?: boolean } | undefined;
   TeacherLogin: { emailPrefill?: string; admin?: boolean } | undefined;

  OtpVerification: { email: string };
  AdminChats: undefined;
  FacultyChats:undefined;
  Groups: undefined;
  Calls: undefined;
  Settings: undefined;
  LiveVideoCall: { channelName: string };
  // ChatLayout: undefined;
  Chat: { channelId: string; channelName: string; recipientRole?: 'student' | 'faculty' | 'admin' };
  GroupChat: { groupId: string; groupName: string; isTeacher: boolean };
  AudioCall: { contactName: string; contactNumber: string };
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

};

export type MainTabsParamList = {
  AdminChats: undefined;
  Groups: undefined;
  Calls: undefined;
  Settings: undefined;
};

export type ChatsTopTabsParamList = {
  All: undefined;
  Unread: undefined;
  Favourites: undefined;
  Groups: undefined;
};