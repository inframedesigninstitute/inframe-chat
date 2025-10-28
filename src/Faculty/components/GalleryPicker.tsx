// GalleryPicker.tsx
import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

const openGallery = async (onPick: (imageUri: string) => void) => {
  try {
    if (Platform.OS === "web") {
      const file: File | null = await new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e: any) => {
          resolve(e.target.files ? e.target.files[0] : null);
        };
        input.click();
      });

      if (file) {
        const url = URL.createObjectURL(file);
        onPick(url);
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need access to your gallery.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        onPick(result.assets[0].uri);
      }
    }
  } catch (error) {
    console.error("Error picking image:", error);
  }
};

export default function GalleryPicker() {
  return null; // ye sirf ek helper component hai
}

export { openGallery };

