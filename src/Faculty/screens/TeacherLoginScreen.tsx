import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import {
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
// 👈 You will need this dependency
import Ionicons from 'react-native-vector-icons/Ionicons';

// ✅ FIXED TYPE DEFINITIONS
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TeacherLogin'>;
type RouteProps = RouteProp<
    { TeacherLogin: { TeacherLogin?: boolean; emailPrefill?: string; admin?: boolean } },
    'TeacherLogin'
>;

const API_BASE_URL = 'http://localhost:5200/web';

// 🆕 Custom Error/Warning Modal Component
const CustomErrorModal: React.FC<{
    isVisible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    // Optional: for navigating on OK press
    onPressOk?: () => void; 
}> = ({ isVisible, title, message, onClose, onPressOk }) => {
    const handleClose = () => {
        onClose();
        if (onPressOk) {
            onPressOk();
        }
    };

    // Determine icon and color based on title/severity
    const iconName = title.includes('Success') ? 'checkmark-circle' : 'close-circle';
    const iconColor = title.includes('Success') ? '#4BB543' : (title.includes('Error') || title.includes('Failed') ? '#FF6347' : '#FFA500'); // Orange for warning

    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Ionicons name={iconName} size={40} color={iconColor} style={styles.modalIcon} />
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalSubtitle}>{message}</Text>
                    <TouchableOpacity 
                        style={[styles.loginButton, { backgroundColor: "#e2ddddff" }]} 
                        onPress={handleClose}
                    >
                        <Text style={styles.loginButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const TeacherLoginScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const isTeacherLogin = route.params?.TeacherLogin === true;
    const prefillEmail = route.params?.emailPrefill || '';

    const [email, setEmail] = useState(prefillEmail);
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    
    // 🔄 General Modal States
    const [showCustomAlert, setShowCustomAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    const [onAlertOkPress, setOnAlertOkPress] = useState<(() => void) | undefined>(undefined);

    const otpInputRef = useRef<TextInput>(null);

    const validateEmail = (value: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    // 🆕 Unified Modal Show Function
    const showModal = (title: string, message: string, onOkPress?: () => void) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setOnAlertOkPress(() => onOkPress);
        setShowCustomAlert(true);
    };

    // 🔄 Unified Modal Close Function
    const handleCustomAlertClose = () => {
        setShowCustomAlert(false);
        // Execute the navigation logic if defined
        if (onAlertOkPress) {
            onAlertOkPress();
        }
        // Reset OTP states and navigate back to Login page on certain errors/successes
        if (alertTitle.includes('Error') || alertTitle.includes('Success')) {
            setShowOtpModal(false);
            setOtp('');
            // Only reset navigation on major errors or successful full flow completion
            if (alertTitle.includes('Error') && !showOtpModal) {
                 navigation.reset({ index: 0, routes: [{ name: 'TeacherLogin' }] });
            }
        }
    };


    const handleSendOtp = async () => {
        // 🔄 Replaced Alert.alert with showModal for validation
        if (!email.trim()) return showModal('Validation Error', 'Please enter your email');
        if (!validateEmail(email)) return showModal('Validation Error', 'Please enter a valid email');

        if (isTeacherLogin) {
            if (email !== 'admin@inframe.edu' || password !== 'Admin@123') {
                // 🔄 Replaced Alert.alert with showModal for Admin Login Failure
                return showModal('Admin Login Failed', 'Invalid credentials');
            }
            console.log('Admin login successful, navigating to AdminDashboard...');

            try {
                // Direct navigation for the hardcoded admin login
                navigation.navigate('TeacherLoginnDashboard' as never);
            } catch (navError) {
                console.log('Direct TeacherLogin navigation failed, trying reset:', navError);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'TeacherLoginnDashboard' as never }],
                });
            }
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/faculty/send-otp`, { facultyEmail: email });
            console.log('OTP Response:', response.data);

            if (response.data?.success || response.status === 200) {
                setShowOtpModal(true);
                setTimeout(() => otpInputRef.current?.focus(), 100);
                // 🔄 Replaced Alert.alert with showModal for OTP Send Success
                showModal('Success', `OTP sent to ${email}`, undefined); // Keep modal open, then proceed to OTP entry
            } else {
                // 🔄 Replaced Alert.alert with showModal for OTP Send Failure
                showModal('Error', response.data?.message || 'Failed to send OTP');
            }
        } catch (err: any) {
            console.error('Send OTP Error:', err);
            let message = 'Network error. Please try again.';
            if (err.response?.data?.message) {
                message = err.response.data.message;
            }
            // 🔄 Replaced Alert.alert with showModal for Network Error
            showModal('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        console.log('=== OTP Verification Started ===');

        if (otp.trim().length !== 6) {
            console.log('OTP length validation failed');
            // 🔄 Replaced Alert.alert with showModal
            showModal('Validation Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setIsVerifying(true);

        try {
            const requestData = { facultyEmail: email, enteredOtp: otp };
            const response = await axios.post(`${API_BASE_URL}/faculty/verify-otp`, requestData);

            if (response.data?.success || response.status === 200) {
                console.log('✅ OTP verification successful, navigating to FacultyChatsScreen...');
                setShowOtpModal(false);
                // Success Modal with Navigation reset
                showModal('Success!', 'Verification successful. Welcome!', () => 
                    navigation.reset({ index: 0, routes: [{ name: 'Chats' }] })
                );
                setOtp('');
            } else {
                console.log('❌ OTP verification failed - showing mismatch popup');
                // 🔄 Replaced direct error modal logic with showModal
                showModal('OTP Mismatch', 'The OTP you entered is incorrect. Please try again.');
            }
        } catch (err: any) {
            console.error('=== OTP Verification Error ===');
            let message = 'Network error. Please try again.';
            if (err.response?.status === 400 || err.response?.data?.message) {
                 message = err.response?.data?.message || 'The OTP you entered is incorrect or expired. Please try again.';
            }
            
            // 🔄 Replaced direct error modal logic with showModal
            showModal('Verification Failed', message);
            
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
                <Text style={styles.title}>Faculty Login</Text>
                <Text style={styles.subtitle}>{isTeacherLogin ? 'TeacherLogin' : 'Login with your Email'}</Text>

                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#757575"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {isTeacherLogin ? (
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

            {/* 🔄 OTP Entry Modal (Unchanged functional structure) */}
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
                            placeholderTextColor="#181717ff"
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

            {/* 🆕 Unified Custom Alert Modal (Handles Success, Error, Validation) */}
            <CustomErrorModal
                isVisible={showCustomAlert}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setShowCustomAlert(false)}
                onPressOk={onAlertOkPress}
            />
        </KeyboardAvoidingView>
    );
};

export default TeacherLoginScreen;

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
        color: '#070606ff',
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
        backgroundColor: '#ecececff',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16,
    },
    loginButtonDisabled: { backgroundColor: '#b0bec5' },
    loginButtonText: { fontSize: 16, fontWeight: '600', color: '#000000ff',paddingLeft:30, paddingRight:30 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        width: '45%',
        borderRadius: 12,
        padding: 24,
        elevation: 5,
        alignItems: 'center', // Added for centering icon/text
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
        color: '#080808ff',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalIcon: {
        marginBottom: 10,
    },
    cancelText: {
        fontSize: 16,
        color: '#000000ff',
        textAlign: 'center',fontWeight:500,
        marginTop: 0,backgroundColor:"#e9e8e8ff", 
        paddingLeft:30,paddingRight:30, padding:10, borderRadius:10
    },
});