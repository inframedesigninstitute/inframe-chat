// MessageOptionsModal.tsx
"use client";

import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface MessageOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onReply: () => void;
  onCopy: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onStar: () => void;
  onDelete: () => void;
  isPinned: boolean;
}

export default function MessageOptionsModal({
  visible,
  onClose,
  onReply,
  onCopy,
  onPin,
  onUnpin,
  onStar,
  onDelete,
  isPinned,
}: MessageOptionsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.option} onPress={onReply}>
            <Ionicons name="chatbubble-outline" size={20} />
            <Text style={styles.optionText}>Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onCopy}>
            <Ionicons name="copy-outline" size={20} />
            <Text style={styles.optionText}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={isPinned ? onUnpin : onPin}>
            <Ionicons name={isPinned ? "pin-outline" : "pin"} size={20} />
            <Text style={styles.optionText}>{isPinned ? "Unpin" : "Pin"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onStar}>
            <Ionicons name="star-outline" size={20} />
            <Text style={styles.optionText}>Star</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color="red" />
            <Text style={[styles.optionText, { color: "red" }]}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onClose}>
            <Text style={[styles.optionText, { fontWeight: "bold" }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
  modalContainer: {
    width: 250,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
});
