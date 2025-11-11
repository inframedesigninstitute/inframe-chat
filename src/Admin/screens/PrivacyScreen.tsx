import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/Store/store';

const API_BASE_URL = 'http://localhost:5200/web';

interface UnifiedContact {
  id: string;
  name: string;
  email: string;
  type: 'student';
}

const PrivacyScreen = () => {
  const token = useSelector((state: RootState) => state.AdminStore.token);
  const [rawContacts, setRawContacts] = useState<UnifiedContact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<UnifiedContact | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [fadeAnim] = useState(new Animated.Value(0));
const [dialogVisible, setDialogVisible] = useState(false);
const [dialogMessage, setDialogMessage] = useState('');

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = (callback?: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => callback && callback());
  };

  const fetchAllStudentContacts = async (): Promise<UnifiedContact[]> => {
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return [];
    }

    try {
      const API_URL = `${API_BASE_URL}/main-admin/view-all-students`;
      const response = await axios.get(API_URL, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      if (data?.status === 1 && Array.isArray(data.allStudentData)) {
        return data.allStudentData.map((student: any) => ({
          id: student._id,
          name: student.studentName || 'Unnamed Student',
          email: student.studentEmail || 'N/A',
          type: 'student' as const,
        }));
      }

      return [];
    } catch (err: any) {
      console.error('Error fetching students:', err.message);
      setError('Failed to fetch student contacts.');
      return [];
    }
  };

  const deactivateStudent = async (userId: string) => {
    if (!token || !userId) return;
    setIsDetailsLoading(true);
    try {
      const API_URL = `${API_BASE_URL}/main-admin/deactivate-user/${userId}`;
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Deactivation Response:', response.data);
      setRawContacts((prev) => prev.filter((c) => c.id !== userId));
      fadeOut(() => setIsModalVisible(false));
    } catch (err: any) {
      console.error('Error deactivating student:', err.message);
    } finally {
      setIsDetailsLoading(false);
    }
  };
const permanentlyDeleteStudent = async (userId: string) => {
  if (!token || !userId) return;
  setIsDetailsLoading(true);

  try {
    const API_URL = `${API_BASE_URL}/main-admin/delete-user/${userId}`;
     const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Deactivation Response:', response.data);
      setRawContacts((prev) => prev.filter((c) => c.id !== userId));
      fadeOut(() => setIsModalVisible(false));
    } catch (err: any) {
      console.error('Error deactivating student:', err.message);
    } finally {
      setIsDetailsLoading(false);
    }
  };



  const TemporarilyDeleteUsesStudent = async (userId: string) => {
    if (!token || !userId) return;
    setIsDetailsLoading(true);
    try {
      const API_URL = `${API_BASE_URL}/main-admin/delete-user/${userId}`;
      const response = await axios.delete(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Temporary Delete Response:', response.data);
      setRawContacts((prev) => prev.filter((c) => c.id !== userId));
      fadeOut(() => setIsModalVisible(false));
    } catch (err: any) {
      console.error('Error temporarily deleting student:', err.message);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const students = await fetchAllStudentContacts();
        setRawContacts(students);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [token]);

  const handlePress = (contact: UnifiedContact) => {
    setSelectedStudent(contact);
    setIsModalVisible(true);
    fadeIn();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Screen</Text>

      {isLoading && <ActivityIndicator size="large" color="#000000ff" />}
      {error && <Text style={styles.error}>{error}</Text>}

      {!isLoading && !error && (
        <View style={styles.list}>
          {rawContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.card}
              onPress={() => handlePress(contact)}
            >
              <Text style={styles.name}>{contact.name}</Text>
              <Text style={styles.email}>{contact.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 🌈 Modern 3D Modal */}
      <Modal transparent visible={isModalVisible} animationType="fade">
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <View style={styles.modal3D}>
            <Text style={styles.modalTitle}>Manage Student</Text>
            <Text style={styles.modalSub}>
              {selectedStudent?.name} ({selectedStudent?.email})
            </Text>

            <View style={styles.btnContainer}>
              <Pressable
                style={[styles.actionBtn, styles.tempBtn]}
                onPress={() => deactivateStudent(selectedStudent?.id || '')}
              >
                {isDetailsLoading ? (
                  <ActivityIndicator color="#000000ff" />
                ) : (
                  <Text style={styles.btnText}>Temporarily Delete</Text>
                )}
              </Pressable>

              <Pressable
                style={[styles.actionBtn, styles.permaBtn]}
                onPress={() => permanentlyDeleteStudent(selectedStudent?.id || '')}
              >
                {isDetailsLoading ? (
                  <ActivityIndicator color="#050505ff" />
                ) : (
                  <Text style={styles.btnText}>Permanently Delete</Text>
                )}
              </Pressable>

             

              <Pressable
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => fadeOut(() => setIsModalVisible(false))}
              >
                <Text style={[styles.btnText, { color: '#070606ff' }]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

export default PrivacyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#007bff' },
  list: { flexDirection: 'column', gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000000ff',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
    transform: [{ perspective: 1000 }, { scale: 1 }],
  },
  name: { fontWeight: 'bold', fontSize: 16, color: '#050303ff' },
  email: { color: '#030202ff', marginTop: 4 },
  error: { color: 'red', marginTop: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(156, 145, 145, 0.4)', justifyContent: 'center', alignItems: 'center' },
  modal3D: {
    width: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: '600', color: '#000000ff', textAlign: 'center' },
  modalSub: { textAlign: 'center', color: '#000000ff', marginVertical: 8 },
  btnContainer: { marginTop: 20, marginHorizontal: 70 },
  actionBtn: { paddingVertical: 12, borderRadius: 12, marginVertical: 6, alignItems: 'center' },
  tempBtn: { backgroundColor: '#d2e0e9ff', shadowColor: '#d2e0e9ff', shadowOpacity: 0.3, shadowRadius: 8 },
  permaBtn: { backgroundColor: '#d2e0e9ff', shadowColor: '#d2e0e9ff', shadowOpacity: 0.3, shadowRadius: 8 },
  cancelBtn: { backgroundColor: '#efaff5ff' },
  btnText: { color: '#000000ff', fontWeight: 'bold' },
});
