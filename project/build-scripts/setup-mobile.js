const { execSync } = require('child_process');
const fs = require('fs');

console.log('📱 Setting up mobile development environment...');

try {
  // Install Capacitor CLI globally if not installed
  try {
    execSync('npx cap --version', { stdio: 'pipe' });
  } catch {
    console.log('📦 Installing Capacitor CLI...');
    execSync('npm install -g @capacitor/cli', { stdio: 'inherit' });
  }

  // Install Capacitor dependencies
  console.log('📦 Installing Capacitor dependencies...');
  execSync('npm install @capacitor/core @capacitor/android @capacitor/ios', { stdio: 'inherit' });
  execSync('npm install @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar', { stdio: 'inherit' });

  // Initialize Capacitor
  console.log('⚡ Initializing Capacitor...');
  if (!fs.existsSync('capacitor.config.ts')) {
    execSync('npx cap init "Galia Club Manager" "com.galiaclub.manager" --web-dir=build', { stdio: 'inherit' });
  }

  // Add Android platform
  if (!fs.existsSync('android')) {
    console.log('🤖 Adding Android platform...');
    execSync('npx cap add android', { stdio: 'inherit' });
  }

  // Add iOS platform (if on macOS)
  if (process.platform === 'darwin' && !fs.existsSync('ios')) {
    console.log('🍎 Adding iOS platform...');
    execSync('npx cap add ios', { stdio: 'inherit' });
  }

  console.log('✅ Mobile development environment setup completed!');
  console.log('\n🚀 Next steps:');
  console.log('   1. Run "npm run build" to build the React app');
  console.log('   2. Run "npm run android" to open in Android Studio');
  if (process.platform === 'darwin') {
    console.log('   3. Run "npm run ios" to open in Xcode');
  }
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}