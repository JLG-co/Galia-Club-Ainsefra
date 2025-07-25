const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Windows executable...');

try {
  // Install dependencies if not already installed
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Build React app
  console.log('🔨 Building React application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Build Electron app for Windows
  console.log('💻 Building Windows executable...');
  execSync('npm run dist-win', { stdio: 'inherit' });

  console.log('✅ Windows build completed successfully!');
  console.log('📁 Check the "dist" folder for the executable file.');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}