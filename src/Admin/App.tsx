import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { CallProvider } from '../contexts/CallContext';
import { setToken } from '../Redux/Slices/adminTokenSlice';
import UserProvider from './context/UserContext';
import RootNavigator from './navigation/RootNavigator';

const AdminApp = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const hydrateToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('ADMINTOKEN');
        if (storedToken) {
          dispatch(setToken({ token: storedToken }));
        }
      } catch (e) {
        // ignore hydration errors
      }
    };
    hydrateToken();
  }, [dispatch]);

  return (
    <NavigationContainer {...({ independent: true } as any)}>
      <CallProvider>
        <UserProvider>
          <RootNavigator />
        </UserProvider>
      </CallProvider>
    </NavigationContainer>
  );
};

export default AdminApp;
