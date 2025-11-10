import { setToken } from '@/src/Redux/Slices/studentTokenSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { RootStackParamList } from '../navigation/types';
import StudentSignupScreen from './StudentSignupScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StudentLogin'>;
type RouteProps = RouteProp<RootStackParamList, 'StudentLogin'>;

// ⚠️ IMPORTANT: Ensure this matches your backend API
const API_BASE_URL = 'http://localhost:5200/web';
const TOKEN_KEY = 'STUDENTTOKEN'; // Consistent AsyncStorage Key

// Custom Error Modal Component (kept unchanged)
const ErrorModal: React.FC<{
    isVisible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}> = ({ isVisible, title, message, onClose }) => (
    <Modal
        visible={isVisible}
        animationType="fade"
        transparent
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
                <Ionicons name="close-circle" size={40} color="#FF6347" style={styles.modalIcon} />
                <Text style={styles.modalTitle}>{title}</Text>
                <Text style={styles.modalSubtitle}>{message}</Text>
                <TouchableOpacity style={styles.loginButton} onPress={onClose}>
                    <Text style={styles.loginButtonText}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

// Custom Success Modal Component (kept unchanged)
const SuccessModal: React.FC<{
    isVisible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}> = ({ isVisible, title, message, onClose }) => (
    <Modal
        visible={isVisible}
        animationType="fade"
        transparent
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
                <Ionicons name="checkmark-circle" size={40} color="#4BB543" style={styles.modalIcon} />
                <Text style={styles.modalTitle}>{title}</Text>
                <Text style={styles.modalSubtitle}>{message}</Text>
                <TouchableOpacity style={styles.loginButton} onPress={onClose}>
                    <Text style={styles.loginButtonText}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);


const StudentLoginScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const isStudentLogin = route.params?.admin === true;
    const prefillEmail = route.params?.emailPrefill || '';

    const [email, setEmail] = useState(prefillEmail);
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'old' | 'new'>('old');

    // Error/Success States
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorModalTitle, setErrorModalTitle] = useState('Error');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const otpInputRef = useRef<TextInput>(null);
    const dispatch = useDispatch(); // Initialized here

    const validateEmail = (value: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const showCustomError = (title: string, message: string) => {
        setErrorModalTitle(title);
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    const showCustomSuccess = (message: string) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
    };

    // Minor fix to handleErrorModalOK - it was using `navigation.reset` which is too drastic for a simple error
    const handleErrorModalOK = () => {
        setShowErrorModal(false);
        // Do not reset navigation here unless the error is critical (e.g., authentication system failure)
        // Just dismiss the error modal.
    };

    const handleSendOtp = async () => {
        if (!email.trim()) return showCustomError('Validation Error', 'Please enter your email.');
        if (!validateEmail(email)) return showCustomError('Validation Error', 'Please enter a valid email.');

        if (isStudentLogin) {
            if (email !== 'admin@inframe.edu' || password !== 'Admin@123') {
                return showCustomError('Admin Login Failed', 'Invalid credentials.');
            }
            // Admin login is direct
            try {
                navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' as never }] });
            } catch (navError) {
                console.log('Admin navigation failed:', navError);
            }
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/student/send-otp`, { studentEmail: email });
            
            if (response.data?.success || response.status === 200) {
                setShowOtpModal(true);
                setTimeout(() => otpInputRef.current?.focus(), 100);
                showCustomSuccess(`OTP sent to ${email}`);
            } else {
                showCustomError('OTP Send Failed', response.data?.message || 'Failed to send OTP.');
            }
        } catch (err: any) {
            let message = err.response?.data?.message || 'Network error. Please try again.';
            showCustomError('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    // 🌟 FIX: Implemented Token Handling and Dispatch 🌟
    const handleVerifyOtp = async () => {
        if (otp.trim().length !== 6) {
            return showCustomError('Validation Error', 'Please enter a valid 6-digit OTP.');
        }

        setIsVerifying(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/student/verify-otp`, {
                studentEmail: email,
                enteredOtp: otp,
            });

            // 🎯 ASSUMPTION: The backend returns the authentication token in response.data.token
            const token = response.data?.token; 
            
            if ((response.data?.success || response.status === 200) && token) {
                console.log('✅ OTP verified successfully. Saving token...');
                
                // 1️⃣ Save Token to AsyncStorage
                await AsyncStorage.setItem(TOKEN_KEY, token);
                
                // 2️⃣ Dispatch Token to Redux
                dispatch(setToken({ token }));

                // 3️⃣ Close Modal and Navigate
                setShowOtpModal(false);
                setOtp('');
                
                // We use a small delay to prevent navigation conflicts while the modal closes, 
                // which is common in React Native
                setTimeout(() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'StudentChats' }], // Ensure 'StudentChats' is correct
                    });
                    console.log('✅ Navigation to StudentChats successful.');
                }, 100); 

            } else {
                showCustomError('OTP Not Match', response.data?.message || 'The OTP you entered is incorrect. Please try again.');
            }
        } catch (err: any) {
            console.error('Verification Error:', err.response?.data || err.message);
            let message = err.response?.data?.message || 'Network error. Please try again.';
            showCustomError('Verification Failed', message);
        } finally {
            setIsVerifying(false);
        }
    };


    // 🛠️ FIX: Using the correct TOKEN_KEY
    useEffect(() => {
        const checkToken = async () => {
            try {
                // Ensure the key matches the one used in handleVerifyOtp
                const storedToken = await AsyncStorage.getItem(TOKEN_KEY); 
                if (storedToken) {
                    console.log("Found stored token. Auto-logging in...");
                    dispatch(setToken({ token: storedToken }));
                    // Use navigation.reset for a clean start to the authenticated area
                    navigation.reset({ index: 0, routes: [{ name: "StudentChats" }] });
                }
            } catch (e) {
                console.error("Failed to retrieve token from storage:", e);
            }
        };

        checkToken();
    }, [dispatch, navigation]); // Added dependencies for useEffect best practices

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonHitSlop}>
                            <Ionicons name="chevron-back" size={22} color="#212121" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Student Login</Text>
                        <View style={{ width: 22 }} />
                    </View>

                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'new' && styles.tabActive]}
                            activeOpacity={0.8}
                            onPress={() => setActiveTab('new')}
                        >
                            <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>New Member</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'old' && styles.tabActive]}
                            activeOpacity={0.8}
                            onPress={() => setActiveTab('old')}
                        >
                            <Text style={[styles.tabText, activeTab === 'old' && styles.tabTextActive]}>Old Member</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'old' && (
                        <>
                            <Text style={styles.subtitle}>{isStudentLogin ? 'Admin Login' : 'Login with your Email'}</Text>

                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor="#757575"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            {isStudentLogin ? (
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
                                        <Text style={styles.loginButtonText}>Login as Student</Text>
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
                        </>
                    )}

                    {activeTab === 'new' && (
                        <View style={{ maxHeight: 520, overflow: 'hidden' }}>
                            <StudentSignupScreen />
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* OTP Entry Modal */}
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

            {/* Success Modal */}
            <SuccessModal
                isVisible={showSuccessModal}
                title="Success!"
                message={successMessage}
                onClose={() => setShowSuccessModal(false)}
            />

            {/* Error Modal */}
            <ErrorModal
                isVisible={showErrorModal}
                title={errorModalTitle}
                message={errorMessage}
                onClose={() => setShowErrorModal(false)}
            />
        </KeyboardAvoidingView>
    );
};

export default StudentLoginScreen;

const styles = StyleSheet.create({
    // ... (styles remain unchanged)
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        paddingVertical: 22,
        paddingHorizontal: 20,
        width: '90%',
        alignSelf: 'center',
        maxWidth: 520,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    backButtonHitSlop: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#212121', textAlign: 'center' },
    tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eeeeee', paddingBottom: 8, marginBottom: 18 },
    tab: { width: '50%', alignItems: 'center', paddingBottom: 8 },
    tabActive: { borderBottomWidth: 2, borderBottomColor: '#4a90e2' },
    tabText: { fontSize: 14, color: '#9e9e9e', fontWeight: '600' },
    tabTextActive: { color: '#4a90e2' },
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
        backgroundColor: '#e1e2e2ff',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16,
    },
    loginButtonDisabled: { backgroundColor: '#b0bec5' },
    loginButtonText: { fontSize: 16, fontWeight: '600', color: '#000000ff', paddingLeft: 30, paddingRight: 30 },
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
        color: '#757575',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalIcon: {
        marginBottom: 10,
    },
    cancelText: {
        fontSize: 15,
        color: '#4a90e2',
        textAlign: 'center',
        marginTop: 10,
    },
});