import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

type LanguageType = {
  code: string;
  label: string;
};

const LANGUAGES: LanguageType[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi (हिंदी)" },
  { code: "gu", label: "Gujarati (ગુજરાતી)" },
  { code: "mr", label: "Marathi (मराठी)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", label: "Malayalam (മലയാളം)" },
  { code: "pa", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "ur", label: "Urdu (اردو)" },
  { code: "ar", label: "Arabic (العربية)" },
  { code: "fr", label: "French (Français)" },
  { code: "es", label: "Spanish (Español)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "ru", label: "Russian (Русский)" },
  { code: "ja", label: "Japanese (日本語)" },
  { code: "ko", label: "Korean (한국어)" },
  { code: "zh", label: "Chinese (中文)" },
];

const LanguageScreen = () => {
  const [activeLanguage, setActiveLanguage] = useState<string>("en");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);

  const openModal = (code: string) => {
    setPendingLanguage(code);
    setModalVisible(true);
  };

  const confirmChange = () => {
    if (pendingLanguage) setActiveLanguage(pendingLanguage);
    setModalVisible(false);
    setPendingLanguage(null);
  };

  const cancelChange = () => {
    setModalVisible(false);
    setPendingLanguage(null);
  };

  const handleToggle = (code: string) => {
    // If the switch is already active, turn off → fallback to English
    if (activeLanguage === code) {
      setActiveLanguage("en");
      return;
    }
    openModal(code);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select App Language</Text>

      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => {
          const isActive = activeLanguage === item.code;
          return (
            <View style={[styles.languageRow, isActive && styles.activeRow]}>
              <Text style={[styles.languageText, isActive && styles.activeText]}>
                {item.label}
              </Text>
              <Switch
                value={isActive}
                onValueChange={() => handleToggle(item.code)}
              />
            </View>
          );
        }}
      />

      {/* Modal for confirmation */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={cancelChange}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Language Change</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to change the app language to "
              {LANGUAGES.find((l) => l.code === pendingLanguage)?.label}"?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={cancelChange}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.okButton]} onPress={confirmChange}>
                <Text style={styles.okText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F6FF",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#1A237E",
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeRow: {
    backgroundColor: "#1A237E",
  },
  languageText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
  activeText: {
    color: "#fff",
    fontWeight: "700",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "40%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  okButton: {
    backgroundColor: "#1A237E",
  },
  cancelText: { color: "#333", fontWeight: "600" },
  okText: { color: "#fff", fontWeight: "700" },
});
