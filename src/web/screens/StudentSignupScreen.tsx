import AsyncStorage from '@react-native-async-storage/async-storage';
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
    studentName: '',
    studentFatherName: '',
    studentEmail: '',
    studentBatch: '',
    studentDepartment: '',
    studentGender: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.studentName.trim()) return Alert.alert('Error', 'Name is required');
    if (!formData.studentFatherName.trim()) return Alert.alert('Error', 'Father Name is required');
    if (!formData.studentBatch.trim()) return Alert.alert('Error', 'Batch is required');
    if (!formData.studentDepartment.trim()) return Alert.alert('Error', 'Course Name is required');
    if (!formData.studentGender.trim()) return Alert.alert('Error', 'Gender is required');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const studentData = formData

    try {
      const API_URL = 'http://localhost:5200/web/student/register'; // Replace with your API

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      const result = await response.json();

      if (response.ok) {
        // Success
        Alert.alert(
          'Success 🎉',
          'Your data has been added successfully! Admin will approve your account in 4 hours.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );

        setFormData({ studentName: '', studentFatherName: '', studentEmail: '', studentBatch: '', studentDepartment: '', studentGender: '' });
      } else {
        // API responded with error
        throw new Error(result?.message || 'API registration failed');
      }
    } catch (error) {
      console.error(error);

      // Save data locally if API/network fails
      try {
        const existingData = await AsyncStorage.getItem('studentRegistrations');
        const registrations = existingData ? JSON.parse(existingData) : [];
        registrations.push(formData);
        await AsyncStorage.setItem('studentRegistrations', JSON.stringify(registrations));
      } catch (storageError) {
        console.error('AsyncStorage error:', storageError);
      }

      Alert.alert(
        'Failed ❌',
        'Your data could not be submitted to the server. It has been saved locally. Try again later.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } finally {
      setLoading(false); // Stop showing "Submitting..."
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
              value={formData.studentName}
              onChangeText={value => handleInputChange('studentName', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Father Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your father's name"
              value={formData.studentFatherName}
              onChangeText={value => handleInputChange('studentFatherName', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={formData.studentEmail}
              onChangeText={value => handleInputChange('studentEmail', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Batch *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2024, 2023"
              value={formData.studentBatch}
              onChangeText={value => handleInputChange('studentBatch', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Course Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Computer Science"
              value={formData.studentDepartment}
              onChangeText={value => handleInputChange('studentDepartment', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Male, Female"
              value={formData.studentGender}
              onChangeText={value => handleInputChange('studentGender', value)}
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
