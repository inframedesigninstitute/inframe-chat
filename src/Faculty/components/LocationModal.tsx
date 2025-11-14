import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (coords: { latitude: number; longitude: number }) => void;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

const LocationModal: React.FC<LocationModalProps> = ({ visible, onClose, onSend }) => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (visible) {
      getLocation();
    }
  }, [visible]);

  const getLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        onClose();
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (err) {
      console.error(err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSendLocation = () => {
    if (location) {
      onSend(location);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Your Live Location</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : location ? (
          Platform.OS === 'web' ? (
            <View style={styles.mapContainer}>
              <iframe
                title="map"
                width="80%"
                height="90%"
                style={{ borderRadius: 15, border: 'none' }}
                src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
              />
            </View>
          ) : (
            <View style={styles.mapContainer}>
              <Text style={styles.mapText}>
                {location.latitude}, {location.longitude}
              </Text>
            </View>
          )
        ) : (
          <Text>Unable to fetch location.</Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: '#d6e6d6ff' }]}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSendLocation} style={[styles.button, { backgroundColor: '#d6e6d6ff' }]}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LocationModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  mapContainer: {
    width: '100%',
    height:"80%",
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  mapText: {
    fontSize: 16,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#000000ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
