import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { StarredMessage, useStarredMessages } from "../context/StarredMessagesContext";

const StarredMessagesScreen = () => {
  const navigation = useNavigation();
  const { starredMessages, removeStarredMessage } = useStarredMessages();

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return date.toLocaleDateString([], { weekday: "long" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleUnstar = (messageId: string) => {
    removeStarredMessage(messageId);
  };

  const handleMessagePress = (message: StarredMessage) => {
    Alert.alert(
      "Navigate to Chat",
      `Go to ${message.chatName} chat?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Go", onPress: () => console.log("Navigate to:", message.chatName) },
      ]
    );
  };

  const renderStarredMessage = ({ item }: { item: StarredMessage }) => (
    <TouchableOpacity style={styles.messageItem} onPress={() => handleMessagePress(item)}>
      <View style={styles.messageHeader}>
        <View>
          <Text style={styles.senderName}>{item.senderName}</Text>
          <Text style={styles.chatName}>{item.chatName}</Text>
        </View>
        <View style={styles.messageActions}>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          <TouchableOpacity style={styles.unstarButton} onPress={() => handleUnstar(item.id)}>
            <Ionicons name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.messageContent}>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#075E54" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Starred Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      {starredMessages.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No starred messages</Text>
        </View>
      ) : (
        <FlatList
          data={starredMessages}
          renderItem={renderStarredMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
        />
      )}
    </SafeAreaView>
  );
};

export default StarredMessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#075E54",
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#075E54",
  },
  chatName: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  messageActions: {
    alignItems: "flex-end",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginBottom: 4,
  },
  unstarButton: {
    padding: 4,
  },
  messageContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  messageText: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
});
