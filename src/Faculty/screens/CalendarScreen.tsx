import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>📅 Calendar</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: '#4e73df' },
        }}
        theme={{
          todayTextColor: '#020202ff',
          selectedDayBackgroundColor: '#4e73df',
          arrowColor: '#4e73df',
        }}
      />

      {selectedDate ? (
        <View style={styles.detailsBox}>
          <Text style={styles.selectedText}>Selected Date:</Text>
          <Text style={styles.dateValue}>{selectedDate}</Text>
        </View>
      ) : (
        <Text style={styles.placeholder}>Tap a date to view details</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  detailsBox: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 3,
  },
  selectedText: {
    fontSize: 16,
    color: '#444',
  },
  dateValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4e73df',
    marginTop: 5,
  },
  placeholder: {
    marginTop: 20,
    textAlign: 'center',
    color: '#888',
  },
});

export default CalendarScreen;
