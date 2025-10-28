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
import Ionicons from 'react-native-vector-icons/Ionicons'; // 👈 You'll need to install react-native-vector-icons
import { RootStackParamList } from '../navigation/types';

type AdminSignupScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'AdminSignInScreen'
>;

// 🆕 Define the structure for the modal content
interface AlertContent {
    isVisible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
    onClose: () => void;
}

// 🆕 Custom Modal Component to display alerts
const CustomAlertModal: React.FC<AlertContent> = ({ isVisible, title, message, type, onClose }) => {
    const iconName = type === 'success' ? 'checkmark-circle' : 'close-circle';
    const iconColor = type === 'success' ? '#d4d6d4ff' : '#d3d1d1ff'; // Green for success, Red for error/warning

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Ionicons name={iconName} size={60} color={"#363434ff"} style={{ marginBottom: 10 }} />
                    <Text style={modalStyles.modalTitle}>{title}</Text>
                    <Text style={modalStyles.modalText}>{message}</Text>
                    <TouchableOpacity
                        style={[modalStyles.button, modalStyles.buttonClose]}
                        onPress={onClose}
                    >
                        <Text style={modalStyles.textStyle}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const AdminSignupScreen = () => {
    const navigation = useNavigation<AdminSignupScreenNavigationProp>();

    const [formData, setFormData] = useState({
        mainAdminName: '',
        mainAdminEmail: '',
        mainAdminFatherName: '',
        mainAdminDepartment: '',
        mainAdminGender: '',
    });

    const [loading, setLoading] = useState(false);
    
    // 🆕 State for managing the custom modal
    const [alertContent, setAlertContent] = useState<AlertContent>({
        isVisible: false,
        title: '',
        message: '',
        type: 'success',
        onClose: () => {},
    });

    const showCustomAlert = (title: string, message: string, type: AlertContent['type'], callback?: () => void) => {
        setAlertContent({
            isVisible: true,
            title,
            message,
            type,
            onClose: () => {
                setAlertContent(prev => ({ ...prev, isVisible: false }));
                if (callback) {
                    callback();
                }
            },
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        const fields = [
            { key: 'mainAdminName', label: 'Name' },
            { key: 'mainAdminEmail', label: 'Email' },
            { key: 'mainAdminFatherName', label: 'Father Name' },
            { key: 'mainAdminDepartment', label: 'Department' },
            { key: 'mainAdminGender', label: 'Gender' },
        ];

        for (const field of fields) {
            if (!formData[field.key as keyof typeof formData].trim()) {
                // 🔄 Replaced Alert with custom Modal for validation
                showCustomAlert('Error', `${field.label} is required`, 'warning');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const API_URL = 'http://localhost:5200/web/main-admin/register';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            // ✅ Check for backend custom status
            if (result.status === -1) {
                // 🔄 Replaced Alert with custom Modal for backend error (e.g., email already registered)
                showCustomAlert('Submission Error', result.message || 'Submission failed. Email may already be registered.', 'error');
                return; // Stop execution if status -1
            }

            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit application');
            }

            // 🔄 Replaced Alert with custom Modal for SUCCESS
            showCustomAlert(
                'Success!',
                'Your application has been submitted for approval. Please proceed to login after approval.',
                'success',
                // Callback to navigate after the user presses OK on the modal
                () => navigation.navigate('AdminSignInScreen')
            );
        } catch (error: any) {
            // 🔄 Replaced Alert with custom Modal for general fetch/network error
            showCustomAlert(
                'Error',
                error.message || 'Something went wrong. Please try again later.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomAlertModal // 👈 Render the custom modal
                isVisible={alertContent.isVisible}
                title={alertContent.title}
                message={alertContent.message}
                type={alertContent.type}
                onClose={alertContent.onClose}
            />
            <ScrollView
                style={styles.content}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Admin Registration</Text>
                    <Text style={styles.formSubtitle}>
                        Fill in your details to register as an Admin
                    </Text>

                    {/* Form Fields... (Unchanged) */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            value={formData.mainAdminName}
                            onChangeText={value => handleInputChange('mainAdminName', value)}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* ... other fields ... */}
                    
                    {/* Email Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your Email"
                            value={formData.mainAdminEmail}
                            onChangeText={value => handleInputChange('mainAdminEmail', value)}
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
                            value={formData.mainAdminFatherName}
                            onChangeText={value =>
                                handleInputChange('mainAdminFatherName', value)
                            }
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Department Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Department *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Computer Science, Mathematics, etc."
                            value={formData.mainAdminDepartment}
                            onChangeText={value =>
                                handleInputChange('mainAdminDepartment', value)
                            }
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Gender Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Gender *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., male, female, etc."
                            value={formData.mainAdminGender}
                            onChangeText={value => handleInputChange('mainAdminGender', value)}
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
                            <Text style={styles.submitButtonText}>Submit Application</Text>
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

// 🆕 Styles for the Custom Alert Modal
const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '40%',
    },
    modalTitle: {
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 16,
        color: '#555',
    },
    button: {
        borderRadius: 8,
        padding: 10,
        elevation: 2,
        width: '50%',
        marginTop: 15,
    },
    buttonClose: {
        backgroundColor: '#e4cbcbff', // Purple color for OK button
    },
    textStyle: {
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});

const styles = StyleSheet.create({
    // ... (Your existing styles remain here)
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 3,
        marginBottom: 100,
        height: '100%',
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
    submitButtonDisabled: { backgroundColor: '#999' },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    infoText: {
        fontSize: 14,
        color: '#0f0e0eff',
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 20,
    },
});

export default AdminSignupScreen;  