# Galia Club Manager

A comprehensive club management system with cross-platform support for desktop and mobile devices.

## Features

### Core Features
- **Athletes Management**: Add, edit, and track athlete information
- **Coaches Management**: Manage coaching staff and assignments
- **Groups Management**: Organize athletes into training groups
- **Payments Tracking**: Monitor membership fees and payments
- **Data Synchronization**: Real-time sync across devices on local network
- **Cross-Platform**: Available as web app, Windows EXE, and Android APK

### Data Synchronization
- Automatic discovery of devices on local network
- Real-time data synchronization between multiple instances
- Conflict resolution for simultaneous edits
- Offline capability with sync when connection restored

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- MongoDB

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables (create `.env` file):
   ```
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=galia_club
   ```

4. Start the backend server:
   ```bash
   python server.py
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Building Executables

### Windows EXE
1. Build the Windows executable:
   ```bash
   node build-scripts/build-windows.js
   ```
   Or use the npm script:
   ```bash
   npm run dist-win
   ```

2. The executable will be created in the `dist` folder.

### Android APK
1. Set up mobile development environment:
   ```bash
   node build-scripts/setup-mobile.js
   ```

2. Build the Android APK:
   ```bash
   node build-scripts/build-android.js
   ```
   Or use the npm script:
   ```bash
   npm run capacitor-build
   ```

3. The APK will be created in `android/app/build/outputs/apk/`

### Prerequisites for Mobile Build
- **Android Studio** with Android SDK
- **Java 11+**
- For iOS (macOS only): **Xcode**

## Development

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run electron-dev` - Run in Electron development mode
- `npm run dist` - Build all platform executables
- `npm run android` - Open Android project in Android Studio
- `npm run ios` - Open iOS project in Xcode (macOS only)

### Project Structure
```
├── backend/                 # Python Flask backend
│   ├── server.py           # Main server file
│   ├── network_discovery.py # Network device discovery
│   ├── sync_manager.py     # Data synchronization manager
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   └── utils/          # Utility functions
│   └── build/              # Production build
├── electron/               # Electron main process
├── android/                # Android native project
├── build-scripts/          # Build automation scripts
└── capacitor.config.ts     # Capacitor configuration
```

## Data Synchronization

The app includes a sophisticated data synchronization system that:

1. **Discovers devices** on the local network automatically
2. **Synchronizes data** in real-time between connected devices
3. **Handles conflicts** when the same data is modified on multiple devices
4. **Works offline** and syncs when connection is restored

### How It Works
- Each instance runs a network discovery service on port 8889
- Devices are discovered using network scanning and service detection
- Data changes trigger automatic synchronization with all connected devices
- Manual sync can be triggered from the Data Sync tab or Electron menu

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please contact the Galia Club Ainsefra team.