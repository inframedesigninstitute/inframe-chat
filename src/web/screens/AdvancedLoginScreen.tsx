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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const otpInputRef = useRef<TextInput>(null);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleErrorModalOK = () => {
    setShowErrorModal(false);
    setShowOtpModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
    setOtp('');
    console.log('✅ Navigation successful after error modal');
  };

  const handleSendOtp = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email');
    if (!validateEmail(email)) return Alert.alert('Error', 'Please enter a valid email');

    if (isAdmin) {
      if (email !== 'admin@inframe.edu' || password !== 'Admin@123') {
        return Alert.alert('Admin Login Failed', 'Invalid credentials');
      }
      console.log('Admin login successful, navigating to AdminDashboard...');
      
      try {
        navigation.navigate('AdminDashboard' as never);
        console.log('Direct admin navigation successful');
      } catch (navError) {
        console.log('Direct admin navigation failed, trying reset:', navError);
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminDashboard' as never }],
        });
      }
      return;
    }

    setIsLoading(true);
    try {
const response = await axios.post(`${API_BASE_URL}/student/send-otp`, { studentEmail: email });
      console.log('OTP Response:', response.data);

      if (response.data?.success || response.status === 200) {
        setShowOtpModal(true);
        setTimeout(() => otpInputRef.current?.focus(), 100);
Alert.alert('Success', `OTP sent to ${email}`);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Send OTP Error:', err);
      if (err.response?.data?.message) {
        Alert.alert('Error', err.response.data.message);
      } else {
        Alert.alert('Error', 'Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handle Verify OTP ---
  const handleVerifyOtp = async () => {
    console.log('=== OTP Verification Started ===');
    console.log('Email:', email);
    console.log('OTP:', otp);
    console.log('OTP Length:', otp.trim().length);
    
    if (otp.trim().length !== 6) {
      console.log('OTP length validation failed');
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
console.log(`Starting API call to: ${API_BASE_URL}/student/verify-otp`);
    
    try {
      // ✅ FIXED LINE BELOW
      const requestData = { studentEmail: email, enteredOtp: otp };
      console.log('Request data:', requestData);
      
const response = await axios.post(`${API_BASE_URL}/student/verify-otp`, requestData);
      console.log('=== API Response ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('Success check:', response.data?.success);
      console.log('Status 200 check:', response.status === 200);

      if (response.data?.success || response.status === 200) {
        console.log('✅ OTP verification successful, navigating to MainTabs...');
        setShowOtpModal(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
        setOtp('');
        console.log('✅ Navigation successful');
      } else {
        console.log('❌ OTP verification failed - showing mismatch popup');
        setErrorMessage('The OTP you entered is incorrect. Please try again.');
        setShowErrorModal(true);
      }
    } catch (err: any) {
      console.error('=== OTP Verification Error ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      if (err.response?.status === 400) {
        console.log('400 Bad Request - OTP verification failed');
        setErrorMessage('The OTP you entered is incorrect. Please try again.');
        setShowErrorModal(true);
      } else {
        console.log('Other error - showing generic message');
        setErrorMessage('Network error. Please try again.');
        setShowErrorModal(true);
      }
    } finally {
      console.log('=== OTP Verification Finished ===');
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

      <Modal
        visible={showOtpModal}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setShowOtpModal(false);
        }}
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
              autoFocus
              editable={!isVerifying}
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
            <TouchableOpacity 
              onPress={() => {
                setShowOtpModal(false);
                setOtp('');
              }}
              disabled={isVerifying}
            >
              <Text style={[styles.cancelText, isVerifying && { opacity: 0.5 }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showErrorModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>OTP Not Match</Text>
            <Text style={styles.modalSubtitle}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleErrorModalOK}
            >
              <Text style={styles.loginButtonText}>OK</Text>
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 32,
  },
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
  loginButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: { backgroundColor: '#b0bec5' },
  loginButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 12,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 16,
  },
  cancelText: {
    fontSize: 15,
    color: '#4a90e2',
    textAlign: 'center',
    marginTop: 10,
  },
});