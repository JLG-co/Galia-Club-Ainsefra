const { execSync } = require('child_process');
const fs = require('fs');

console.log('📱 Building Android APK...');

try {
  // Install dependencies if not already installed
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Build React app
  console.log('🔨 Building React application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Initialize Capacitor if not already done
  if (!fs.existsSync('android')) {
    console.log('⚡ Initializing Capacitor...');
    execSync('npx cap add android', { stdio: 'inherit' });
  }

  // Copy web assets to native project
  console.log('📋 Copying web assets...');
  execSync('npx cap copy android', { stdio: 'inherit' });

  // Build Android APK
  console.log('🏗️ Building Android APK...');
  execSync('npx cap build android', { stdio: 'inherit' });

  console.log('✅ Android build completed successfully!');
  console.log('📁 Check android/app/build/outputs/apk/ for the APK file.');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('\n💡 Make sure you have:');
  console.log('   - Android Studio installed');
  console.log('   - Android SDK configured');
  console.log('   - Java 11+ installed');
  process.exit(1);
}