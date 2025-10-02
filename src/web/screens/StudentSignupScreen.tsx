import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/types';


type StudentSignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StudentSignup'
>;

const StudentSignupScreen = () => {
  const navigation = useNavigation<StudentSignupScreenNavigationProp>();
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    batch: '',
    courseName: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!formData.fatherName.trim()) {
      Alert.alert('Error', 'Father Name is required');
      return false;
    }
    if (!formData.batch.trim()) {
      Alert.alert('Error', 'Batch is required');
      return false;
    }
    if (!formData.courseName.trim()) {
      Alert.alert('Error', 'Course Name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

      Alert.alert(
        'Registration Successful',
        'Your registration has been completed. Admin will approve your account soon. Please proceed to login.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/*  */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Student Registration</Text>
          <Text style={styles.formSubtitle}>
            Fill in your details to register as a student
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={value => handleInputChange('name', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Father Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your father's name"
              value={formData.fatherName}
              onChangeText={value => handleInputChange('fatherName', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Batch *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2024, 2023, etc."
              value={formData.batch}
              onChangeText={value => handleInputChange('batch', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Course Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Computer Science, Engineering, etc."
              value={formData.courseName}
              onChangeText={value => handleInputChange('courseName', value)}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., male, female, etc."
              value={formData.department}
              onChangeText={value => handleInputChange('department', value)}
              autoCapitalize="words"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginTop:35 ,marginBottom:150},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  placeholder: { width: 32 },
  content: { flex: 1, marginTop:-39 },
  formContainer: { padding: 20 },
  formTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 8 },
  formSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  submitButton: { backgroundColor: '#075E54', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitButtonDisabled: { backgroundColor: '#ccc' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default StudentSignupScreen;
