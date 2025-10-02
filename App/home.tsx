import React from 'react';
import { Platform } from 'react-native';

// Platform-specific App imports
import MobileApp from '../src/mobile/App';
import WebApp from '../src/web/App';

const App = () => {
  // Determine which App component to use based on platform
  if (Platform.OS === 'web') {
    return <WebApp />;
  }

  return <MobileApp />;
};

export default App;
