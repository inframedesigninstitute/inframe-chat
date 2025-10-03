import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from './types';

type NavKey = 'Chat' | 'Groups' | 'Calls' | 'Settings';

type NavItem = {
  key: NavKey;
  icon: string;
  label: string;
};

const items: NavItem[] = [
  { key: 'Chat', icon: 'chatbubbles-sharp', label: 'Chat' },
  { key: 'Groups', icon: 'people-sharp', label: 'Groups' },
  { key: 'Calls', icon: 'call', label: 'Calls' },
  { key: 'Settings', icon: 'settings', label: 'Settings' },
];

const LeftSidebarNav = ({ active }: { active: NavKey }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.leftSidebar}>
      <View style={styles.topSpace} />
      <View style={styles.navigationIcons}>
        {items.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.navIcon, active === item.key && styles.activeNavIcon]}
            onPress={() => navigation.navigate(item.key)}
          >
            <Ionicons
              name={item.icon as any}
              size={22}
              color={active === item.key ? '#fff' : '#000'}
            />
            <Text style={[styles.navLabel, active === item.key && styles.activeNavLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.bottomSpace} />
    </View>
  );
};

const styles = StyleSheet.create({
  leftSidebar: {
    width: 80,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    alignItems: 'center',
  },
  topSpace: { height: 16 },
  bottomSpace: { height: 16 },
  navigationIcons: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  navIcon: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 6,
    borderRadius: 8,
    minWidth: 60,
  },
  activeNavIcon: {
    backgroundColor: '#3498db',
  },
  navLabel: {
    fontSize: 10,
    color: '#000',
    marginTop: 4,
    textAlign: 'center',
  },
  activeNavLabel: { color: '#fff' },
});

export default LeftSidebarNav;








