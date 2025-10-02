import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface TopTabNavigationProps {
  onTabChange?: (tab: string) => void;
}

const TopTabNavigation: React.FC<TopTabNavigationProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = [
    { id: 'All', label: 'All', icon: null },
    { id: 'Unread', label: 'Unread', count: 5 },
    { id: 'Favourites', label: 'Favourites', icon: null },
    { id: 'Groups', label: 'Groups', count: 4 },
    
  ];

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId); // ✅ Active tab update
    onTabChange?.(tabId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab, // ✅ Only active tab gets style
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.activeTabLabel, // ✅ Active tab label style
                ]}
              >
                {tab.label}
              </Text>
              {tab.count && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{tab.count}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    minWidth: 60,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8bada9ff',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#131212ff',
  },
  activeTabLabel: {
    color: '#0f0a0aff',
  },
  countBadge: {
    backgroundColor: '#5e4c4cff',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default TopTabNavigation;
