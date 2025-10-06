import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StarredMessagesProvider } from './context/StarredMessagesContext';
import { UserProvider } from './context/UserContext';
import RootNavigator from './navigation/RootNavigator';

const WebApp = () => {
  return (
    <NavigationContainer>
      <UserProvider>
        <StarredMessagesProvider>
          <RootNavigator />
        </StarredMessagesProvider>
      </UserProvider>
    </NavigationContainer>
  );
};

export default WebApp;
