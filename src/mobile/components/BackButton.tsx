import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BackButton = ({ color = '#667085', size = 22 }: { color?: string; size?: number }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
};

export default BackButton;










