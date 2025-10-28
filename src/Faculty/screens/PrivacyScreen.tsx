import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import WebBackButton from '../components/WebBackButton';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
       <WebBackButton />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.text}>This is a sample privacy policy describing how data is used.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginTop:35 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  text: { fontSize: 16, color: '#000' },
});



