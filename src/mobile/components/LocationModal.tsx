import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  const [MapView, setMapView] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('react-native-maps').then((Maps) => {
        setMapView(() => Maps.default);
        setMarker(() => Maps.Marker);
      });
    }
  }, []);

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
        alert('Permission to access location was denied');
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
            <iframe
              title="map"
              width="90%"
              height="70%"
              style={{ borderRadius: 15, border: 'none' }}
              src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
            />
          ) : MapView && Marker ? (
            <MapView
              style={styles.map}
              region={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation
              followsUserLocation
            >
              <Marker coordinate={location} title="You are here" />
            </MapView>
          ) : (
            <ActivityIndicator size="large" color="#4CAF50" />
          )
        ) : (
          <Text>Unable to fetch location.</Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: '#f44336' }]}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSendLocation} style={[styles.button, { backgroundColor: '#4CAF50' }]}>
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
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
  map: {
    width: '90%',
    height: '70%',
    borderRadius: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
