// import { useNavigation } from '@react-navigation/native';
// import React, { useState } from 'react';
// import {
//   Alert,
//   FlatList,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useUser } from '../../context/UserContext';

// interface PendingApproval {
//   id: string;
//   name: string;
//   fatherName: string;
//   email: string;
//   role: 'student' | 'faculty';
//   department?: string;
//   batch?: string;
//   courseName?: string;
//   submittedAt: Date;
//   status: 'pending' | 'approved' | 'rejected';
// }

// const AdminDashboardScreen = () => {
//   const navigation = useNavigation();
//   const { user } = useUser();

//   // Mock pending approvals
//   const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([
//     {
//       id: '1',
//       name: 'Rahul Sharma',
//       fatherName: 'Raj Sharma',
//       email: 'rahul.sharma@student.inframe.edu',
//       role: 'student',
//       batch: '2025-27',
//       courseName: 'B.Tech Computer Science',
//       submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
//       status: 'pending',
//     },
//     {
//       id: '2',
//       name: 'Dr. Priya Gupta',
//       fatherName: 'Suresh Gupta',
//       email: 'priya.gupta@faculty.inframe.edu',
//       role: 'faculty',
//       department: 'Computer Science',
//       submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
//       status: 'pending',
//     },
//     {
//       id: '3',
//       name: 'Amit Kumar',
//       fatherName: 'Ramesh Kumar',
//       email: 'amit.kumar@student.inframe.edu',
//       role: 'student',
//       batch: '2024-26',
//       courseName: 'B.Tech Mechanical',
//       submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
//       status: 'pending',
//     },
//   ]);

//   const [stats, setStats] = useState({
//     totalUsers: 150,
//     activeStudents: 120,
//     activeFaculty: 25,
//     pendingApprovals: pendingApprovals.filter(a => a.status === 'pending').length,
//     todayRegistrations: 5,
//   });

//   const handleApprove = (approval: PendingApproval) => {
//     Alert.alert(
//       'Approve Registration',
//       `Approve ${approval.name}'s ${approval.role} registration?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Approve',
//           onPress: () => {
//             // Update the approval status
//             setPendingApprovals(prev =>
//               prev.map(item =>
//                 item.id === approval.id
//                   ? { ...item, status: 'approved' as const }
//                   : item
//               )
//             );
            
//             // Send approval email (simulate)
//             Alert.alert(
//               'Approved',
//               `${approval.name} has been approved. Login credentials sent to ${approval.email}`
//             );
            
//             // Update stats
//             setStats(prev => ({
//               ...prev,
//               pendingApprovals: prev.pendingApprovals - 1,
//               activeStudents: approval.role === 'student' ? prev.activeStudents + 1 : prev.activeStudents,
//               activeFaculty: approval.role === 'faculty' ? prev.activeFaculty + 1 : prev.activeFaculty,
//             }));
//           },
//         },
//       ]
//     );
//   };

//   const handleReject = (approval: PendingApproval) => {
//     Alert.alert(
//       'Reject Registration',
//       `Reject ${approval.name}'s ${approval.role} registration?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Reject',
//           style: 'destructive',
//           onPress: () => {
//             setPendingApprovals(prev =>
//               prev.map(item =>
//                 item.id === approval.id
//                   ? { ...item, status: 'rejected' as const }
//                   : item
//               )
//             );
            
//             Alert.alert(
//               'Rejected',
//               `${approval.name}'s registration has been rejected.`
//             );
            
//             setStats(prev => ({
//               ...prev,
//               pendingApprovals: prev.pendingApprovals - 1,
//             }));
//           },
//         },
//       ]
//     );
//   };

//   const formatTimeAgo = (date: Date) => {
//     const now = new Date();
//     const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
//     if (diffInHours < 1) return 'Just now';
//     if (diffInHours === 1) return '1 hour ago';
//     if (diffInHours < 24) return `${diffInHours} hours ago`;
    
//     const diffInDays = Math.floor(diffInHours / 24);
//     if (diffInDays === 1) return '1 day ago';
//     return `${diffInDays} days ago`;
//   };

//   const renderApprovalItem = ({ item }: { item: PendingApproval }) => {
//     if (item.status !== 'pending') return null;
    
//     return (
//       <View style={styles.approvalItem}>
//         <View style={styles.approvalHeader}>
//           <View style={styles.roleContainer}>
//             <Ionicons 
//               name={item.role === 'student' ? 'school' : 'person'} 
//               size={20} 
//               color={item.role === 'student' ? '#2196F3' : '#4CAF50'} 
//             />
//             <Text style={[
//               styles.roleText,
//               { color: item.role === 'student' ? '#2196F3' : '#4CAF50' }
//             ]}>
//               {item.role.toUpperCase()}
//             </Text>
//           </View>
//           <Text style={styles.timeText}>{formatTimeAgo(item.submittedAt)}</Text>
//         </View>

//         <Text style={styles.nameText}>{item.name}</Text>
//         <Text style={styles.fatherNameText}>Father: {item.fatherName}</Text>
//         <Text style={styles.emailText}>{item.email}</Text>
        
//         {item.role === 'student' && (
//           <View style={styles.detailsContainer}>
//             <Text style={styles.detailText}>Batch: {item.batch}</Text>
//             <Text style={styles.detailText}>Course: {item.courseName}</Text>
//           </View>
//         )}
        
//         {item.role === 'faculty' && (
//           <Text style={styles.detailText}>Department: {item.department}</Text>
//         )}

