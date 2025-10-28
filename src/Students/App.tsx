import { NavigationContainer } from '@react-navigation/native';
import UserProvider from './context/UserContext';
import RootNavigator from './navigation/RootNavigator';

const StudentApp = () => {
  return (
    <NavigationContainer {...({ independent: true } as any)}>
      <UserProvider>
        <RootNavigator />
      </UserProvider>
    </NavigationContainer>
  );
};

export default StudentApp;
