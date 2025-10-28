import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Define a general interface for the navigation prop
// In a real app, you'd use types from your navigation library (e.g., StackNavigationProp)
interface NavigationProp {
    goBack: () => void;
    // Add other methods like navigate, push, etc., if needed
}

// Define the component props
interface AttendanceScreenProps {
    navigation: NavigationProp;
}

// --- Component for a single Menu Item ---
interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItemRow} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      {icon}
    </View>
    <Text style={styles.menuItemText}>{title}</Text>
  </TouchableOpacity>
);

// --- Main Attendance Screen Component ---

// Update component definition to accept navigation prop
const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ navigation }) => {
  
  const handleNavigation = (destination: string) => {
    Alert.alert(`Navigation Action`, `Would navigate to: ${destination}`);
  };

  /**
   * Function to go back to the previous screen.
   * This is where the navigation.goBack() function is applied.
   */
  const handleBack = () => {
    // 👈 THIS IMPLEMENTS THE "GO BACK" FUNCTIONALITY
    if (navigation && navigation.goBack) {
        navigation.goBack();
    } else {
        // Fallback or alert for testing when navigation isn't available
        Alert.alert('Navigation Error', 'Could not go back. Navigation prop is missing or invalid.');
    }
  };

  return (
    // Removed unused marginTop and margin from safeArea styles here to rely on device defaults/header for spacing
    <SafeAreaView style={styles.safeArea}> 
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Attendance</Text>
        
        <TouchableOpacity onPress={() => Alert.alert("Menu")} style={styles.headerIcon}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Description / Instructions */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Get your current attendance on the basis of month / lecture
          or according to date. Also push a live attendance in you live
          classes by own.
        </Text>
      </View>

      {/* Menu Options Card */}
      <View style={styles.card}>
        <MenuItem
          icon={<MaterialCommunityIcons name="calendar-month-outline" size={30} color="#900C3F" />} // Monthly icon
          title="Monthly Attendance"
          onPress={() => handleNavigation('MonthlyAttendance')}
        />
        <View style={styles.separator} />
        <MenuItem
          icon={<Ionicons name="calendar" size={30} color="#007bff" />} // Lecture icon
          title="Lecture Wise Attendance"
          onPress={() => handleNavigation('LectureWiseAttendance')}
        />
        <View style={styles.separator} />

        {/* Mark Attendance Button - Styled to match the image */}
        <TouchableOpacity
          style={styles.markAttendanceButton}
          onPress={() => handleNavigation('MarkAttendance')}
        >
          <MaterialIcons name="assignment-turned-in" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.markAttendanceText}>MARK ATTENDANCE</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

// --- Stylesheet ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 0 : 0, 
marginTop:34,  },
  
  // Header Styles (Top Purple Bar)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#512DA8', // Deep purple color
  },
  
  // Header Icon Style
  headerIcon: {
    padding: 4, 
  },
  
  // Header Title Style
  headerTitle: {
    flex: 1, 
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#fff', 
    paddingHorizontal: 8,
  },

  // Instruction Text Area
  instructionContainer: {
    padding: 16,
    backgroundColor: '#f8f8ff', // Very light background
  },
  instructionText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },

  // Menu Card Container
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    padding: 16,
  },
  
  // Individual Menu Item Row
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIconContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  
  // Separator between menu items
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
    marginLeft: 55, 
  },
  
  // Mark Attendance Button
  markAttendanceButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9370DB', // Button color
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 5,
    marginHorizontal: 10,
  },
  markAttendanceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default AttendanceScreen;