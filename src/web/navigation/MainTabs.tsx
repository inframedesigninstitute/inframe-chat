import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CallsScreen from '../screens/CallsScreen';
import ChatsScreen from '../screens/ChatsScreen';
import GroupsScreen from '../screens/GroupsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const MainTabs = () => {
  return (
    
    <Tab.Navigator  
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'ellipse';

          if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-sharp';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'people' : 'people-sharp';
          } else if (route.name === 'Calls') {
            iconName = focused ? 'call' : 'call';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-sharp';
          }

          return (
            <View style={{ position: 'relative' }}>
              <Ionicons name={iconName} size={size} color={color} />
              {route.name === 'Chats' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>20</Text>
                </View>
              )}
              {route.name === 'Groups' && (
                <View style={styles.smallDot} />
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#000000ff',
        tabBarInactiveTintColor: '#080707ff',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#fff',
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
          marginBottom:40,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Chats" 
        component={ChatsScreen}
        options={{
          tabBarLabel: 'Chats',
        }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsScreen}
        options={{
          tabBarLabel: 'Groups',
        }}
      />
      <Tab.Screen 
        name="Calls" 
        component={CallsScreen}
        options={{
          tabBarLabel: 'Calls',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#522727ff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal:4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  smallDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#25D366',
  },
});

export default MainTabs;
