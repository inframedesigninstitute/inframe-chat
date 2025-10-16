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
    if (!formData.name.trim()) return Alert.alert('Error', 'Name is required');
    if (!formData.fatherName.trim()) return Alert.alert('Error', 'Father Name is required');
    if (!formData.batch.trim()) return Alert.alert('Error', 'Batch is required');
    if (!formData.courseName.trim()) return Alert.alert('Error', 'Course Name is required');
    if (!formData.department.trim()) return Alert.alert('Error', 'Gender is required');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5200/web/student/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          'Registration Successful',
          result?.message ||
            'Your registration has been completed. Admin will approve your account soon. Please proceed to login.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result?.message || 'Failed to register. Please try again.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Father Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your father's name"
              value={formData.fatherName}
              onChangeText={value => handleInputChange('fatherName', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Batch *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2024, 2023"
              value={formData.batch}
              onChangeText={value => handleInputChange('batch', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Course Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Computer Science"
              value={formData.courseName}
              onChangeText={value => handleInputChange('courseName', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Male, Female"
              value={formData.department}
              onChangeText={value => handleInputChange('department', value)}
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
  container: { flex: 1, backgroundColor: '#fff', marginTop: 3, marginBottom: 190 },
  content: { flex: 1, marginTop: -39 },
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
