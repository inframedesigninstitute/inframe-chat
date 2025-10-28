// DocumentPicker.tsx
import { Platform } from "react-native";

const openDocumentPicker = async (onPick: (fileName: string) => void) => {
  try {
    if (Platform.OS === "web") {
      const file: File | null = await new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "*/*"; // Any file type
        input.onchange = (e: any) => {
          resolve(e.target.files ? e.target.files[0] : null);
        };
        input.click();
      });

      if (file) {
        onPick(file.name);
      }
    } else {
      const DocumentPickerModule = await import("expo-document-picker");

      const result = await DocumentPickerModule.getDocumentAsync({
        type: "*/*",
      });

      // TypeScript safe access
      if ("type" in result && result.type === "success" && "name" in result) {
        onPick((result as any).name);
      }
    }
  } catch (error) {
    console.error("Error picking document:", error);
  }
};

export default function DocumentPickerComponent() {
  return null;
}

export { openDocumentPicker };

