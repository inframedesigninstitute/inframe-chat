import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react'; // <-- Added useState
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity, // <-- Added Modal
    TouchableWithoutFeedback // <-- Added for closing modal
    ,





    View
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/types';

// Logo import (assuming this path is correct)
const logo = require('../../assets/go001.png');

type TopBarNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TopBarProps {
  onAddGroup?: () => void;
  onOpenCamera?: () => void;
}

// WhatsApp jaisa Popup Menu Component
const MoreOptionsMenu: React.FC<{
  isVisible: boolean;
  onClose: () => void;
 
  onSettings: () => void;
  onCreateGroup:()=> void;
}> = ({ isVisible, onClose,  onSettings , onCreateGroup }) => {
  
  // Menu mein jo items aap dikhana chahte hain, unhe yahan define karein.
  const menuItems = [
    { name: 'New group', onPress: onCreateGroup },
    { name: 'Starred', onPress: () => { onClose(); } },
    // { name: 'Broadcast lists', onPress: () => { onClose(); /* add broadcast logic */ } },
    { name: 'Settings', onPress: onSettings },
  ];

  return (
    <Modal
      transparent={true} // Taki background transparent rahe
      visible={isVisible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={menuStyles.modalOverlay}>
          <View style={menuStyles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={menuStyles.menuItem}
                onPress={item.onPress}
              >
                <Text style={menuStyles.menuItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};


const TopBar: React.FC<TopBarProps> = ({ onAddGroup, onOpenCamera }) => {
  const navigation = useNavigation<TopBarNavigationProp>();
  // State to control the visibility of the popup menu
  const [menuVisible, setMenuVisible] = useState(false); // <-- New State

  // Function to show/hide the menu
  const handleMoreOptions = () => {
    setMenuVisible(prev => !prev);
  };
  
  const handleCloseMenu = () => {
    setMenuVisible(false);
  };

  const handleSettings = () => {
    handleCloseMenu(); // Pehle menu band karein
    navigation.navigate('Settings'); // Phir Settings screen par navigate karein
  };
  const handleCreateGroup = () => {
    handleCloseMenu(); // Pehle menu band karein
    navigation.navigate('CreateGroup'); // Phir Settings screen par navigate karein
  };
  
  const handleNewGroup = () => {
    handleCloseMenu(); // Pehle menu band karein
    if (onAddGroup) {
      onAddGroup();
    } else {
      // Agar onAddGroup prop nahi hai, toh yahan group creation/navigation logic daalein
      console.log('Navigate to New Group Screen or show group modal');
    }
  };


  // Baki functions (handleQRScanner, handleCamera) wahi rahenge
  const handleQRScanner = () => {
    navigation.navigate('QRScanner');
  };

  const handleCamera = () => {
    if (onOpenCamera) {
      onOpenCamera();
    } else {
      navigation.navigate('Camera');
    }
  };


  return (
    <View style={styles.topBar}>
      <View style={styles.left}>
        <Image
          source={logo}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.right}>
        
        <TouchableOpacity onPress={handleMoreOptions} style={styles.iconButton}> 
          <MaterialIcons name="more-vert" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <MoreOptionsMenu
        isVisible={menuVisible}
        onClose={handleCloseMenu}
        onSettings={handleSettings}
        onCreateGroup={handleCreateGroup}
      />
    </View>
  );
};

export default TopBar;

// --- Styles ---

const styles = StyleSheet.create({
  topBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingLeft:15,
    backgroundColor: '#ffffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2, 
    marginTop: 34,
    borderRadius: 10,
    marginLeft:20,
    marginRight:20,
  },
  
  logoImage: {
    width: 120, // Adjust width as needed
    height: 30,
    textAlign:"center" // Adjust height as needed
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  appName: { fontSize: 24, fontWeight: '600', color: '#0b0f0fff',textAlign:'justify', },
  right: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 16, padding: 4 },
});


// Extra Styles for the Popup Menu (Modal)
const menuStyles = StyleSheet.create({
  modalOverlay: {
    // Ye poori screen ko cover karega aur user ko modal ke bahar click karke band karne dega
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Thoda sa dim background
    justifyContent: 'flex-start',
    alignItems: 'flex-end', // Popup ko right side mein dikhane ke liye
    paddingTop: 70, // TopBar ki height aur status bar ke hisab se adjust karein
    paddingRight: 10, // Right side se thodi doori
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 200, // Popup menu ki width
    paddingVertical: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
});