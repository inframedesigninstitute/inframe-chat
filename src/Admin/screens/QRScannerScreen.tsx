import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const QRScannerScreen = () => {
  const navigation = useNavigation();
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState(Platform.OS === 'web' ? true : false);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Request camera permission
      setHasPermission(true); // For now, assume permission is granted
    }
  }, []);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleFlashToggle = () => {
    setFlashEnabled(!flashEnabled);
    Alert.alert('Flash', `Flash ${flashEnabled ? 'disabled' : 'enabled'}`);
  };

  const handleGallery = () => {
    Alert.alert('Gallery', 'Open gallery to scan QR from image');
  };

  const handleManualInput = () => {
    Alert.alert('Manual Input', 'Enter QR code manually');
  };

  const handleScanResult = () => {
    Alert.alert(
      'QR Code Scanned',
      'QR Code detected!\n\nContent: https://example.com/qr-code',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Link', onPress: () => console.log('Opening link') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleFlashToggle}>
          <Ionicons 
            name={flashEnabled ? "flashlight" : "flashlight-outline"} 
            size={24} 
            color={flashEnabled ? "#FFD700" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      {/* Scanner Area */}
      <View style={styles.scannerContainer}>
        <View style={styles.scannerOverlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop} />
          
          {/* Middle section with scanning area */}
          <View style={styles.middleSection}>
            <View style={styles.overlaySide} />
            
            {/* Scanning frame */}
            <View style={styles.scanningFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Simulated scanning line */}
              <View style={styles.scanLine} />
            </View>
            
            <View style={styles.overlaySide} />
          </View>
          
          {/* Bottom overlay */}
          <View style={styles.overlayBottom} />
        </View>
        
        {/* Instructions */}
        <Text style={styles.instructionText}>
          Position QR code within the frame to scan
        </Text>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.bottomButton} onPress={handleGallery}>
          <Ionicons name="image" size={24} color="#fff" />
          <Text style={styles.bottomButtonText}>Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomButton} onPress={handleManualInput}>
          <Ionicons name="create" size={24} color="#fff" />
          <Text style={styles.bottomButtonText}>Enter Manually</Text>
        </TouchableOpacity>
      </View>

      {/* Demo Scan Button */}
      <TouchableOpacity style={styles.demoButton} onPress={handleScanResult}>
        <Text style={styles.demoButtonText}>Demo: Simulate QR Scan</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    marginTop:35,
    marginBottom:35
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  cameraSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  scannerOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleSection: {
    flexDirection: 'row',
    height: 250,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanningFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00FF00',
    opacity: 0.8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  instructionText: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    paddingHorizontal: 40,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  bottomButton: {
    alignItems: 'center',
    bottom:35
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
  },
  demoButton: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    backgroundColor: '#075E54',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRScannerScreen;

