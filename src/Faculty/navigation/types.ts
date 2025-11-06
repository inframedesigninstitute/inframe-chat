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