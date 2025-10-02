import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Switch,
} from "react-native";

const NotificationsScreen = () => {
  const [settings, setSettings] = useState([
    { id: "1", label: "Show notifications", value: true },
    { id: "2", label: "Show app icon badges", value: true },
    { id: "3", label: "Floating notifications", value: true },
    { id: "4", label: "Lock screen notifications", value: false },
    { id: "5", label: "Allow sound", value: true },
    { id: "6", label: "Allow vibration", value: true },
    { id: "7", label: "Allow using LED light", value: true },
  ]);

  const toggleSwitch = (id: string) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, value: !item.value } : item
      )
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <Text style={styles.name}>{item.label}</Text>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={item.value ? "#25D366" : "#f4f3f4"}
        onValueChange={() => toggleSwitch(item.id)}
        value={item.value}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={settings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", marginTop:35 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1, 
    borderColor: "#eee",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  name: { fontSize: 16, color: "#000" },
});
