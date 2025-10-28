// import { useState } from 'react';
// import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// // ✅ Correct imports (make sure file names & folders match exactly)
// import AdminLoginScreen from '../src/Admin/screens/AdminLoginScreen';
// import AdminSignupScreen from '../src/Admin/screens/AdminSignInScreen';
// import TeacherLoginScreen from '../src/Faculty/screens/TeacherLoginScreen';
// import TeacherSignupScreen from '../src/Faculty/screens/TeacherSignupScreen';
// import AdvancedLoginScreen from '../src/Students/screens/AdvancedLoginScreen';
// import StudentSignupScreen from '../src/Students/screens/StudentSignupScreen';

// interface User {
//   id: string;
//   name: string;
// }

// const users: User[] = [
//   { id: '1', name: 'Admin' },
//   { id: '2', name: 'Faculty Login' },
//   { id: '3', name: 'Student Login' },
// ];

// export default function Home() {
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [activeTab, setActiveTab] = useState<'old' | 'new'>('old');

//   const renderScreen = () => {
//     if (!selectedUser) return null;

//     // ✅ Old Member (Login)
//     if (activeTab === 'old') {
//       if (selectedUser.name === 'Admin') return <AdminLoginScreen />;
//       if (selectedUser.name === 'Faculty Login') return <TeacherLoginScreen />;
//       if (selectedUser.name === 'Student Login') return <AdvancedLoginScreen />;
//     }

//     // ✅ New Member (Signup)
//     if (activeTab === 'new') {
//       if (selectedUser.name === 'Admin') return <AdminSignupScreen />;
//       if (selectedUser.name === 'Faculty Login') return <TeacherSignupScreen />;
//       if (selectedUser.name === 'Student Login') return <StudentSignupScreen />;
//     }

//     return null;
//   };

//   if (selectedUser) {
//     return (
//       <View style={styles.innerContainer}>
//         {/* Header */}
//         <Text style={styles.header}>{selectedUser.name}</Text>

//         {/* Tabs */}
//         <View style={styles.tabRow}>
//           <TouchableOpacity
//             onPress={() => setActiveTab('old')}
//             style={[styles.tabButton, activeTab === 'old' && styles.tabActive]}>
//             <Text style={[styles.tabText, activeTab === 'old' && styles.tabTextActive]}>
//               Old Member
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => setActiveTab('new')}
//             style={[styles.tabButton, activeTab === 'new' && styles.tabActive]}>
//             <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>
//               New Member
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Content (Scrollable) */}
//         <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//           <View style={{ flex: 1 }}>{renderScreen()}</View>
//         </ScrollView>

//         {/* Back Button */}
//         <TouchableOpacity
//           onPress={() => setSelectedUser(null)}
//           style={styles.backButton}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // Main user selection list
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select User Type</Text>
//       {users.map((user) => (
//         <TouchableOpacity
//           key={user.id}
//           style={styles.listButton}
//           onPress={() => setSelectedUser(user)}>
//           <Text style={styles.listButtonText}>{user.name}</Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }

// // ✅ Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   innerContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 16,
//     paddingTop: 40,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#000',
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: '600',
//     textAlign: 'center',
//     marginBottom: 16,
//     color: '#4a4a4a',
//   },
//   listButton: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 15,
//     borderRadius: 8,
//     marginVertical: 10,
//     width: 220,
//     alignItems: 'center',
//   },
//   listButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   tabRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     borderBottomWidth: 1,
//     borderColor: '#e0e0e0',
//     marginBottom: 16,
//   },
//   tabButton: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 2,
//     borderBottomColor: 'transparent',
//   },
//   tabActive: {
//     borderBottomColor: '#007AFF',
//   },
//   tabText: {
//     fontSize: 16,
//     color: '#757575',
//     fontWeight: '600',
//   },
//   tabTextActive: {
//     color: '#007AFF',
//   },
//   backButton: {
//     alignSelf: 'center',
//     marginTop: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//   },
//   backText: {
//     color: '#007AFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });