import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';

type HelpNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Help'>;

const EnhancedHelpScreen = () => {
  const navigation = useNavigation<HelpNavigationProp>();

  const handleEmailPress = (email: string, subject: string) => {
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open email app');
    });
  };

  const HelpItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress,
    email 
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress?: () => void;
    email?: string;
  }) => (
    <TouchableOpacity style={styles.helpItem} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={24} color="#075E54" />
      </View>
      <View style={styles.helpContent}>
        <Text style={styles.helpTitle}>{title}</Text>
        <Text style={styles.helpSubtitle}>{subtitle}</Text>
        {email && <Text style={styles.helpEmail}>{email}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#075E54" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Support Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          
          <HelpItem
            icon="mail"
            title="General Support"
            subtitle="For general queries and technical support"
            email=" info@inframeschool.com"
            onPress={() => handleEmailPress('info@inframeschool.com', 'General Support Query')}
          />
          
          <HelpItem
            icon="shield-checkmark"
            title="Admin Support"
            subtitle="For administrative issues and account problems"
            email=" info@inframeschool.com"
            onPress={() => handleEmailPress(' info@inframeschool.com', 'Admin Support Request')}
          />
          
          <HelpItem
            icon="school"
            title="Faculty Support"
            subtitle="For academic guidance and course-related queries"
            email="webside"
            onPress={() => handleEmailPress('https://www.inframeschool.com/', 'Faculty Support Request')}
          />
        </View>

        {/* Quick Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I send files?</Text>
            <Text style={styles.faqAnswer}>
              Tap the attachment icon in the chat, then select Document, Camera, or Gallery. 
              Students can only send files to faculty members. File size limit is 10GB.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Why can't I message other students?</Text>
            <Text style={styles.faqAnswer}>
              For academic purposes, students can only communicate with faculty members and admins. 
              Faculty can message both students and other faculty.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How long are files stored?</Text>
            <Text style={styles.faqAnswer}>
              Files are automatically deleted after 3 months. You'll see a warning 
              when files are about to expire.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I create groups?</Text>
            <Text style={styles.faqAnswer}>
              Only faculty members can create and manage groups. Students can 
              participate in groups they're added to.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How does approval work?</Text>
            <Text style={styles.faqAnswer}>
              After registration, admin approval is required. You'll receive login 
              credentials via email within 4 hours of approval.
            </Text>
          </View>
        </View>

        {/* App Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Features</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles" size={20} color="#075E54" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Role-Based Messaging</Text>
              <Text style={styles.featureDesc}>Students ↔ Faculty communication with file sharing up to 10GB</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="call" size={20} color="#075E54" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Voice & Video Calls</Text>
              <Text style={styles.featureDesc}>High-quality calls between students and faculty only</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="people" size={20} color="#075E54" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Group Management</Text>
              <Text style={styles.featureDesc}>Faculty-managed groups for classes, activities, and subjects</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="camera" size={20} color="#075E54" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Document Scanning</Text>
              <Text style={styles.featureDesc}>Capture and compress documents directly from camera</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={20} color="#075E54" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Secure & Private</Text>
              <Text style={styles.featureDesc}>Admin approval system and automatic file cleanup</Text>
            </View>
          </View>
        </View>

        {/* Legal */}
     
        {/* Emergency Contact */}
        {/* <View style={styles.emergencySection}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="warning" size={24} color="#FF3B30" />
            <Text style={styles.emergencyTitle}>Emergency Contact</Text>
          </View>
          <Text style={styles.emergencyText}>
            For urgent technical issues that prevent access to academic resources:
          </Text>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => handleEmailPress('emergency@inframe.edu', 'URGENT: Emergency Support Needed')}
          >
            <Text style={styles.emergencyButtonText}>Contact Emergency Support</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#075E54',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#075E54',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  helpEmail: {
    fontSize: 12,
    color: '#075E54',
    fontWeight: '500',
  },
  faqItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  featureText: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: '#666',
  },
  emergencySection: {
    backgroundColor: '#FFF5F5',
    marginVertical: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EnhancedHelpScreen;
