import React from 'react';
import { Platform } from 'react-native';

// Use platform-conditional requires to avoid evaluating web/native code on the wrong platform
const App = () => {
  if (Platform.OS === 'web') {
    const WebApp = require('../src/web/App').default;
    return <WebApp />;
  }

  const MobileApp = require('../src/mobile/App').default;
  return <MobileApp />;
};

export default App;