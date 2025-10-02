import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdvancedLogin'>;
type RouteProps = RouteProp<RootStackParamList, 'AdvancedLogin'>;

const AdvancedLoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const isAdmin = route.params?.admin === true;
  const prefillEmail = route.params?.emailPrefill || '';
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  React.useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSendOtp = () => {
    if (isAdmin) {
      if (email.trim() !== 'admin@inframe.edu' || password !== 'Admin@123') {
        Alert.alert('Admin Login Failed', 'Invalid admin credentials');
        return;
      }
      navigation.navigate('AdminDashboard');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Simulate sending OTP
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', `OTP sent to ${email}`);
      setAwaitingOtp(true);
    }, 500);
  };

  const handleVerifyOtp = () => {
    if (otp.trim().length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      Alert.alert('Success', `Email ${email} verified`);
      navigation.navigate('MainTabs');
    }, 300);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>{isAdmin ? 'Admin Login' : awaitingOtp ? `Enter the 6-digit OTP sent to ${email}` : 'Login with your Email'}</Text>

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
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleSendOtp}
                >
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
              <Text style={styles.loginButtonText}>{isVerifying ? 'Verifying...' : 'Verify OTP'}</Text>
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
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#212121', marginBottom: 20, borderWidth: 1, borderColor: '#e0e0e0' },
  loginButton: { backgroundColor: '#4a90e2', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  loginButtonDisabled: { backgroundColor: '#b0bec5' },
  loginButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
