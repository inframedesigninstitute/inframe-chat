import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ProfileScreen from './ProfileScreen';

const UserProfileScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <ProfileScreen onClose={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});

export default UserProfileScreen;










