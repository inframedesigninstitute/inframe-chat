import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.text}>These are sample terms and conditions for the app.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' ,marginTop:35},
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  text: { fontSize: 16, color: '#000' },
});



