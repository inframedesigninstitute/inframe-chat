import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LocalDatabase, { GalleryImage } from '../services/LocalDatabase';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 32) / 3;

const GalleryScreen = () => {
  const navigation = useNavigation();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    const gallery = await LocalDatabase.getGallery();
    setImages(gallery);
  };

  const handleImagePress = (image: GalleryImage) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const handleDeleteImage = async (image: GalleryImage) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await LocalDatabase.deleteGalleryImage(image.id);
            await loadGallery();
            setModalVisible(false);
          },
        },
      ]
    );
  };

  const handleShareImage = (image: GalleryImage) => {
    Alert.alert('Share Image', `Share ${image.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Share', onPress: () => console.log('Sharing:', image.uri) },
    ]);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderImageItem = ({ item }: { item: GalleryImage }) => (
    <TouchableOpacity
      style={styles.imageItem}
      onPress={() => handleImagePress(item)}
    >
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      <View style={styles.imageOverlay}>
        <Text style={styles.imageDate}>
          {formatDate(item.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#075E54" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gallery ({images.length})</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Camera' as never)}>
          <Ionicons name="camera" size={24} color="#075E54" />
        </TouchableOpacity>
      </View>

      {images.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="image-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No images in gallery</Text>
          <Text style={styles.emptyStateSubtext}>
            Take photos with the camera to see them here
          </Text>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => navigation.navigate('Camera' as never)}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.cameraButtonText}>Open Camera</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Image Detail Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedImage && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{selectedImage.name}</Text>
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalAction}
                      onPress={() => handleShareImage(selectedImage)}
                    >
                      <Ionicons name="share" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalAction}
                      onPress={() => handleDeleteImage(selectedImage)}
                    >
                      <Ionicons name="trash" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Image source={{ uri: selectedImage.uri }} style={styles.fullImage} />

                <View style={styles.imageInfo}>
                  <Text style={styles.infoText}>
                    📅 {formatDate(selectedImage.timestamp)}
                  </Text>
                  <Text style={styles.infoText}>
                    📏 {formatFileSize(selectedImage.size)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#075E54',
  },
  gridContainer: {
    padding: 8,
  },
  imageItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  imageDate: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E54',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalActions: {
    flexDirection: 'row',
  },
  modalAction: {
    padding: 8,
    marginLeft: 12,
  },
  fullImage: {
    flex: 1,
    resizeMode: 'contain',
    marginHorizontal: 16,
  },
  imageInfo: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    marginVertical: 2,
  },
});

export default GalleryScreen;
