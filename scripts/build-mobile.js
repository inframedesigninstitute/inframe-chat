#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Building mobile app...');

try {
  // Build for Android
  console.log('📱 Building Android APK...');
  execSync('eas build --platform android --profile preview', { stdio: 'inherit' });
  
  console.log('✅ Mobile build completed successfully!');
} catch (error) {
  console.error('❌ Mobile build failed:', error.message);
  process.exit(1);
}
