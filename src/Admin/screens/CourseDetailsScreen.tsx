import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute } from '@react-navigation/native';

const CourseDetailsScreen = () => {
  const route = useRoute() as any;
  const { courseId } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Course Details</Text>
      <Text style={styles.text}>Course ID: {courseId}</Text>
      <Text style={styles.text}>Syllabus, schedule, and instructor info here.</Text>
    </SafeAreaView>
  );
};

export default CourseDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  text: { fontSize: 16, color: '#000', marginBottom: 8 },
});



