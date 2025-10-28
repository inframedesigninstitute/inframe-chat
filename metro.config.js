const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolve react-native-maps to a stub on web
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    'react-native-maps': require.resolve('./web-stubs/react-native-maps'),
  },
};

module.exports = config;

