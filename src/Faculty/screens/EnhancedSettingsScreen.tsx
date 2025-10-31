"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type React from "react"

import { useState } from "react"

import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import WebBackButton from "../components/WebBackButton"
import { useUser } from "../context/UserContext"
import LeftSidebarNav from "../navigation/LeftSidebar"
import type { RootStackParamList } from "../navigation/types"
import CalendarScreen from "./CalendarScreen"
import CoursesScreen from "./CoursesScreen"
import HelpScreen from "./HelpScreen"
import NotificationsScreen from "./NotificationsScreen"
import PrivacyScreen from "./PrivacyScreen"
import ProfileScreen from "./ProfileScreen"
import StarredMessagesScreen from "./StarredMessagesScreen"
import StatusScreen from "./StatusScreen"
import TermsScreen from "./TermsScreen"

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, "Settings">

const EnhancedSettingsScreen = () => {
  const navigation = useNavigation<SettingsNavigationProp>()
  const { user, setUser } = useUser()

  const [selectedSetting, setSelectedSetting] = useState<string | null>(null)

  const handleEditPicture = () => {
    Alert.alert("Edit Picture", "Picture editing functionality will be implemented")
  }

  const handleChatTheme = () => {
    Alert.alert("Chat Theme", "Choose your chat theme", [
      { text: "Default", onPress: () => setSelectedSetting("Chats") },
      { text: "Dark", onPress: () => setSelectedSetting("Chats") },
      { text: "Blue", onPress: () => setSelectedSetting("Chats") },
      { text: "Green", onPress: () => setSelectedSetting("Chats") },
    ])
  }

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    icon: string
    title: string
    subtitle?: string
    onPress?: () => void
    rightElement?: React.ReactNode
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, selectedSetting === title && styles.selectedSettingItem]}
      onPress={() => {
        console.log("[v0] SettingItem clicked:", title)
        setSelectedSetting(title)
        onPress?.()
      }}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={22} color="#0B5E55" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={18} color="#9AA0A6" />}
    </TouchableOpacity>
  )

  const renderSettingDetail = () => {
    if (!selectedSetting) {
      return (
        <View style={styles.emptyDetail}>
          <Text style={styles.emptyDetailText}>Select a setting to view details</Text>
        </View>
      )
    }

    switch (selectedSetting) {
      case "Profile":
      case "Account":
        return <ProfileScreen />
      case "Privacy":
        return <PrivacyScreen />
      case "Chats":
        return <StatusScreen />
      case "Notifications":
        return <NotificationsScreen />
      case "Starred Messages":
        return <StarredMessagesScreen />
      case "Help":
        return <HelpScreen />
      case "Keyboard shortcuts":
        return (
          <View style={styles.emptyDetail}>
            <Text style={styles.detailContent}>Keyboard shortcuts coming soon.</Text>
          </View>
        )
      case "Calendar":
        return <CalendarScreen />
      case "Starred":
        return <StarredMessagesScreen/>
      case "Alumnus App":
        return (
          <View style={styles.emptyDetail}>
            <Text style={styles.detailContent}>Alumni features coming soon.</Text>
          </View>
        )
      case "Admin Dashboard":
        return (
          <View style={styles.emptyDetail}>
            <Text style={styles.detailContent}>Admin dashboard coming soon.</Text>
          </View>
        )
      case "Terms and condisanal":
        return <TermsScreen />
      case "App inif":
        return (
          <View style={styles.emptyDetail}>
            <Text style={styles.detailContent}>App info coming soon.</Text>
          </View>
        )
      case "My Couses":
        return <CoursesScreen />
      default:
        return (
          <View style={styles.emptyDetail}>
            <Text style={styles.detailContent}>"{selectedSetting}" screen is not implemented yet.</Text>
          </View>
        )
    }
  }

  return (
    <View style={styles.container}>
      {/* Left Sidebar */}
      <View style={styles.leftSidebar}>
        <LeftSidebarNav active="Settings" />
      </View>

      <SafeAreaView style={styles.root}>
        {/* Left panel */}
        <View style={styles.leftPane}>
          <View style={styles.leftHeader}>
            <View style={styles.headerRow}>
              <WebBackButton />
              <Text style={styles.headerTitle}>Settings</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color="#9AA0A6" />
              <TextInput placeholder="Search settings" placeholderTextColor="#9AA0A6" style={styles.searchInput} />
            </View>
          </View>

          <ScrollView style={styles.leftScroll} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Profile */}
            <TouchableOpacity
              style={styles.profileRow}
              activeOpacity={0.8}
              onPress={() => setSelectedSetting("Profile")}
            >
              <View style={styles.profileImageContainer}>
                <Image
                  source={
                    user?.profilePicture ? { uri: user.profilePicture } : require("../../assets/inframe-logo.jpg")
                  }
                  style={styles.profileImage}
                />
                <TouchableOpacity style={styles.editImageButton} onPress={handleEditPicture}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || "Your Name"}</Text>
                <Text style={styles.profileStatus}>Available</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.separator} />

            <SettingItem icon="person-circle" title="Account" subtitle="Security notifications, account info" />
            <SettingItem icon="lock-closed" title="Privacy" subtitle="Blocked contacts, disappearing messages" />
            <SettingItem
              icon="chatbox-ellipses"
              title="Chats"
              subtitle="Theme, wallpaper, chat settings"
              onPress={handleChatTheme}
            />
            <SettingItem icon="notifications" title="Notifications" subtitle="Message notifications" />
            <SettingItem icon="keypad" title="Keyboard shortcuts" subtitle="Quick actions" />
            <SettingItem icon="help-circle" title="Help" subtitle="Help center, contact us, privacy policy" />
            <SettingItem icon="star" title="Starred Messages" subtitle="Important messages you've starred" />
            <SettingItem icon="calendar" title="Calendar" subtitle="View and manage your schedule" />
            <SettingItem icon="Starred" title="Starred" subtitle="Connect to institutional ERP system" />
            <SettingItem icon="people-circle" title="Alumnus App" subtitle="Connect with alumni network" />
            {user?.role === "admin" && (
              <SettingItem icon="settings" title="Admin Dashboard" subtitle="Manage approvals & settings" />
            )}

          <View style={{ marginTop: 12 }}>
  <TouchableOpacity
    style={styles.logoutButton}
    activeOpacity={0.85}
    onPress={async () => {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // 🧹 Clear token and user data
              await AsyncStorage.removeItem("TOKEN");
              setUser(null);

              // 🔁 Navigate to TeacherLogin
              navigation.reset({
                index: 0,
                routes: [{ name: "TeacherLogin" as never }],
              });

              console.log("✅ Successfully logged out and navigated to TeacherLogin");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout, please try again.");
            }
          },
        },
      ]);
    }}
  >
    <Ionicons name="log-out" size={22} color="#E53935" />
    <Text style={styles.logoutText}>Log out</Text>
  </TouchableOpacity>
</View>

          </ScrollView>
        </View>

        {/* Right panel */}
        <View style={styles.rightPane}>
          <View style={styles.rightPaneContent}>{renderSettingDetail()}</View>
        </View>
      </SafeAreaView>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  leftSidebar: {
    width: 90,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
  },
  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F3F2EF",
  },
  leftPane: {
    width: 600,
    maxWidth: 450,
    minWidth: 260,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E6E6E6",
  },
  leftHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 6,
  },
  leftScroll: {
    backgroundColor: "#FFFFFF",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0B5E55",
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  profileStatus: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  separator: {
    height: 1,
    backgroundColor: "#EFEFEF",
    marginHorizontal: 16,
    marginVertical: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F5",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F4F5F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: { flex: 1 },
  settingTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#F4F4F5",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E53935",
  },
  rightPane: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  rightPaneContent: {
    flex: 1,
    alignSelf: "stretch",
    width: "100%",
  },
  selectedSettingItem: {
    backgroundColor: "#F0F8FF",
  },
  emptyDetail: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyDetailText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  detailContent: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
})

export default EnhancedSettingsScreen
