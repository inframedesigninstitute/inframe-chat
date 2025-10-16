import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface WebBackButtonProps {
  onPress?: () => void;
  color?: string;
  size?: number;
}

const WebBackButton: React.FC<WebBackButtonProps> = ({
  onPress,
  color = '#075E54',
  size = 24,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginRight: 8,
  },
});

export default WebBackButton;