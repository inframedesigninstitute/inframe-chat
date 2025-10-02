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
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OtpVerification'>;

const OtpVerificationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { email } = route.params as { email: string };

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyOtp = () => {
    if (otp.trim().length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);

    // Simulate OTP verification
    setTimeout(() => {
      setIsVerifying(false);
      Alert.alert('Success', `Email ${email} verified`);
      navigation.navigate('MainTabs'); // ✅ Navigate to MainTabs after OTP verified
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>Enter the 6-digit OTP sent to {email}</Text>

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
          style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
          onPress={handleVerifyOtp}
          disabled={isVerifying}
        >
          <Text style={styles.verifyButtonText}>
            {isVerifying ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#212121', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#757575', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#212121', marginBottom: 20, borderWidth: 1, borderColor: '#e0e0e0' },
  verifyButton: { backgroundColor: '#4a90e2', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  verifyButtonDisabled: { backgroundColor: '#b0bec5' },
  verifyButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
