import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // 👈 Needed for icons
import { RootStackParamList } from '../navigation/types';

type StudentSignupScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'StudentSignup'
>;

// 🆕 Custom Error Modal Component
const ErrorModal: React.FC<{
    isVisible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    // Optional: for navigating on OK press (like in failure/retry)
    onPressOk?: () => void;
}> = ({ isVisible, title, message, onClose, onPressOk }) => {
    const handleClose = () => {
        onClose();
        if (onPressOk) {
            onPressOk();
        }
    };
    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent
            onRequestClose={handleClose}
        >
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalBox}>
                    <Ionicons name="close-circle" size={40} color="#FF6347" style={modalStyles.modalIcon} />
                    <Text style={modalStyles.modalTitle}>{title}</Text>
                    <Text style={modalStyles.modalSubtitle}>{message}</Text>
                    <TouchableOpacity style={[modalStyles.modalButton, { backgroundColor: '#dad8d7ff' }]} onPress={handleClose}>
                        <Text style={modalStyles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// 🆕 Custom Success Modal Component
const SuccessModal: React.FC<{
    isVisible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onPressOk: () => void;
}> = ({ isVisible, title, message, onClose, onPressOk }) => {
    const handleClose = () => {
        onClose();
        onPressOk();
    };
    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent
            onRequestClose={handleClose}
        >
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalBox}>
                    <Ionicons name="checkmark-circle" size={40} color="#090a09ff" style={modalStyles.modalIcon} />
                    <Text style={modalStyles.modalTitle}>{title}</Text>
                    <Text style={modalStyles.modalSubtitle}>{message}</Text>
                    <TouchableOpacity style={[modalStyles.modalButton, { backgroundColor: '#686b67ff' }]} onPress={handleClose}>
                        <Text style={modalStyles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


const StudentSignupScreen = () => {
    const navigation = useNavigation<StudentSignupScreenNavigationProp>();
    
    // 🔄 State for form data
    const [formData, setFormData] = useState({
        studentName: '',
        studentFatherName: '',
        studentEmail: '',
        studentBatch: '',
        studentDepartment: '',
        studentGender: '',
    });
    const [loading, setLoading] = useState(false);

    // 🆕 State for managing the custom modal
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorModalTitle, setErrorModalTitle] = useState('Error');

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // 🆕 Helper Functions to control modals
    const showCustomError = (title: string, message: string) => {
        setErrorModalTitle(title);
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    const showCustomSuccess = (message: string) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        // 🔄 Replaced Alert.alert with showCustomError
        if (!formData.studentName.trim()) return showCustomError('Validation Error', 'Name is required');
        if (!formData.studentFatherName.trim()) return showCustomError('Validation Error', 'Father Name is required');
        if (!formData.studentBatch.trim()) return showCustomError('Validation Error', 'Batch is required');
        if (!formData.studentDepartment.trim()) return showCustomError('Validation Error', 'Course Name is required');
        if (!formData.studentGender.trim()) return showCustomError('Validation Error', 'Gender is required');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        const studentData = formData;

        try {
            const API_URL = 'http://localhost:5200/web/student/register';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData),
            });

            const result = await response.json();

            if (response.ok) {
                // Success - 🔄 Replaced Alert.alert with SuccessModal
                showCustomSuccess('Your data has been added successfully! Admin will approve your account in 4 hours.');

                // Clear form data on success (after modal is shown)
                setFormData({ studentName: '', studentFatherName: '', studentEmail: '', studentBatch: '', studentDepartment: '', studentGender: '' });
            } else {
                // API responded with error
                // 🔄 Throws error to be caught below
                throw new Error(result?.message || 'API registration failed');
            }
        } catch (error: any) {
            console.error('Registration/API error:', error);

            // Save data locally if API/network fails
            try {
                const existingData = await AsyncStorage.getItem('studentRegistrations');
                const registrations = existingData ? JSON.parse(existingData) : [];
                registrations.push(formData);
                await AsyncStorage.setItem('studentRegistrations', JSON.stringify(registrations));
            } catch (storageError) {
                console.error('AsyncStorage error:', storageError);
            }

            // 🔄 Replaced Alert.alert with ErrorModal for API/Network failure
            showCustomError(
                'Submission Failed ❌',
                error.message || 'Your data could not be submitted to the server. It has been saved locally. Please check your network and try again later.'
            );
        } finally {
            setLoading(false); // Stop showing "Submitting..."
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <SuccessModal
                isVisible={showSuccessModal}
                title="Success 🎉"
                message={successMessage}
                onClose={() => setShowSuccessModal(false)}
                // Navigate to Login after OK press
                onPressOk={() => navigation.navigate('Login')}
            />

            <ErrorModal
                isVisible={showErrorModal}
                title={errorModalTitle}
                message={errorMessage}
                onClose={() => setShowErrorModal(false)}
                // Optional: Navigate to Login after OK press on API/network failure
                onPressOk={errorModalTitle === 'Submission Failed ❌' ? () => navigation.navigate('Login') : undefined}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Student Registration</Text>
                    <Text style={styles.formSubtitle}>
                        Fill in your details to register as a student
                    </Text>

                    {/* Name Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            value={formData.studentName}
                            onChangeText={value => handleInputChange('studentName', value)}
                        />
                    </View>

                    {/* Father Name Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Father Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your father's name"
                            value={formData.studentFatherName}
                            onChangeText={value => handleInputChange('studentFatherName', value)}
                        />
                    </View>

                    {/* Email Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={formData.studentEmail}
                            onChangeText={value => handleInputChange('studentEmail', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Batch Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Batch *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 2024, 2023"
                            value={formData.studentBatch}
                            onChangeText={value => handleInputChange('studentBatch', value)}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Course Name/Department Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Course Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Computer Science"
                            value={formData.studentDepartment}
                            onChangeText={value => handleInputChange('studentDepartment', value)}
                        />
                    </View>

                    {/* Gender Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Gender *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Male, Female"
                            value={formData.studentGender}
                            onChangeText={value => handleInputChange('studentGender', value)}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                Submit Registration
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// 🆕 Modal Styles
const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        width: '45%',
        borderRadius: 12,
        padding: 24,
        elevation: 10,
        alignItems: 'center',
    },
    modalIcon: {
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#212121',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        borderRadius: 8,
        paddingVertical: 12,
        width: '50%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#050404ff',
        fontSize: 16,
        fontWeight: '600',
    },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', marginTop: 3, marginBottom: 190 },
    content: { flex: 1, marginTop: -39 },
    formContainer: { padding: 20 },
    formTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 8 },
    formSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
    submitButton: { backgroundColor: '#075E54', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    submitButtonDisabled: { backgroundColor: '#ccc' },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default StudentSignupScreen;