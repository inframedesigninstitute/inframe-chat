import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const HelpScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Help & Support</Text>
      <Text style={styles.item}>Support Email: support@example.com</Text>
      <Text style={styles.item}>Admin Support: +1 234 567 8900</Text>
      <Text style={styles.item}>Faculty Support: +1 234 567 8901</Text>
      <Text style={styles.link}>Terms & Conditions</Text>
      <Text style={styles.link}>Privacy Policy</Text>
      <Text style={styles.link}>Application Info</Text>
    </SafeAreaView>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginVertical: 16 },
  item: { fontSize: 16, color: '#000', marginVertical: 6 },
  link: { fontSize: 16, color: '#075E54', marginVertical: 10, fontWeight: '700' },
});



