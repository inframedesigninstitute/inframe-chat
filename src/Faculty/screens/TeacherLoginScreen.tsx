import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { setToken } from '../../Redux/Slices/facultyTokenSlice';
import facultyStore from '../../Redux/Store/store';
import { RootStackParamList } from '../navigation/types';
import TeacherSignupScreen from './TeacherSignupScreen';

// ✅ Type definitions
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TeacherLogin'>;
type RouteProps = RouteProp<
    { TeacherLogin: { TeacherLogin?: boolean; emailPrefill?: string; admin?: boolean } },
    'TeacherLogin'
>;

const API_BASE_URL = 'http://localhost:5200/web';

// ✅ Custom Modal Component
const CustomErrorModal: React.FC<{
    isVisible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onPressOk?: () => void;
}> = ({ isVisible, title, message, onClose, onPressOk }) => {
    const handleClose = () => {
        onClose();
        if (onPressOk) onPressOk();
    };

    const iconName = title.includes('Success') ? 'checkmark-circle' : 'close-circle';
    const iconColor = title.includes('Success') ? '#4BB543' : (title.includes('Error') || title.includes('Failed') ? '#FF6347' : '#FFA500');

    return (
        <Modal visible={isVisible} animationType="fade" transparent onRequestClose={handleClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Ionicons name={iconName} size={40} color={iconColor} style={styles.modalIcon} />
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalSubtitle}>{message}</Text>
                    <TouchableOpacity style={[styles.loginButton, { backgroundColor: "#e2ddddff" }]} onPress={handleClose}>
                        <Text style={styles.loginButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const TeacherLoginScreen = () => {
    const dispatch = useDispatch();
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
    const [activeTab, setActiveTab] = useState<'old' | 'new'>('old');

    const [showCustomAlert, setShowCustomAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    const [onAlertOkPress, setOnAlertOkPress] = useState<(() => void) | undefined>(undefined);

    const otpInputRef = useRef<TextInput>(null);

    const validateEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const showModal = (title: string, message: string, onOkPress?: () => void) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setOnAlertOkPress(() => onOkPress);
        setShowCustomAlert(true);
    };

    // 🆕 Auto-Login Check on Component Mount (UNCHANGED)
    useEffect(() => {
        const checkToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('FACULTYTOKEN');
                if (storedToken) {
                    console.log("Found stored token. Auto-logging in...");
                    dispatch(setToken({ token: storedToken }));
                    // Navigate directly to the authenticated screen
                    navigation.reset({ index: 0, routes: [{ name: "FacultyChats" }] });
                }
            } catch (e) {
                console.error("Failed to retrieve token from storage:", e);
                // Continue to login screen if storage check fails
            }
        };

        checkToken();
    }, []);

    // ✅ FIXED Logout Function
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('TOKEN');

            // ⭐️ FIX: Changed 'null' to '' (empty string) to satisfy the 'string' type expectation 
            // of the Redux slice action, resolving the TypeScript error 2322.
            dispatch(setToken({ token: "" }));

            console.log("User logged out. Token cleared.");
            // Reset navigation stack to the login screen
            navigation.reset({ index: 0, routes: [{ name: "TeacherLogin" }] });
        } catch (e) {
            console.error("Failed to clear token during logout:", e);
        }
    };

    console.log(facultyStore);

    const handleSendOtp = async () => {
        if (!email.trim()) return showModal('Validation Error', 'Please enter your email');
        if (!validateEmail(email)) return showModal('Validation Error', 'Please enter a valid email');

        if (isTeacherLogin) {
            if (!password.trim()) return showModal('Validation Error', 'Please enter your password');
            if (email !== 'admin@inframe.edu' || password !== 'Admin@123')
                return showModal('Admin Login Failed', 'Invalid credentials');

            navigation.reset({ index: 0, routes: [{ name: 'TeacherDashboard' as never }] });
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/faculty/send-otp`, { facultyEmail: email });
            console.log('OTP Response:', response.data);

            if (response.data?.success || response.status === 200) {
                setShowOtpModal(true);
                setTimeout(() => otpInputRef.current?.focus(), 100);
                showModal('Success', `OTP sent to ${email}`);
            } else {
                showModal('Error', response.data?.message || 'Failed to send OTP');
            }
        } catch (err: any) {
            console.error('Send OTP Error:', err);
            let message = err.response?.data?.message || 'Network error. Please try again.';
            showModal('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ OTP Verification Function (UNCHANGED)
    const handleVerifyOtp = async () => {
        console.log('=== OTP Verification Started ===');

        if (otp.trim().length !== 6) {
            showModal('Validation Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setIsVerifying(true);

        try {
            const requestData = { facultyEmail: email, otp };
            const response = await axios.post(`${API_BASE_URL}/faculty/verify-otp`, requestData);

            console.log("OTP Verify Response:", response.data);

            // Checking for both success flag and token to ensure navigation
            if ((response.data?.success || response.status === 200) && response.data?.token) {
                dispatch(setToken({ token: response.data.token }));
                await AsyncStorage.setItem("FACULTYTOKEN", response.data.token);

                console.log("✅ OTP verified successfully. Navigating to FacultyChats...");

                setShowOtpModal(false);
                setOtp("");

                showModal("Success!", "Verification successful. Welcome!", () =>
                    navigation.reset({ index: 0, routes: [{ name: "FacultyChats" }] })
                );
            } else {
                console.log("❌ OTP verification failed or token missing.");
                showModal("OTP Mismatch", response.data?.message || "Incorrect OTP or missing token. Please try again.");
            }
        } catch (err: any) {
            console.error("=== OTP Verification Error ===", err.response || err.message);

            let message = "Network error. Please try again.";
            if (err.response?.data?.message) {
                // Use specific error from the backend if available
                message = err.response.data.message;
            } else if (err.message.includes('5200')) {
                message = "Connection refused. Please ensure the backend server is running.";
            }

            showModal("Verification Failed", message);
        } finally {
            setIsVerifying(false);
            console.log("=== OTP Verification Finished ===");
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonHitSlop}>
                            <Ionicons name="chevron-back" size={22} color="#212121" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Faculty Login</Text>
                        <View style={{ width: 22 }} />
                    </View>

                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'new' && styles.tabActive]}
                            onPress={() => setActiveTab('new')}
                        >
                            <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>New Member</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'old' && styles.tabActive]}
                            onPress={() => setActiveTab('old')}
                        >
                            <Text style={[styles.tabText, activeTab === 'old' && styles.tabTextActive]}>Old Member</Text>
                        </TouchableOpacity>
                    </View>

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
                        </>
                    ) : (
                        <TeacherSignupScreen />
                    )}
                </View>
            </ScrollView>

            {/* OTP Modal */}
            <Modal visible={showOtpModal} animationType="fade" transparent onRequestClose={() => setShowOtpModal(false)}>
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
        width: '60%',
        alignSelf: 'center',
        maxWidth: 420,
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
        paddingBottom: 8,
        marginBottom: 18,
    },
    tab: { width: '50%', alignItems: 'center', paddingBottom: 8 },
    tabActive: { borderBottomWidth: 2, borderBottomColor: '#4a90e2' },
    tabText: { fontSize: 14, color: '#9e9e9e', fontWeight: '600' },
    tabTextActive: { color: '#4a90e2' },
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
    loginButtonText: { fontSize: 16, fontWeight: '600', color: '#000', paddingHorizontal: 30 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        width: '65%',
        borderRadius: 12,
        padding: 24,
        elevation: 5,
        alignItems: 'center',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', textAlign: 'center', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: '#080808ff', textAlign: 'center', marginBottom: 16 },
    modalIcon: { marginBottom: 10 },
    cancelText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        fontWeight: '500',
        marginTop: 0,
        backgroundColor: "#e9e8e8ff",
        paddingHorizontal: 30,
        padding: 10,
        borderRadius: 10,
    },
});