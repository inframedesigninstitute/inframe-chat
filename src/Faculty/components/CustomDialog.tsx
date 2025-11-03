// src/components/CustomDialog.tsx
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface CustomDialogProps {
  visible: boolean;
  type?: "success" | "error" | "warning";
  title: string;
  message: string;
  onClose: () => void;
}

const iconMap = {
  success: { name: "checkmark-circle", color: "#4CAF50" },
  error: { name: "close-circle", color: "#F44336" },
  warning: { name: "warning", color: "#FF9800" },
};

export default function CustomDialog({ visible, type = "success", title, message, onClose }: CustomDialogProps) {
  const { name, color } = iconMap[type];
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons name={name} size={48} color={color} style={{ marginBottom: 10 }} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    padding: 20,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
