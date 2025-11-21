"use client"

import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import { type CompositeNavigationProp, useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useState } from "react"
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import WebBackButton from "../components/WebBackButton"
import LeftSidebarNav from "../navigation/LeftSidebar"
import type { MainTabsParamList, RootStackParamList } from "../navigation/types"

type CallsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, "Calls">,
  NativeStackNavigationProp<RootStackParamList>
>

type Call = {
  id: string
  name: string
  time: string
  type: "incoming" | "outgoing" | "missed"
  callType: "voice" | "video"
  duration?: string
  avatar: string
}

type CallHistory = {
  id: string
  timestamp: string
  date: string
  type: "incoming" | "outgoing" | "missed"
  callType: "voice" | "video"
  duration: string
}

const initialCalls: Call[] = [
  {
    id: "1",
    name: "Richard",
    time: "06:38 PM",
    type: "missed",
    callType: "voice",
    duration: "0s",
    avatar: "https://via.placeholder.com/40",
  },
  {
    id: "2",
    name: "Charlotte",
    time: "06:34 PM",
    type: "incoming",
    callType: "voice",
    duration: "0s",
    avatar: "https://via.placeholder.com/40",
  },
  {
    id: "3",
    name: "Charlotte",
    time: "06:32 PM",
    type: "missed",
    callType: "voice",
    duration: "0s",
    avatar: "https://via.placeholder.com/40",
  },
  {
    id: "4",
    name: "Richard",
    time: "06:37 PM",
    type: "incoming",
    callType: "voice",
    duration: "2:15",
    avatar: "https://via.placeholder.com/40",
  },
  {
    id: "5",
    name: "Charlotte",
    time: "06:24 PM",
    type: "missed",
    callType: "voice",
    duration: "0s",
    avatar: "https://via.placeholder.com/40",
  },
  {
    id: "6",
    name: "Charlotte",
    time: "06:08 PM",
    type: "incoming",
    callType: "voice",
    duration: "1:30",
    avatar: "https://via.placeholder.com/40",
  },
]

const callHistoryData: { [key: string]: CallHistory[] } = {
  "1": [
    // Richard
    { id: "h1", timestamp: "06:38 PM", date: "Today", type: "missed", callType: "voice", duration: "0s" },
    { id: "h2", timestamp: "03:15 PM", date: "Today", type: "outgoing", callType: "video", duration: "5:42" },
    { id: "h3", timestamp: "Yesterday", date: "11:20 AM", type: "incoming", callType: "voice", duration: "2:15" },
    { id: "h4", timestamp: "Nov 18", date: "08:30 PM", type: "incoming", callType: "video", duration: "10:05" },
  ],
  "2": [
    // Charlotte
    { id: "h5", timestamp: "06:34 PM", date: "Today", type: "incoming", callType: "voice", duration: "0s" },
    { id: "h6", timestamp: "05:10 PM", date: "Today", type: "outgoing", callType: "video", duration: "3:28" },
    { id: "h7", timestamp: "02:45 PM", date: "Today", type: "missed", callType: "voice", duration: "0s" },
    { id: "h8", timestamp: "Yesterday", date: "09:15 AM", type: "incoming", callType: "video", duration: "8:30" },
    { id: "h9", timestamp: "Nov 17", date: "07:20 PM", type: "outgoing", callType: "voice", duration: "4:15" },
  ],
}

