import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { UserProvider } from './context/UserContext';
import RootNavigator from './navigation/RootNavigator';

const MobileApp = () => {
  return (
    <NavigationContainer>
      <UserProvider>
        <RootNavigator />
      </UserProvider>
    </NavigationContainer>
  );
};

export default MobileApp;

