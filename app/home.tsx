import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    return <StudentApp/>;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../src/assets/InframeLogo001.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.heading}>Welcome to Inframe</Text>

      <View style={styles.buttonsWrap}>
        <TouchableOpacity style={styles.outlineButton} onPress={() => setSelectedApp('faculty')}>
          <Text style={styles.outlineButtonText}>Faculty Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineButton} onPress={() => setSelectedApp('student')}>
          <Text style={styles.outlineButtonText}>Student Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineButton} onPress={() => setSelectedApp('admin')}>
          <Text style={styles.outlineButtonText}>Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#ffffff' },
  logo: { width: 350, height: 190, marginTop: 90 },
  logoSubtitle: { marginTop: -6, color: '#7b7b7b', letterSpacing: 1, fontSize: 12 },
  heading: { marginTop: 48, fontSize: 20, fontWeight: '700', color: '#1c1c1c' },
  buttonsWrap: { marginTop: 24, width: 360, alignItems: 'center' },
  outlineButton: {
    width: 360,
    backgroundColor: '#ffffff',
    borderColor: '#e6e6e6',
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 14,
    marginVertical: 8,
    alignItems: 'center',
  },
  outlineButtonText: { color: '#1a1a1a', fontSize: 14, fontWeight: '600' },
});