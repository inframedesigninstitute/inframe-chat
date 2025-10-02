# Chat App Setup Guide

## Project Structure

This Expo project is configured to run different code bases for mobile and web platforms:

- **Mobile Code**: `src/mobile/` - Used when running on Android/iOS
- **Web Code**: `src/web/` - Used when running on web browsers
- **Main Entry**: `app/index.tsx` - Platform detection and routing

## Platform Detection

The main `app/index.tsx` file automatically detects the platform and loads the appropriate App component:

```typescript
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
```

## Development Commands

### Start Development Server
```bash
npm start          # Start Expo development server
npm run web        # Start web development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
```

### Build Commands
```bash
npm run build:android    # Build Android APK using EAS
npm run build:ios        # Build iOS app using EAS
npm run build:web        # Build web bundle
npm run export:web       # Export web static files
```

## EAS Build Configuration

The project includes `eas.json` for building with Expo Application Services:

- **Development**: Development client builds
- **Preview**: Internal distribution APK builds
- **Production**: Production builds for app stores

## Project Structure Details

### Mobile App (`src/mobile/`)
- `App.tsx` - Mobile app root component
- `components/` - Mobile-specific UI components
- `screens/` - Mobile screen components
- `navigation/` - Mobile navigation setup
- `context/` - Shared context providers
- `services/` - Mobile-specific services

### Web App (`src/web/`)
- `App.tsx` - Web app root component
- `components/` - Web-optimized UI components
- `screens/` - Web screen components
- `navigation/` - Web navigation setup
- `context/` - Shared context providers
- `services/` - Web-specific services

## Key Features

1. **Platform-specific code execution**
2. **Shared context and navigation structure**
3. **EAS build configuration**
4. **Development and production build scripts**

## Running the Project

1. **For Mobile Development:**
   ```bash
   npm start
   # Then press 'a' for Android or 'i' for iOS
   ```

2. **For Web Development:**
   ```bash
   npm run web
   # Opens in browser at http://localhost:8081
   ```

3. **For Production Builds:**
   ```bash
   # Mobile builds (requires EAS CLI)
   npm run build:android
   npm run build:ios
   
   # Web build
   npm run build:web
   ```

## Notes

- The project automatically routes to the correct platform-specific code
- No manual platform switching required
- All existing code in `src/mobile/` and `src/web/` remains unchanged
- EAS configuration is ready for production builds
