#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🌐 Building web app...');

try {
  // Build for Web
  console.log('💻 Building Web bundle...');
  execSync('expo export --platform web', { stdio: 'inherit' });
  
  console.log('✅ Web build completed successfully!');
  console.log('📁 Web files are in the dist/ directory');
} catch (error) {
  console.error('❌ Web build failed:', error.message);
  process.exit(1);
}
