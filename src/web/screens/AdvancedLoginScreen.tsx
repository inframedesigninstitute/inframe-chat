import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdvancedLogin'>;
type RouteProps = RouteProp<RootStackParamList, 'AdvancedLogin'>;

const API_BASE_URL = 'https://your-api-domain.com'; // <-- Replace with your API

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
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  // Email validation
  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // --- SEND OTP ---
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
      const response = await axios.post(`${API_BASE_URL}/send-otp`, { email });
      if (response.data.success) {
        Alert.alert('Success', `OTP sent to ${email}`);
        setAwaitingOtp(true);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- VERIFY OTP ---
  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      return Alert.alert('Error', 'Please enter a valid 6-digit OTP');
    }

    setIsVerifying(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp });
      if (response.data.success) {
        Alert.alert('Success', `Email ${email} verified`);
        // Navigate to main app
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Error', response.data.message || 'OTP verification failed');
      }
    } catch (err: any) {
      console.error(err);
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
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>
          {isAdmin
            ? 'Admin Login'
            : awaitingOtp
            ? `Enter the 6-digit OTP sent to ${email}`
            : 'Login with your Email'}
        </Text>

        {!awaitingOtp && (
          <>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#757575"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {!isAdmin && (
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

            {isAdmin && (
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
            )}
          </>
        )}

        {awaitingOtp && !isAdmin && (
          <>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
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
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default AdvancedLoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#212121', marginBottom: 8, textAlign: 'center' },
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
  loginButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: { backgroundColor: '#b0bec5' },
  loginButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
