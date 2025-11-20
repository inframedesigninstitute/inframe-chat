import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatsScreen from '../screens/AdminChatsScreen';
import { ChatsTopTabsParamList, RootStackParamList } from './types';

const TopTab = createMaterialTopTabNavigator<ChatsTopTabsParamList>();

export default function ChatsTopTabs() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  return (
    <View style={styles.container}>
      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#075E54',
          tabBarInactiveTintColor: '#666',
          tabBarIndicatorStyle: { backgroundColor: '#075E54', height: 3 },
          tabBarLabelStyle: { 
            fontWeight: '600',
            fontSize: 14,
            textTransform: 'none',
          },
          tabBarStyle: { 
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0.5,
            borderBottomColor: '#e0e0e0',
          },
          tabBarPressColor: 'transparent',
          tabBarPressOpacity: 0.7,
        }}
      >
        <TopTab.Screen 
          name="All" 
          component={ChatsScreen}
          options={{
            tabBarLabel: 'All',
          }}
        />
        <TopTab.Screen 
          name="Unread" 
          component={ChatsScreen}
          options={{
            tabBarLabel: 'Unread 20',
          }}
        />
        <TopTab.Screen 
          name="Favourites" 
          component={ChatsScreen}
          options={{
            tabBarLabel: 'Favourites',
          }}
        />
        <TopTab.Screen 
          name="Groups" 
          component={ChatsScreen}
          options={{
            tabBarLabel: 'Groups 3',
          }}
        />
      </TopTab.Navigator>
      
      {/* + Icon for creating new groups */}
      <TouchableOpacity 
        style={styles.plusButton}
        onPress={handleCreateGroup}
      >
        <Ionicons name="add" size={20} color="#075E54" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginLeft:900
  },
  plusButton: {
    position: 'absolute',
    right: 16,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
