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
import { RootStackParamList } from '../navigation/types';
// Assuming you have vector icons installed for better visual alerts
import { setToken } from '@/src/Redux/Slices/studentTokenSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import StudentSignupScreen from './StudentSignupScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdvancedLogin'>;
type RouteProps = RouteProp<RootStackParamList, 'AdvancedLogin'>;

const API_BASE_URL = 'http://localhost:5200/web';

// 🆕 Custom Error Modal Component
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

// 🆕 Custom Success Modal Component
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
    const [activeTab, setActiveTab] = useState<'old' | 'new'>('old');

    // 🔄 Error/Admin Error States
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorModalTitle, setErrorModalTitle] = useState('Error');

    // 🆕 Success State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const otpInputRef = useRef<TextInput>(null);

    const validateEmail = (value: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    // 🔄 Updated function for all general errors/validations
    const showCustomError = (title: string, message: string) => {
        setErrorModalTitle(title);
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    // 🆕 Function for showing success message
    const showCustomSuccess = (message: string) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
    };

    const handleErrorModalOK = () => {
        // Reset state and navigate back on serious error
        setShowErrorModal(false);
        setShowOtpModal(false);
        navigation.reset({
            index: 0,
            routes: [{ name: 'AdvancedLogin' }],
        });
        setOtp('');
        console.log('✅ Navigation successful after error modal');
    };

    const handleSendOtp = async () => {
        // 🔄 Replaced Alert.alert with Modal
        if (!email.trim()) return showCustomError('Validation Error', 'Please enter your email.');
        // 🔄 Replaced Alert.alert with Modal
        if (!validateEmail(email)) return showCustomError('Validation Error', 'Please enter a valid email.');

        if (isAdmin) {
            if (email !== 'admin@inframe.edu' || password !== 'Admin@123') {
                // 🔄 Replaced Alert.alert with Modal for Admin Login Failure
                return showCustomError('Admin Login Failed', 'Invalid credentials.');
            }
            console.log('Admin login successful, navigating to AdminDashboard...');

            try {
                // Admin login is direct, no OTP for them in this logic
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
                // 🔄 Replaced Alert.alert with Modal for OTP Send Success
                showCustomSuccess(`OTP sent to ${email}`);
            } else {
                // 🔄 Replaced Alert.alert with Modal for OTP Send Failure
                showCustomError('OTP Send Failed', response.data?.message || 'Failed to send OTP.');
            }
        } catch (err: any) {
            console.error('Send OTP Error:', err);
            let message = 'Network error. Please try again.';
            if (err.response?.data?.message) {
                message = err.response.data.message;
            }
            // 🔄 Replaced Alert.alert with Modal for Network Error
            showCustomError('Error', message);
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
            // 🔄 Replaced Alert.alert with Modal
            showCustomError('Validation Error', 'Please enter a valid 6-digit OTP.');
            return;
        }

        setIsVerifying(true);
        console.log(`Starting API call to: ${API_BASE_URL}/student/verify-otp`);

        try {
            const requestData = { studentEmail: email, enteredOtp: otp };
            console.log('Request data:', requestData);

            const response = await axios.post(`${API_BASE_URL}/student/verify-otp`, requestData);
            console.log('=== API Response ===');

            if (response.data?.success || response.status === 200) {
                console.log('✅ OTP verification successful, navigating to Chats...');
                setShowOtpModal(false);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Chats' }],
                });
                setOtp('');
                console.log('✅ Navigation successful');
            } else {
                console.log('❌ OTP verification failed - showing mismatch popup');
                // 🔄 Replaced direct error modal call with custom function
                showCustomError('OTP Not Match', 'The OTP you entered is incorrect. Please try again.');
            }
        } catch (err: any) {
            console.error('=== OTP Verification Error ===');

            let message = 'Network error. Please try again.';
            if (err.response?.status === 400 || err.response?.data?.message) {
                message = err.response?.data?.message || 'The OTP you entered is incorrect or expired. Please try again.';
            }

            // 🔄 Replaced direct error modal call with custom function
            showCustomError('Verification Failed', message);

        } finally {
            console.log('=== OTP Verification Finished ===');
            setIsVerifying(false);
        }
    };

    const dispatch = useDispatch()


    useEffect(() => {
        const checkToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('TOKEN');
                if (storedToken) {
                    console.log("Found stored token. Auto-logging in...");
                    dispatch(setToken({ token: storedToken }));
                    // Navigate directly to the authenticated screen
                    navigation.reset({ index: 0, routes: [{ name: "Chats" }] });
                }
            } catch (e) {
                console.error("Failed to retrieve token from storage:", e);
                // Continue to login screen if storage check fails
            }
        };

        checkToken();
    }, []);

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
                        </>
                    )}

                    {activeTab === 'new' && (
                        <View style={{ maxHeight: 520, overflow: 'hidden' }}>
                            <StudentSignupScreen />
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* OTP Entry Modal (Existing, Unchanged) */}
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

            {/* 🆕 Success Modal (Used for OTP sent confirmation) */}
            <SuccessModal
                isVisible={showSuccessModal}
                title="Success!"
                message={successMessage}
                onClose={() => setShowSuccessModal(false)}
            />

            {/* 🔄 Error Modal (Used for validation, send failure, verify failure, admin failure) */}
            <ErrorModal
                isVisible={showErrorModal}
                title={errorModalTitle}
                message={errorMessage}
                onClose={() => setShowErrorModal(false)}
            />
        </KeyboardAvoidingView>
    );
};

export default AdvancedLoginScreen;

const styles = StyleSheet.create({
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