import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AdminApp from '../src/Admin/App';
import FacultyApp from '../src/Faculty/App';
import StudentApp from '../src/Students/App';

const App = () => {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  // Conditional rendering
  if (selectedApp === 'admin') {
    return <AdminApp />;
  }

  if (selectedApp === 'faculty') {
    return <FacultyApp />;
  }

  if (selectedApp === 'student') {
    return <StudentApp />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Application</Text>

      <TouchableOpacity style={styles.button} onPress={() => setSelectedApp('admin')}>
        <Text style={styles.buttonText}>Admin App</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setSelectedApp('faculty')}>
        <Text style={styles.buttonText}>Faculty App</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setSelectedApp('student')}>
        <Text style={styles.buttonText}>Student App</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  button: { backgroundColor: '#007bff', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, marginVertical: 8, width: 180, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
