import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdvancedLogin'>;
type RouteProps = RouteProp<RootStackParamList, 'AdvancedLogin'>;

const API_BASE_URL = 'http://localhost:5200/web';

const AdvancedLoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const isAdmin = route.params?.admin === true;
  const prefillEmail = route.params?.emailPrefill || '';

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const otpInputRef = useRef<TextInput>(null);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // --- Handle Send OTP ---
  const handleSendOtp = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email');
    if (!validateEmail(email)) return Alert.alert('Error', 'Please enter a valid email');

    if (isAdmin) {
      if (email !== 'admin@inframe.edu' || password !== 'Admin@123') {
        return Alert.alert('Admin Login Failed', 'Invalid credentials');
      }
      navigation.navigate('AdminDashboard');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/student/send-otp`, { studentEmail: email });
      console.log('OTP Response:', response.data);

      if (response.data?.status === 1 || response.status === 200) {
        Alert.alert('Success', `OTP sent to ${email}`);
        setShowOtpModal(true);
        setTimeout(() => otpInputRef.current?.focus(), 500);
      } else {
        Alert.alert('Error', response.data?.msg || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Send OTP Error:', err.message);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handle Verify OTP ---
 const handleVerifyOtp = async () => {
  if (otp.trim().length !== 6)
    return Alert.alert('Error', 'Please enter a valid 6-digit OTP');

  setIsVerifying(true);
  try {
    const response = await axios.post(`${API_BASE_URL}/student/verify-otp`, {
      studentEmail: email,
      enteredOtp: otp,
    });

    console.log('Verify OTP Response:', response.data);

    // ✅ Use status from backend instead of success
    if (response.data?.status === 1) {
      setShowOtpModal(false);
      Alert.alert('Success', 'Login Successful');
      navigation.navigate('MainTabs');
    } else {
      Alert.alert('Error', response.data?.msg || 'Invalid OTP');
    }
  } catch (err: any) {
    console.error('Verify OTP Error:', err.message);
    Alert.alert('Error', 'Network error. Please try again.');
  } finally {
    setIsVerifying(false);
  }
};



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>{isAdmin ? 'Admin Login' : 'Login with your Email'}</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#757575"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {isAdmin ? (
          <>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Admin password"
              placeholderTextColor="#757575"
              secureTextEntry
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleSendOtp}>
              <Text style={styles.loginButtonText}>Login as Admin</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleSendOtp}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* ✅ OTP Modal */}
      <Modal
        visible={showOtpModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter OTP</Text>
            <Text style={styles.modalSubtitle}>OTP sent to {email}</Text>
            <TextInput
              ref={otpInputRef}
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#757575"
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.loginButton, isVerifying && styles.loginButtonDisabled]}
              onPress={handleVerifyOtp}
              disabled={isVerifying}
            >
              <Text style={styles.loginButtonText}>
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowOtpModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default AdvancedLoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#212121', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#757575', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loginButton: { backgroundColor: '#4a90e2', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  loginButtonDisabled: { backgroundColor: '#b0bec5' },
  loginButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', width: '85%', borderRadius: 12, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', textAlign: 'center', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#757575', textAlign: 'center', marginBottom: 16 },
  cancelText: { fontSize: 15, color: '#4a90e2', textAlign: 'center', marginTop: 10 },
});
