import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";

export default function VideoCallScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Camera not supported on Web. Showing preview placeholder.</Text>
      </View>
    );
  }

  if (!permission?.granted) {
    return <Text>Requesting camera permissions...</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} facing="front" />
    </View>
  );
}
