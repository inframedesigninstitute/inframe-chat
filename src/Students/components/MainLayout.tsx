import React from 'react';
import { StyleSheet, View } from 'react-native';
import LeftSidebarNav from '../navigation/LeftSidebar';
import { MainTabsParamList } from '../navigation/types';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: keyof MainTabsParamList;
  rightContent?: React.ReactNode;
  showRightContent?: boolean;
  onRightContentClose?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  rightContent,
  showRightContent = false, 
  onRightContentClose
}) => {
  return (
    <View style={styles.container}>
      {/* Left Sidebar Navigation */}
      <LeftSidebarNav active={activeTab} />
      
      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {children}
      </View>
      
      {/* Right Content Area (Profile, etc.) */}
      {showRightContent && rightContent && (
        <View style={styles.rightContent}>
          {rightContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  rightContent: {
    width: 350,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
});

export default MainLayout;