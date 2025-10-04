"use client"

import { useMemo, useState } from "react"
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

type Channel = {
  id: string
  name: string
  lastMessage?: string
}

type Message = {
  id: string
  fromSelf: boolean
  text: string
  time: string
}

export default function ChatThread({
  channel,
  onOpenProfile,
}: {
  channel: Channel
  onOpenProfile: () => void
}) {
  const [input, setInput] = useState("")
  const messages = useMemo<Message[]>(
    () => [
      { id: "m1", fromSelf: false, text: "Hi there! Do you have a moment?", time: "Today" },
      { id: "m2", fromSelf: true, text: "Sure, how can I help you?", time: "12:05 pm" },
      { id: "m3", fromSelf: false, text: "I am facing slow internet speed.", time: "12:06 pm" },
      { id: "m4", fromSelf: true, text: "I will create a support ticket for you.", time: "12:08 pm" },
    ],
    [channel?.id],
  )

  return (
    <View style={styles.container}>
      {/* Header: clicking user opens profile (right panel) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onOpenProfile} style={styles.userWrap}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{channel?.name || "User"}</Text>
            <Text style={styles.userSub}>Online</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <Ionicons name="call-outline" size={18} color="#4b5563" />
          <Ionicons name="videocam-outline" size={18} color="#4b5563" />
          <Ionicons name="information-circle-outline" size={18} color="#4b5563" />
        </View>
      </View>

      {/* Messages */}
      <FlatList
        contentContainerStyle={styles.messages}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.fromSelf ? styles.bubbleSelf : styles.bubbleOther]}>
            <Text style={item.fromSelf ? styles.bubbleTextSelf : styles.bubbleTextOther}>{item.text}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />

      {/* Composer */}
      <View style={styles.composer}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="add-circle-outline" size={20} color="#2563eb" />
        </TouchableOpacity>
        <TextInput placeholder="Type a message" value={input} onChangeText={setInput} style={styles.input} />
        <TouchableOpacity style={styles.sendBtn}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: "#d1d5db",
  },
  userName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  userSub: { fontSize: 12, color: "#6b7280" },
  headerActions: { flexDirection: "row", gap: 12 },

  messages: { padding: 16, gap: 8 },
  bubble: {
    maxWidth: "78%",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  bubbleOther: {
    alignSelf: "flex-start",
    backgroundColor: "#e5f0ff",
  },
  bubbleSelf: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
  },
  bubbleTextOther: { color: "#1f2937", fontSize: 14 },
  bubbleTextSelf: { color: "#ffffff", fontSize: 14 },
  time: { fontSize: 10, color: "#6b7280", marginTop: 4 },

  composer: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: { padding: 4 },
  input: {
    flex: 1,
    fontSize: 14,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#111827",
  },
  sendBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sendBtnText: { color: "#ffffff", fontWeight: "600" },
})
