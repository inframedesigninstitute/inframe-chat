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

type TeacherSignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TeacherSignup'
>;

const TeacherSignupScreen = () => {
  const navigation = useNavigation<TeacherSignupScreenNavigationProp>();
  const [formData, setFormData] = useState({
    facultyName: '',
    facultyEmail: '',
    facultyFatherName: '',
    facultyDepartment: '',
    facultyGender: '', // Added gender field
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.facultyName.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!formData.facultyEmail.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!formData.facultyFatherName.trim()) {
      Alert.alert('Error', 'Father Name is required');
      return false;
    }
    if (!formData.facultyDepartment.trim()) {
      Alert.alert('Error', 'Department is required');
      return false;
    }
    if (!formData.facultyGender.trim()) {
      Alert.alert('Error', 'Gender is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {

    if (!validateForm()) return;

    const facultyData = formData

    setLoading(true);
    try {
      const API_URL = 'http://localhost:5200/web/faculty/register'; // Replace with your API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facultyData),
      });

      const result = await response.json();

      // Simulate API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));

      Alert.alert(
        'Application Submitted',
        'Your application has been submitted for approval. Admin will review and approve your account. Please proceed to login after approval.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Teacher Registration</Text>
          <Text style={styles.formSubtitle}>
            Fill in your details to register as a teacher
          </Text>

          {/* Name Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.facultyName}
              onChangeText={value => handleInputChange('facultyName', value)}
              autoCapitalize="words"
            />
          </View>



          {/* Email Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Email"
              value={formData.facultyEmail}
              onChangeText={value => handleInputChange('facultyEmail', value)}
              autoCapitalize="words"
            />
          </View>

          {/* Father Name Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Father Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your father's name"
              value={formData.facultyFatherName}
              onChangeText={value => handleInputChange('facultyFatherName', value)}
              autoCapitalize="words"
            />
          </View>

          {/* Department Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Department *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Computer Science, Mathematics, etc."
              value={formData.facultyDepartment}
              onChangeText={value => handleInputChange('facultyDepartment', value)}
              autoCapitalize="words"
            />
          </View>

          {/* Gender Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., male, female, etc."
              value={formData.facultyGender}
              onChangeText={value => handleInputChange('facultyGender', value)}
              autoCapitalize="words"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Text>
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.infoText}>
            Your application will be reviewed by admin. You will receive an email
            with login credentials after approval.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 3,
    marginBottom: 100,
    height: '100%', // <-- change from '100vh' to '100%'
  },
  content: {
    flex: 1,
  },
  formContainer: { padding: 20 },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#0e0c0cff',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: '#0a0c0cff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: { backgroundColor: '#ccc' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  infoText: {
    fontSize: 14,
    color: '#0f0e0eff',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
});

export default TeacherSignupScreen;
