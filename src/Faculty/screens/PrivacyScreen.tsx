import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import WebBackButton from '../components/WebBackButton';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <WebBackButton />
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 3D Card */}
        <View style={styles.card3D}>
          <Text style={styles.title}>📜 Privacy Policy for SJEST Chat App</Text>
          <Text style={styles.updateText}>Last Updated: 14 November 2025</Text>

          <Text style={styles.text}>
            SJEST Chat App (“we”, “us”, “our”) is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, store, and safeguard your personal 
            information when you use our mobile application and web version (“Service”).{"\n\n"}
            By installing or using the SJEST Chat App, you agree to the practices described in this policy.
          </Text>

          {/* Section 1 */}
          <Text style={styles.heading}>1️⃣ Information We Collect</Text>
          <Text style={styles.text}>
            We collect limited and necessary information to provide a smooth messaging experience.
            {"\n\n"}● Name{"\n"}● Email address{"\n"}● Phone number{"\n"}● Profile photo (optional){"\n"}
            ● Password (encrypted){"\n"}● Device info (model, OS, browser, IP){"\n"}● Chat messages, media, logs{"\n"}
            Important: We never read, scan, or monitor your personal chats. All chats are private.
          </Text>

          {/* Section 2 */}
          <Text style={styles.heading}>2️⃣ Why We Collect Your Data</Text>
          <Text style={styles.text}>
            ● Enable messaging between users{"\n"}
            ● Secure user login and authentication{"\n"}
            ● Sync messages across devices{"\n"}
            ● Improve app speed & performance{"\n"}
            ● Prevent misuse, spam, and fraud{"\n"}
            ● Deliver notifications{"\n"}
            ● Maintain chat history
          </Text>

          {/* Section 3 */}
          <Text style={styles.heading}>3️⃣ How Your Data Is Used</Text>
          <Text style={styles.text}>
            Your data is used strictly for account management, secure real-time communication, 
            storing chat history, backing up data, app improvements, and customer support. 
            We do NOT sell or trade your data with any company.
          </Text>

          {/* Section 4 */}
          <Text style={styles.heading}>4️⃣ Data Sharing</Text>
          <Text style={styles.text}>
            We share your data only with:{"\n"}
            ● Hosting providers{"\n"}
            ● Database services (Firebase / MongoDB){"\n"}
            ● Real-time messaging partners (Agora){"\n"}
            ● Law enforcement (ONLY if legally required){"\n\n"}
            We never share your private messages or files.
          </Text>

          {/* Section 5 */}
          <Text style={styles.heading}>5️⃣ Data Storage & Security</Text>
          <Text style={styles.text}>
            We use encrypted databases, HTTPS secure communication, token-based authentication, 
            firewalls, and continuous monitoring. Your password is fully encrypted and never exposed 
            to anyone, including our team.
          </Text>

          {/* Section 6 */}
          <Text style={styles.heading}>6️⃣ Children’s Privacy</Text>
          <Text style={styles.text}>
            SJEST Chat App is not intended for children under 13. We do not knowingly collect 
            information from children.
          </Text>

          {/* Section 7 */}
          <Text style={styles.heading}>7️⃣ User Rights</Text>
          <Text style={styles.text}>
            ● Access your account data{"\n"}
            ● Edit your profile{"\n"}
            ● Delete chat history{"\n"}
            ● Request full account deletion{"\n"}
            ● Disable notifications{"\n"}
            ● Withdraw consent anytime{"\n\n"}
            For deletion: privacy@sjestapp.com
          </Text>

          {/* Section 8 */}
          <Text style={styles.heading}>8️⃣ Permissions Required</Text>
          <Text style={styles.text}>
            ● Camera – taking photos{"\n"}
            ● Storage – uploading media{"\n"}
            ● Microphone – voice messages{"\n"}
            ● Notifications – message alerts{"\n"}
            ● Internet – chat connectivity{"\n\n"}
            We request only essential permissions.
          </Text>

          {/* Section 9 */}
          <Text style={styles.heading}>9️⃣ Third-Party Services</Text>
          <Text style={styles.text}>
            The app uses the following trusted platforms:{"\n"}
            ● Agora – Real-time messaging{"\n"}
            ● Firebase / MongoDB – Database & Auth{"\n"}
            ● Cloudinary / AWS – File uploads{"\n"}
            These services follow their own privacy policies.
          </Text>

          {/* Section 10 */}
          <Text style={styles.heading}>🔟 Changes to This Policy</Text>
          <Text style={styles.text}>
            We may update this policy from time to time. You will be notified for all major updates.
          </Text>

          {/* Section 11 */}
          <Text style={styles.heading}>1️⃣1️⃣ Contact Us</Text>
          <Text style={styles.text}>
            For any questions or concerns:{"\n"}
            📩 support@sjestapp.com{"\n"}
            📞 +91 98765 43210
          </Text>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E7F3F5' },

  header: {
    paddingTop: 45,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ebeeeeff',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 10,
  },

  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000000ff' },

  scrollContent: { padding: 18 },

  card3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#97AAB3',
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#DAE2E8',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#070a0aff',
    marginBottom: 8,
    textAlign: 'center',
  },

  updateText: {
    textAlign: 'center',
    color: '#000000ff',
    fontSize: 14,
    marginBottom: 16,
  },

  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#010202ff',
    marginTop: 16,
    marginBottom: 8,
  },

  text: {
    fontSize: 15,
    color: '#000000ff',
    lineHeight: 24,
  },
});