//         <View style={styles.actionButtons}>
//           <TouchableOpacity
//             style={styles.rejectButton}
//             onPress={() => handleReject(item)}
//           >
//             <Ionicons name="close" size={16} color="#fff" />
//             <Text style={styles.buttonText}>Reject</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.approveButton}
//             onPress={() => handleApprove(item)}
//           >
//             <Ionicons name="checkmark" size={16} color="#fff" />
//             <Text style={styles.buttonText}>Approve</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   if (user?.role !== 'admin') {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.unauthorizedContainer}>
//           <Ionicons name="lock-closed" size={64} color="#FF3B30" />
//           <Text style={styles.unauthorizedText}>Access Denied</Text>
//           <Text style={styles.unauthorizedSubtext}>
//             This section is only accessible to administrators.
//           </Text>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.backButtonText}>Go Back</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#075E54" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Admin Dashboard</Text>
//         <TouchableOpacity>
//           <Ionicons name="refresh" size={24} color="#075E54" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.scrollView}>
//         {/* Stats Cards */}
//         <View style={styles.statsContainer}>
//           <View style={styles.statCard}>
//             <Ionicons name="people" size={32} color="#2196F3" />
//             <Text style={styles.statNumber}>{stats.totalUsers}</Text>
//             <Text style={styles.statLabel}>Total Users</Text>
//           </View>
          
//           <View style={styles.statCard}>
//             <Ionicons name="school" size={32} color="#4CAF50" />
//             <Text style={styles.statNumber}>{stats.activeStudents}</Text>
//             <Text style={styles.statLabel}>Students</Text>
//           </View>
          
//           <View style={styles.statCard}>
//             <Ionicons name="person" size={32} color="#FF9800" />
//             <Text style={styles.statNumber}>{stats.activeFaculty}</Text>
//             <Text style={styles.statLabel}>Faculty</Text>
//           </View>
          
//           <View style={styles.statCard}>
//             <Ionicons name="time" size={32} color="#F44336" />
//             <Text style={styles.statNumber}>{stats.pendingApprovals}</Text>
//             <Text style={styles.statLabel}>Pending</Text>
//           </View>
//         </View>

//         {/* Pending Approvals */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Pending Approvals</Text>
          
//           {pendingApprovals.filter(item => item.status === 'pending').length === 0 ? (
//             <View style={styles.emptyState}>
//               <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
//               <Text style={styles.emptyStateText}>No pending approvals</Text>
//               <Text style={styles.emptyStateSubtext}>All registrations are up to date!</Text>
//             </View>
//           ) : (
//             <FlatList
//               data={pendingApprovals.filter(item => item.status === 'pending')}
//               renderItem={renderApprovalItem}
//               keyExtractor={(item) => item.id}
//               scrollEnabled={false}
//             />
//           )}
//         </View>

//         {/* Quick Actions */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Quick Actions</Text>
          
//           <TouchableOpacity style={styles.actionItem}>
//             <Ionicons name="stats-chart" size={24} color="#075E54" />
//             <View style={styles.actionText}>
//               <Text style={styles.actionTitle}>View Analytics</Text>
//               <Text style={styles.actionSubtitle}>User engagement and activity reports</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#999" />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.actionItem}>
//             <Ionicons name="settings" size={24} color="#075E54" />
//             <View style={styles.actionText}>
//               <Text style={styles.actionTitle}>System Settings</Text>
//               <Text style={styles.actionSubtitle}>Configure app settings and permissions</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#999" />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.actionItem}>
//             <Ionicons name="mail" size={24} color="#075E54" />
//             <View style={styles.actionText}>
//               <Text style={styles.actionTitle}>Send Announcements</Text>
//               <Text style={styles.actionSubtitle}>Broadcast messages to all users</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#999" />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#075E54',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     justifyContent: 'space-between',
//   },
//   statCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     width: '48%',
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#000',
//     marginTop: 8,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//   },
//   section: {
//     backgroundColor: '#fff',
//     marginHorizontal: 16,
//     marginVertical: 8,
//     borderRadius: 12,
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#075E54',
//     marginBottom: 16,
//   },
//   approvalItem: {
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//   },
//   approvalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   roleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   roleText: {
//     fontSize: 12,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   timeText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   nameText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#000',
//     marginBottom: 4,
//   },
//   fatherNameText: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 2,
//   },
//   emailText: {
//     fontSize: 14,
//     color: '#075E54',
//     marginBottom: 8,
//   },
//   detailsContainer: {
//     marginBottom: 8,
//   },
//   detailText: {
//     fontSize: 13,
//     color: '#666',
//     marginBottom: 2,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//   },
//   rejectButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F44336',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//     flex: 0.48,
//     justifyContent: 'center',
//   },
//   approveButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//     flex: 0.48,
//     justifyContent: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   emptyState: {
//     alignItems: 'center',
//     paddingVertical: 32,
//   },
//   emptyStateText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#4CAF50',
//     marginTop: 16,
//   },
//   emptyStateSubtext: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 4,
//   },
//   actionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   actionText: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   actionTitle: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#000',
//   },
//   actionSubtitle: {
//     fontSize: 13,
//     color: '#666',
//     marginTop: 2,
//   },
//   unauthorizedContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 32,
//   },
//   unauthorizedText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#FF3B30',
//     marginTop: 16,
//     textAlign: 'center',
//   },
//   unauthorizedSubtext: {
//     fontSize: 16,
//     color: '#666',
//     marginTop: 8,
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   backButton: {
//     backgroundColor: '#075E54',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginTop: 24,
//   },
//   backButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default AdminDashboardScreen;