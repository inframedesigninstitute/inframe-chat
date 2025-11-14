import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraOptions, launchCamera } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
    Camera: { onPictureTaken: (imageUri: string) => void };
    // ... other routes in your stack
};

type CameraScreenRouteProp = RouteProp<RootStackParamList, 'Camera'>;

const CameraScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<CameraScreenRouteProp>();

  const onPictureTaken = route.params?.onPictureTaken;

  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const openCamera = () => {
    const options: CameraOptions = { mediaType: 'photo', quality: 1 };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        navigation.goBack();
        return;
      }
      
      if (response.errorCode || response.errorMessage) {
        console.error('Camera Error:', response.errorMessage || response.errorCode);
        navigation.goBack();
        return;
      }

      if (response.assets && response.assets[0].uri) {
        const uri = response.assets[0].uri;
        setCapturedImage(uri);

        if (onPictureTaken) {
          onPictureTaken(uri);
        }

        navigation.goBack();
      } else {
        navigation.goBack();
      }
    });
  };

  useEffect(() => {
    openCamera();
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={26} color="#fff" />
      </TouchableOpacity>

      <View style={styles.preview}>
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.image} />
        ) : (
          <Text style={{ color: "#fff" }}>Opening camera...</Text>
        )}
      </View>

    </SafeAreaView>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  closeBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },

  preview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "90%",
    height: "80%",
    borderRadius: 10,
    resizeMode: "cover",
  },
});