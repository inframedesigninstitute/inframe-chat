import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ImageLibraryOptions, launchImageLibrary } from "react-native-image-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootStackParamList } from "../navigation/types";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userName] = useState("Vikram Choudhary (You)");
  const [mediaCount] = useState(28);
  const [profileImage, setProfileImage] = useState(
    "https://i.pravatar.cc/200?img=1"
  );

  const links = [
    "https://google.com",
    "https://facebook.com",
    "https://twitter.com",
    "https://github.com",
    "https://linkedin.com"
  ];

  const [randomLink, setRandomLink] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * links.length);
    setRandomLink(links[randomIndex]);
  }, []);

  const media = [
    { id: "1", uri: "https://media.istockphoto.com/id/1485546774/photo/bald-man-smiling-at-camera-standing-with-arms-crossed.jpg?s=1024x1024&w=is&k=20&c=zvw6qDmYHmIvvCbEn2ZUF0tdSbKPnEWRsVAzd9g4hCM=" },
    { id: "2", uri: "https://thumbs.dreamstime.com/b/walk-along-sea-walking-man-scanning-people-s-body-temperature-thermal-imager-blurred-anonymous-people-walking-man-219546134.jpg" },
    { id: "3", uri: "https://media.istockphoto.com/id/1485546774/photo/bald-man-smiling-at-camera-standing-with-arms-crossed.jpg?s=1024x1024&w=is&k=20&c=zvw6qDmYHmIvvCbEn2ZUF0tdSbKPnEWRsVAzd9g4hCM=" },
    { id: "4", uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSxUfrJ2ZZFfFxoH2yKES1rN_d6D261chXew&s" },
    { id: "5", uri: "https://placekitten.com/104/100" },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const selectProfileImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", response.errorMessage || "Something went wrong");
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0].uri || profileImage);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
       <TouchableOpacity onPress={() => Alert.alert("Edit Profile")} style={styles.headerIcon}>
  <Ionicons name="create-outline" size={24} color="#000" />
</TouchableOpacity>

      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={selectProfileImage}>
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          </TouchableOpacity>
          <Text style={styles.profileName}>{userName}</Text>
        </View>

        {/* Media Section */}
        <TouchableOpacity
          style={styles.mediaSection}
          activeOpacity={0.8}
          onPress={() => Alert.alert("Media", "View all media")}
        >
          <View style={styles.mediaContent}>
            <Text style={styles.mediaTitle}>Media</Text>
            <Text style={styles.mediaCount}>{mediaCount}</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </View>
          <FlatList
            horizontal
            data={media}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (item?.uri) setSelectedImage(item.uri); // ✅ FIX: safe null check
                }}
              >
                <Image source={{ uri: item.uri }} style={styles.mediaItem} />
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </TouchableOpacity>

        {/* Random Link Section */}
        <TouchableOpacity
          style={{
            padding: 15,
            backgroundColor: "#f8f8f8",
            borderRadius: 10,
            margin: 10,
          }}
          activeOpacity={0.8}
          onPress={() => Alert.alert("Link", randomLink)}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Random Link:</Text>
            <Text style={{ marginLeft: 8, color: "blue" }}>{randomLink}</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#999"
              style={{ marginLeft: 5 }}
            />
          </View>
        </TouchableOpacity>

        {/* Documents Section */}
        <TouchableOpacity
          style={styles.mediaSection}
          activeOpacity={0.8}
          onPress={() => Alert.alert("Documents", "View all documents")}
        >
          <View style={styles.mediaContent}>
            <Text style={styles.mediaTitle}>Documents</Text>
            <Text style={styles.mediaCount}>{mediaCount}</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </View>
        </TouchableOpacity>

        {/* About Section */}
        <View style={styles.optionsSection}>
          <View style={styles.listItem}>
            <View style={styles.listItemIconText}>
              <Ionicons name="person-outline" size={24} color="#666" style={styles.listIcon} />
              <View style={styles.listTextContainer}>
                <Text style={styles.listLabel}>Father's Name</Text>
                <Text style={styles.listValue}>Ramesh Choudhary</Text>
              </View>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.listItem}>
            <View style={styles.listItemIconText}>
              <Ionicons name="book-outline" size={24} color="#666" style={styles.listIcon} />
              <View style={styles.listTextContainer}>
                <Text style={styles.listLabel}>Bio</Text>
                <Text style={styles.listValue}>
                  Passionate learner, love coding.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.listItem}>
            <View style={styles.listItemIconText}>
              <Ionicons name="school-outline" size={24} color="#666" style={styles.listIcon} />
              <View style={styles.listTextContainer}>
                <Text style={styles.listLabel}>Branch / Faculty</Text>
                <Text style={styles.listValue}>Computer Science</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Modal for full-size image */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeArea}
            onPress={() => setSelectedImage(null)}
          >
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 35,
    marginTop: 35,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomColor: "#E0E0E0",
  },
  headerIcon: {
    padding: 5,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
    borderWidth: 2,
    borderColor: "#ccc",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 15,
    color: "#333",
  },
  mediaSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  mediaContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  mediaCount: {
    fontSize: 16,
    color: "#999",
  },
  mediaItem: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: "#eee",
  },
  optionsSection: {
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  listItemIconText: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  listIcon: {
    marginRight: 15,
    width: 24,
    textAlign: "center",
  },
  listTextContainer: {
    flex: 1,
  },
  listLabel: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
  },
  listValue: {
    fontSize: 13,
    color: "#000",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 55,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  closeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
});
