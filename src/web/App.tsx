import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { UserProvider } from './context/UserContext';
import RootNavigator from './navigation/RootNavigator';

const WebApp = () => {
  return (
    <NavigationContainer>
      <UserProvider>
        <RootNavigator />
      </UserProvider>
    </NavigationContainer>
  );
};

export default WebApp;
