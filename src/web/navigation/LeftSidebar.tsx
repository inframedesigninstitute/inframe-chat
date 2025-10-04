import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MainTabsParamList } from './types';

type NavigationProp = BottomTabNavigationProp<MainTabsParamList>;

type NavKey = keyof MainTabsParamList;

type NavItem = {
  key: NavKey;
  icon: string;
  label: string;
};

const items: NavItem[] = [
  { key: 'Chats', icon: 'chatbubbles-sharp', label: 'Chats' },
  { key: 'Groups', icon: 'people-sharp', label: 'Groups' },
  { key: 'Calls', icon: 'call', label: 'Calls' },
  { key: 'Settings', icon: 'settings', label: 'Settings' },
];

const LeftSidebarNav = ({ active }: { active: NavKey }) => {
  const navigation = useNavigation<NavigationProp>();

  const handleNavigation = (screen: NavKey) => {
    navigation.navigate(screen as keyof MainTabsParamList);
  };

  return (
    <View style={styles.leftSidebar}>
      <View style={styles.topSpace} />
      <View style={styles.navigationIcons}>
        {items.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.navIcon, active === item.key && styles.activeNavIcon]}
            onPress={() => handleNavigation(item.key)}
          >
            <View style={{ position: 'relative', alignItems: 'center' }}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color={active === item.key ? '#fff' : '#000'}
              />

              {/* Chats badge */}
              {item.key === 'Chats' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>20</Text>
                </View>
              )}

              {/* Groups green dot */}
              {item.key === 'Groups' && <View style={styles.smallDot} />}
            </View>

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

  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#522727ff',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  smallDot: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#25D366',
  },
});

export default LeftSidebarNav;
