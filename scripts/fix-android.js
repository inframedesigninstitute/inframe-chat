#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Fixing Android device connection issues...');

try {
  console.log('1. Killing ADB server...');
  execSync('adb kill-server', { stdio: 'inherit' });
  
  console.log('2. Starting ADB server...');
  execSync('adb start-server', { stdio: 'inherit' });
  
  console.log('3. Checking connected devices...');
  execSync('adb devices', { stdio: 'inherit' });
  
  console.log('\n✅ ADB server restarted successfully!');
  console.log('\n📱 Next steps:');
  console.log('1. Make sure USB Debugging is enabled on your device');
  console.log('2. Accept the USB debugging prompt on your phone');
  console.log('3. Try running: npx expo start');
  console.log('4. Or use Expo Go app and scan QR code');
  
} catch (error) {
  console.error('❌ Error fixing ADB:', error.message);
  console.log('\n🔄 Alternative solutions:');
  console.log('1. Use Android Emulator instead of physical device');
  console.log('2. Use Expo Go app with QR code');
  console.log('3. Test on web first: npx expo start --web');
}

