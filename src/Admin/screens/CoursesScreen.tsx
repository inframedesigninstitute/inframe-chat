import React from "react";
import {
  Alert,
  FlatList,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import WebBackButton from "../components/WebBackButton";

const data = [
  { id: "c1", name: "Fashion Design", link: "https://www.google.com" },
  { id: "c2", name: "Fine Arts", link: "https://www.inframeschool.com/fine-arts" },
  { id: "c3", name: "Interior Design", link: "https://www.inframeschool.com/interior-design" },
  { id: "c4", name: "Media & Entertainment", link: "https://www.inframeschool.com/media-entertainment" },
  { id: "c5", name: "Entrepreneurship Skills", link: "https://www.inframeschool.com/entrepreneurship-skills" },
  { id: "c6", name: "UI/UX Design", link: "https://www.inframeschool.com/ui-ux-design" },
  { id: "c7", name: "Digital Marketing", link: "https://www.inframeschool.com/digital-marketing" },
  { id: "c8", name: "Advertising & Marketing", link: "https://www.inframeschool.com/advertising-marketing" },
  { id: "c9", name: "Interior Design Course In Delhi", link: "https://www.inframeschool.com/interior-design-delhi" },
  { id: "c10", name: "Interior Design Course In Mumbai", link: "https://www.inframeschool.com/interior-design-mumbai" },
];

const CoursesScreen = () => {
  const openCourseLink = async (link: string) => {
    try {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        await Linking.openURL(link);
      } else {
        Alert.alert("Error", "Cannot open the link: " + link);
      }
    } catch (error) {
      console.log("Linking error:", error);
      Alert.alert("Error", "Failed to open link.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:12 }}>
        <WebBackButton />
        <Text style={styles.title}>My Courses</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => openCourseLink(item.link)}
          >
            <View>
              <Text style={styles.name}>{item.name}</Text>
            </View>
            <Text style={styles.link}>View</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
};

export default CoursesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", marginTop: 35 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginVertical: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#000" },
  link: { color: "#075E54", fontWeight: "700" },
});