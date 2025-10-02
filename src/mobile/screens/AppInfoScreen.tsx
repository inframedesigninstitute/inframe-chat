import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function AppInfoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Application Info</Text>
      <Text style={styles.text}>Version: 1.0.0</Text>
      <Text style={styles.text}>Build: 100</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16,marginTop:40,
    marginBottom:35
   },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  text: { fontSize: 16, color: '#000', marginBottom: 8 },
});



