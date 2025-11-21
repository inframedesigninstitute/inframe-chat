import { setToken } from '@/src/Redux/Slices/adminTokenSlice';
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
import AdminSignupScreen from './AdminSignInScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdvancedLogin'>;
type RouteProps = RouteProp<RootStackParamList, 'AdvancedLogin'>;

const API_BASE_URL = 'http://localhost:5200/web';

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


const AdminLoginScreen = () => {
    const dispatch = useDispatch()
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

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorModalTitle, setErrorModalTitle] = useState('Error');

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const otpInputRef = useRef<TextInput>(null);

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

    const handleErrorModalOK = () => {
        setShowErrorModal(false);
        setShowOtpModal(false);
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' as never }],
        });
        setOtp('');
        console.log('Navigation successful after error modal');
    };

    const handleSendOtp = async () => {
        if (!email.trim()) return showCustomError('Validation Error', 'Please enter your email.');
        if (!validateEmail(email)) return showCustomError('Validation Error', 'Please enter a valid email.');

        if (isAdmin) {
            if (email !== 'admin@inframe.edu' || password !== 'Admin@123') {
                return showCustomError('Admin Login Failed', 'Invalid credentials.');
            }
            console.log('Admin login successful, navigating to AdminChats...');

            // For the hardcoded admin, let's manually set a dummy token for Redux/AsyncStorage
            const DUMMY_ADMIN_TOKEN = 'hardcoded_admin_token_12345';
            const DUMMY_ADMIN_ID = 'admin_hardcoded_001';
            try {
                await AsyncStorage.setItem('ADMINTOKEN', DUMMY_ADMIN_TOKEN);
                await AsyncStorage.setItem('USERID', DUMMY_ADMIN_ID);
                
                console.log('💡 Using hardcoded admin ID:', DUMMY_ADMIN_ID);
                console.log('⚠️ Note: Backend messages must use this same ID as senderId');
                
                dispatch(setToken({ token: DUMMY_ADMIN_TOKEN }));
                navigation.navigate('AdminChats' as never);
                console.log('✅ Direct admin navigation successful with token and user ID set');
            } catch (error) {
                console.error('Error setting admin token or navigating:', error);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AdminChats' as never }],
                });
            }
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/main-admin/send-otp`, { mainAdminEmail: email });
            console.log('OTP Response:', response.data);

            if (response.data?.success || response.status === 200) {
                setShowOtpModal(true);
                setTimeout(() => otpInputRef.current?.focus(), 100);
                showCustomSuccess(`OTP sent to ${email}`);
            } else {
                showCustomError('OTP Send Failed', response.data?.message || 'Failed to send OTP.');
            }
        } catch (err: any) {
            console.error('Send OTP Error:', err);
            let message = 'Network error. Please try again.';
            if (err.response?.data?.message) {
                message = err.response.data.message;
            }
            showCustomError('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('ADMINTOKEN');
                if (storedToken) {
                    console.log("Found stored token. Auto-logging in...");
                    dispatch(setToken({ token: storedToken }));
                    // Using AdminChats as a representative admin-only route
                    navigation.reset({ index: 0, routes: [{ name: "AdminChats" as never }] });
                }
            } catch (e) {
                console.error("Failed to retrieve token from storage:", e);
            }
        };

        checkToken();
    }, []);

    const handleBack = () => {
        if (showOtpModal) {
            setShowOtpModal(false);
            return;
        }
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
        }
    };

    // --- Handle Verify OTP ---
    const handleVerifyOtp = async () => {
        console.log('=== OTP Verification Started ===');

        if (otp.trim().length !== 6) {
            console.log('OTP length validation failed');
            showCustomError('Validation Error', 'Please enter a valid 6-digit OTP.');
            return;
        }

        setIsVerifying(true);

        console.log(`Starting API call to: ${API_BASE_URL}/main-admin/verify-otp`);

        try {
            const requestData = { mainAdminEmail: email, enteredOtp: otp };
            console.log('Request data:', requestData);

            const response = await axios.post(`${API_BASE_URL}/main-admin/verify-otp`, requestData);
            console.log('=== API Response ===');

            if (response.data?.success || response.status === 200) {
                // TOKEN FIX: Save the token received from the backend
                const token = response.data.token;
                const userId = response.data.userId || response.data.mainAdminId || response.data._id;
                
                if (token) {
                    await AsyncStorage.setItem('ADMINTOKEN', token);
                    dispatch(setToken({ token: token }));
                    console.log('✅ Token saved and set in Redux.');
                } else {
                    console.warn('Backend verification successful but no token received.');
                }

                // ✅ Save User ID for RTM
                if (userId) {
                    await AsyncStorage.setItem('USERID', userId);
                    console.log('✅ User ID saved:', userId);
                } else {
                    console.warn('⚠️ User ID not found in response. Using fallback.');
                    // Fallback: Save email as ID for now
                    await AsyncStorage.setItem('USERID', email);
                }

                console.log('✅ OTP verification successful, navigating to AdminChats...');
                setShowOtpModal(false);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'AdminChats' as never }],
                });
                setOtp('');
                console.log('✅ Navigation successful');
            } else {
                console.log('❌ OTP verification failed - showing mismatch popup');
                showCustomError('OTP Not Match', 'The OTP you entered is incorrect. Please try again.');
            }
        } catch (err: any) {
            console.error('=== OTP Verification Error ===', err);

            let message = 'Network error. Please try again.';
            if (err.response?.status === 400 || err.response?.data?.message) {
                message = err.response?.data?.message || 'The OTP you entered is incorrect or expired. Please try again.';
            }

            showCustomError('Verification Failed', message);

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
                <View style={styles.card}>
                    {/* Header with back and title */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={handleBack} style={styles.backButtonHitSlop}>
                            <Ionicons name="chevron-back" size={22} color="#212121" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Admin Login</Text>
                        <View style={{ width: 22 }} />
                    </View>

                    {/* Tabs */}
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

                    {/* Section title */}
                    {activeTab === 'old' && (
                        <>
                            <Text style={styles.sectionTitle}></Text>
                            <Text style={styles.subtitle}>{isAdmin ? 'Admin Login' : 'Login with your Email'}</Text>
                        </>
                    )}
                    {activeTab === 'old' ? (
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
                    ) : (
                        <View style={styles.embeddedContainer}>
                            <AdminSignupScreen />
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

export default AdminLoginScreen;

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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    backButtonHitSlop: { padding: 4 },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212121',
        textAlign: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eeeeee',
        paddingHorizontal: 0,
        paddingBottom: 8,
        marginBottom: 18,
    },
    tab: {
        width: '50%',
        alignItems: 'center',
        paddingBottom: 8,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#4a90e2',
    },
    tabText: {
        fontSize: 14,
        color: '#9e9e9e',
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#4a90e2',
    },
    embeddedContainer: {
        maxHeight: 520,
        overflow: 'hidden',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#212121',
        textAlign: 'center',
        marginTop: 8,
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
        backgroundColor: '#dbdbdbff',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16,
    },
    loginButtonDisabled: { backgroundColor: '#dbdbdbff' },
    loginButtonText: { fontSize: 18, fontWeight: '600', color: '#000000ff', paddingLeft: 30, paddingRight: 30 },
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
        alignItems: 'center',
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