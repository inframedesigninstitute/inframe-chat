// DocumentPicker.tsx
import { Platform } from "react-native";

const openDocumentPicker = async (
  onPick: (fileName: string, fileObj?: any) => void
) => {
  try {
    // ================= WEB FILE PICKER =================
    if (Platform.OS === "web") {
      // @ts-ignore - RN does not have document
      const file: File | null = await new Promise((resolve) => {
        // @ts-ignore
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "*/*";

        input.onchange = (e: any) => {
          resolve(e.target.files ? e.target.files[0] : null);
        };

        input.click();
      });

      if (file) {
        onPick(file.name, file);
      }
      return;
    }

    const { getDocumentAsync } = await import("expo-document-picker");

    const result = await getDocumentAsync({
      type: "*/*",
      multiple: false,
      copyToCacheDirectory: true,
    });

    // NEW cancel check (Expo SDK 50+)
    if (result.canceled) {
      return;
    }

    // Safe checks
    if (
      result &&
      "assets" in result &&
      Array.isArray(result.assets) &&
      result.assets.length > 0
    ) {
      const file = result.assets[0];
      onPick(file.name ?? "unknown", file);
    }
  } catch (error) {
    console.error("Error picking document:", error);
  }
};

export default function DocumentPickerComponent() {
  return null;
}

export { openDocumentPicker };

