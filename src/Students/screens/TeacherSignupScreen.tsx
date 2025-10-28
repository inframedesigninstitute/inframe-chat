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

type TeacherSignupScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'TeacherSignup'
>;

// 🆕 Custom Error/Warning Modal Component
const CustomAlertModal: React.FC<{
    isVisible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    // Optional: for navigating on OK press (e.g., after success or serious failure)
    onPressOk?: () => void;
}> = ({ isVisible, title, message, onClose, onPressOk }) => {
    const isSuccess = title.includes('Success') || title.includes('Submitted');
    const isError = title.includes('Error') || title.includes('Failed');

    const iconName = isSuccess ? 'checkmark-circle' : (isError ? 'close-circle' : 'warning');
    const iconColor = isSuccess ? '#c8c9c8ff' : (isError ? '#d1d0d0ff' : '#cac9c8ff'); // Default to orange for warnings

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
                    <Ionicons name={iconName} size={40} color={"#000"} style={modalStyles.modalIcon} />
                    <Text style={modalStyles.modalTitle}>{title}</Text>
                    <Text style={modalStyles.modalSubtitle}>{message}</Text>
                    <TouchableOpacity style={[modalStyles.modalButton, { backgroundColor: iconColor }]} onPress={handleClose}>
                        <Text style={modalStyles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const TeacherSignupScreen = () => {
    const navigation = useNavigation<TeacherSignupScreenNavigationProp>();
    const [formData, setFormData] = useState({
        facultyName: '',
        facultyEmail: '',
        facultyFatherName: '',
        facultyDepartment: '',
        facultyGender: '',
    });
    const [loading, setLoading] = useState(false);

    // 🆕 State for managing the custom modal
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    const [onAlertOkPress, setOnAlertOkPress] = useState<(() => void) | undefined>(undefined);


    // 🆕 Helper Function to show the custom modal
    const showCustomAlert = (title: string, message: string, onOkPress?: () => void): false => {
        setAlertTitle(title);
        setAlertMessage(message);
        setOnAlertOkPress(() => onOkPress);
        setShowAlertModal(true);
        return false; // Used to stop execution in validation checks
    };


    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = (): boolean => {
        // 🔄 Replaced Alert.alert with showCustomAlert
        if (!formData.facultyName.trim()) return showCustomAlert('Error', 'Name is required');
        if (!formData.facultyEmail.trim()) return showCustomAlert('Error', 'Email is required');
        if (!formData.facultyFatherName.trim()) return showCustomAlert('Error', 'Father Name is required');
        if (!formData.facultyDepartment.trim()) return showCustomAlert('Error', 'Department is required');
        if (!formData.facultyGender.trim()) return showCustomAlert('Error', 'Gender is required');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const facultyData = formData;

        setLoading(true);
        try {
            const API_URL = 'http://localhost:5200/web/faculty/register';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(facultyData),
            });

            const result = await response.json();

            // Handle non-200 responses (e.g., 400 Bad Request, duplicate email)
            if (!response.ok) {
                throw new Error(result?.message || 'Faculty Already registered wait for the approval.');
            }

            // Success - 🔄 Replaced Alert.alert with CustomAlertModal
            showCustomAlert(
                'Application Submitted 🎉',
                'Your application has been submitted for approval. Admin will review and approve your account. Please proceed to login after approval.',
                () => navigation.navigate('Login') // Navigate on OK press
            );
            
            // Clear form data on successful submission
            setFormData({ facultyName: '', facultyEmail: '', facultyFatherName: '', facultyDepartment: '', facultyGender: '' });
            
        } catch (error: any) {
            console.error('Registration Error:', error);
            
            // Failure - 🔄 Replaced Alert.alert with CustomAlertModal
            showCustomAlert(
                'Submission Failed ❌',
                error.message || 'Faculty Already registered wait for the approval'
            );
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomAlertModal
                isVisible={showAlertModal}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setShowAlertModal(false)}
                onPressOk={onAlertOkPress}
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Teacher Registration</Text>
                    <Text style={styles.formSubtitle}>
                        Fill in your details to register as a teacher
                    </Text>

                    {/* Name Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            value={formData.facultyName}
                            onChangeText={value => handleInputChange('facultyName', value)}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your Email"
                            value={formData.facultyEmail}
                            onChangeText={value => handleInputChange('facultyEmail', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Father Name Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Father Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your father's name"
                            value={formData.facultyFatherName}
                            onChangeText={value => handleInputChange('facultyFatherName', value)}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Department Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Department *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Computer Science, Mathematics, etc."
                            value={formData.facultyDepartment}
                            onChangeText={value => handleInputChange('facultyDepartment', value)}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Gender Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Gender *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., male, female, etc."
                            value={formData.facultyGender}
                            onChangeText={value => handleInputChange('facultyGender', value)}
                            autoCapitalize="words"
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
                                Submit Application
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Info Text */}
                    <Text style={styles.infoText}>
                        Your application will be reviewed by admin. You will receive an email
                        with login credentials after approval.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// 🆕 Modal Styles (Reused from previous components for consistency)
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
        alignItems: 'center',  backgroundColor:"#e0dedeff"

    },
    modalButtonText: {
        color: '#020101ff',
        fontSize: 16,
        fontWeight: '600',
    },
});


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 3,
        marginBottom: 0, // Adjusted this back to 0 or remove it if not needed
        // height: '100%', // Removed as flex: 1 handles it
    },
    content: {
        flex: 1,
    },
    formContainer: { padding: 20 },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 16,
        color: '#0e0c0cff',
        textAlign: 'center',
        marginBottom: 32,
    },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    submitButton: {
        backgroundColor: '#0a0c0cff',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: { backgroundColor: '#ccc' },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    infoText: {
        fontSize: 14,
        color: '#0f0e0eff',
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 20,
    },
});

export default TeacherSignupScreen;