const CallsScreen = () => {
  const navigation = useNavigation<CallsNavigationProp>()
  const [calls] = useState(initialCalls)
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)

  const handleCallSelect = (call: Call) => {
    setSelectedCall(call)
  }

  const handleAudioCall = () => {
    if (selectedCall) {
      navigation.navigate("AudioCall", {
        contactName: selectedCall.name,
        contactNumber: selectedCall.id,
      })
    }
  }

  const handleVideoCall = () => {
    if (selectedCall) {
      navigation.navigate("VideoCall", {
        contactName: selectedCall.name,
        contactNumber: selectedCall.id,
      })
    }
  }

  const getCallHistory = (): CallHistory[] => {
    if (!selectedCall) return []
    return callHistoryData[selectedCall.id] || []
  }

  const renderCallHistoryItem = (item: CallHistory) => {
    const isIncoming = item.type === "incoming"
    const isOutgoing = item.type === "outgoing"
    const isMissed = item.type === "missed"
    const isVideo = item.callType === "video"

    return (
      <View key={item.id} style={styles.historyEntry}>
        <View style={styles.historyIconContainer}>
          <View style={[styles.historyIcon, isMissed && styles.missedIcon, isVideo && styles.videoIcon]}>
            <Ionicons
              name={
                isVideo
                  ? isMissed
                    ? "videocam-off"
                    : "videocam"
                  : isMissed
                    ? "call"
                    : isIncoming
                      ? "call-received"
                      : "call-made"
              }
              size={14}
              color={isMissed ? "#ff4444" : isVideo ? "#8e24aa" : isIncoming ? "#4CAF50" : "#2196F3"}
            />
          </View>
        </View>

        <View style={styles.historyDetails}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyType}>
              {isVideo ? "📹" : "📞"} {isIncoming ? "Incoming" : isOutgoing ? "Outgoing" : "Missed"} call
            </Text>
            <Text style={styles.historyDuration}>{item.duration}</Text>
          </View>
          <Text style={styles.historyTime}>{item.timestamp}</Text>
        </View>
      </View>
    )
  }

  const callHistory = getCallHistory()

  return (
    <View style={styles.container}>
      {/* Left Sidebar */}
      <View style={styles.leftSidebar}>
        <LeftSidebarNav active={"Calls"} />
      </View>

      {/* Middle Panel - Calls List */}
      <View style={styles.callsList}>
        <View style={styles.callsHeader}>
          <WebBackButton />
          <Text style={styles.callsTitle}>Calls</Text>
        </View>

        <FlatList
          data={calls}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.callItem, selectedCall?.id === item.id && styles.selectedCallItem]}
              onPress={() => handleCallSelect(item)}
            >
              <Image source={{ uri: item.avatar }} style={styles.callAvatar} />
              <View style={styles.callInfo}>
                <Text style={[styles.callName, item.type === "missed" && styles.missedCallName]}>{item.name}</Text>
                <View style={styles.callStatusRow}>
                  <Ionicons
                    name={item.type === "missed" ? "call" : "call-received"}
                    size={14}
                    color={item.type === "missed" ? "#ff4444" : "#666"}
                  />
                  <Text style={styles.callStatus}>{item.type === "missed" ? "Missed call" : "Incoming call"}</Text>
                </View>
              </View>
              <View style={styles.callMeta}>
                <Text style={styles.callTime}>{item.time}</Text>
                <TouchableOpacity style={styles.infoButton}>
                  <Ionicons name="information-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Right Panel - Call Detail with History */}
      <View style={styles.callDetail}>
        {selectedCall ? (
          <>
            {/* Contact Info */}
            <View style={styles.contactInfo}>
              <Image source={{ uri: selectedCall.avatar }} style={styles.detailAvatar} />
              <Text style={styles.detailName}>{selectedCall.name}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleAudioCall}>
                <Ionicons name="call" size={20} color="#8e24aa" />
                <Text style={styles.actionButtonText}>Audio call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleVideoCall}>
                <Ionicons name="videocam" size={20} color="#8e24aa" />
                <Text style={styles.actionButtonText}>Video call</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.callHistorySection}>
              <Text style={styles.historyTitle}>Call History</Text>
              <ScrollView style={styles.historyScroll}>
                {callHistory.length > 0 ? (
                  callHistory.map(renderCallHistoryItem)
                ) : (
                  <View style={styles.emptyHistory}>
                    <Text style={styles.emptyHistoryText}>No call history</Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Expandable Sections */}
            <View style={styles.expandableSections}>
              <TouchableOpacity style={styles.expandableSection}>
                <Text style={styles.sectionText}>Participants</Text>
                <Text style={styles.sectionValue}>2 {">"}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyDetail}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/893/893292.png" }} />
            <Text style={styles.emptyDetailText}>Select a call to view details</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default CallsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    alignItems: "stretch",
  },
  leftSidebar: {
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  callsList: {
    width: 600,
    maxWidth: 450,
    minWidth: 260,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  callsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginTop: 0,
  },
  callsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000ff",
    alignSelf: "center",
    marginTop: -35,
    marginRight: 280,
  },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedCallItem: {
    backgroundColor: "#e1bee7",
  },
  callAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000ff",
    marginBottom: 4,
  },
  missedCallName: {
    color: "#000000ff",
  },
  callStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  callStatus: {
    fontSize: 12,
    color: "#000000ff",
    marginLeft: 4,
  },
  callMeta: {
    alignItems: "flex-end",
  },
  callTime: {
    fontSize: 12,
    color: "#000000ff",
    marginBottom: 4,
  },
  infoButton: {
    padding: 4,
  },
  callDetail: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#fdfdfdff",
  },
  backButton: {
    marginRight: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000ff",
  },
  contactInfo: {
    alignItems: "center",
    padding: 16,
  },
  detailAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  detailName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000ff",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  actionButton: {
    backgroundColor: "#ffffffff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#000000ff",
    marginLeft: 6,
    fontWeight: "500",
  },
  callHistorySection: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000ff",
    marginBottom: 12,
  },
  historyScroll: {
    flex: 1,
  },
  historyEntry: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  historyIconContainer: {
    marginRight: 12,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  missedIcon: {
    backgroundColor: "#ffebee",
  },
  videoIcon: {
    backgroundColor: "#f3e5f5",
  },
  historyDetails: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyType: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000000ff",
  },
  historyDuration: {
    fontSize: 12,
    color: "#999999ff",
    fontWeight: "500",
  },
  historyTime: {
    fontSize: 12,
    color: "#999999ff",
  },
  emptyHistory: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: "#999999ff",
  },
  expandableSections: {
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  expandableSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#d1c4e9",
  },
  sectionText: {
    fontSize: 14,
    color: "#000000ff",
    fontWeight: "500",
  },
  sectionValue: {
    fontSize: 14,
    color: "#000000ff",
  },
  emptyDetail: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyDetailText: {
    fontSize: 16,
    color: "#000000ff",
  },
})
