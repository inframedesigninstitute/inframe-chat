import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminSignupScreen from '../screens/AdminSignInScreen';
import TeacherLoginScreen from '../screens/TeacherLoginScreen';
import TeacherSignupScreen from '../screens/TeacherSignupScreen';
import AdvancedLoginScreen from './AdvancedLoginScreen';
import StudentSignupScreen from './StudentSignupScreen';


type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

type User = { id: string; name: string };

const users: User[] = [
  { id: '1', name: 'Faculty Login' },
  { id: '2', name: 'Student Login' },
  { id: '3', name: 'Admin' },
];

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
const [activeTab, setActiveTab] = useState<'new' | 'old'>('new');

  const handleSelect = (item: User) => {
    setSelectedUser(item);
    setActiveTab('new');
  };

  return (
    <View style={styles.container}>
      {/* App logo */}
      <Image
        source={require('../../assets/InframeLogo001.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome to Inframe</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          
          <TouchableOpacity 
            style={[
              styles.listItem,
              selectedUser?.id === item.id && styles.selectedItem,
            ]}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.listItemText}>{item.name}</Text>
          </TouchableOpacity>
          
        )}
      />

      {!!selectedUser && (
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSelectedUser(null)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedUser.name}</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.tabRow}>
          
          <TouchableOpacity
              onPress={() => setActiveTab('new')}
              style={[styles.tabButton, activeTab === 'new' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>New Member</Text>
            </TouchableOpacity>
             <TouchableOpacity
              onPress={() => setActiveTab('old')}
              style={[styles.tabButton, activeTab === 'old' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'old' && styles.tabTextActive]}>Old Member</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
            {activeTab === 'old' ? (
     <View>
                  {selectedUser.name === 'Faculty Login' && <TeacherLoginScreen />}
                  {selectedUser.name === 'Student Login' && <AdvancedLoginScreen />}
                  {selectedUser.name === 'Admin' && <AdminLoginScreen />}
                </View>
) : (
    <View>
      {selectedUser.name === 'Faculty Login' && (
          <TeacherSignupScreen />
      )}
      {selectedUser.name === 'Student Login' && (
          <StudentSignupScreen />
      )}
      {selectedUser.name === 'Admin' && (
          <AdminSignupScreen />  
      )}
    </View>
)}

            </ScrollView>
          </View>
        </View>
      )}

    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20,backgroundColor:'#fff' ,marginTop:35},
  logo: { width: 620, height: 280, alignSelf: 'center', marginBottom: 20, backgroundColor: '#fff',marginLeft:50, },
  title: { fontSize: 24, fontWeight: 'bold', width: '100%', marginBottom: 20, textAlign: 'center',  },
  listItem: { marginHorizontal:0, width:350, alignSelf:"center",padding: 20,top:29, borderBottomWidth: 1, borderColor: '#ccc',borderRadius:20,borderEndWidth:1, borderLeftWidth:1, borderRightWidth:1, borderTopWidth:1, },
  selectedItem: { backgroundColor: '#d0e8ff' },
  listItemText: { fontSize: 16 ,padding:2,textAlign:'center'} ,
  loginButton: { marginTop: 0, padding: 15, backgroundColor: '#6385e2ff', borderRadius: 8, alignItems: 'center', marginBottom:200 },
  loginButtonDisabled: { backgroundColor: '#ccc' , marginBottom:200},
  loginButtonText: { color: '#201c1cff', fontSize: 16, fontWeight: 'bold' },
  modalCard: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 12, 
    elevation: 6, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 2 }, 
    marginBottom: 250,
    height: 400, 
    maxHeight: 800,
    width:400,
    alignSelf:"center",
    top:-280,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  backButton: { 
    padding: 4,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: { 
    width: 32,
  },
  tabRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12, borderBottomWidth: 1, borderColor: '#e0e0e0' },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#4a90e2' },
  tabText: { fontSize: 16, color: '#757575', fontWeight: '600' },
  tabTextActive: { color: '#4a90e2' },
  modalBody: { paddingTop: 8 },
  modalScrollContent: { paddingBottom: 24 },
});
