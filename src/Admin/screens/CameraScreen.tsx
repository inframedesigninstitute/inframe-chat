import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraOptions, launchCamera } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LocalDatabase, { GalleryImage } from '../services/LocalDatabase';

const CameraScreen = () => {
  const navigation = useNavigation();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const openPhoneCamera = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 1, // ✅ Fix: Number value (0–1) instead of string
    };

    launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
      } else if (response.assets && response.assets[0].uri) {
        const imageUri = response.assets[0].uri;
        setCapturedImage(imageUri);

        const galleryImage: GalleryImage = {
          id: Date.now().toString(),
          uri: imageUri,
          timestamp: new Date(),
          name: `IMG_${Date.now()}.jpg`,
          size: response.assets[0].fileSize || 0,
        };

        await LocalDatabase.saveGalleryImage(galleryImage);

        Alert.alert('Photo Captured', 'Photo captured successfully!', [
          { text: 'Take Another', style: 'cancel', onPress: () => setCapturedImage(null) },
          { text: 'View Gallery', onPress: () => navigation.navigate('Gallery' as never) },
        ]);
      }
    });
  };

  const handleGalleryPress = () => {
    navigation.navigate('Gallery' as never);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topButton}>
         <TouchableOpacity style={styles.topButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.cameraPreview}>
        
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
        ) : (
          <Text style={styles.previewText}>Tap button below to open camera</Text>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.topButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.captureButton} onPress={openPhoneCamera}>
            <Ionicons name="camera" size={30} color="#fff" />
          </TouchableOpacity>

        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.galleryButton} onPress={handleGalleryPress}>
            <Ionicons name="images" size={30} color="#fff" />
          </TouchableOpacity>

          
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedImage: {
    width: '90%',
    height: '80%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  previewText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  topButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    marginBottom:40
  },
  galleryButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#404941ff',
    justifyContent: 'center',
    alignItems: 'center',
    bottom:20
  },
});
