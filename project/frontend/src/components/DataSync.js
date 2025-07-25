import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Users, AlertCircle, CheckCircle } from 'lucide-react';

const DataSync = () => {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: false,
    devices: [],
    lastSync: null,
    syncing: false
  });
  
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [syncLog, setSyncLog] = useState([]);

  useEffect(() => {
    // Check if we're running in Electron
    if (window.electronAPI) {
      window.electronAPI.onMenuSync(() => {
        handleForceSync();
      });
    }

    // Start network discovery
    startNetworkDiscovery();
    
    // Cleanup on unmount
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('menu-sync');
      }
    };
  }, []);

  const startNetworkDiscovery = async () => {
    try {
      // Simulate network discovery for web version
      // In real implementation, this would call the backend API
      const response = await fetch('/api/sync/status');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(prev => ({
          ...prev,
          isOnline: true,
          devices: data.devices || [],
          lastSync: data.last_sync
        }));
        setDiscoveredDevices(data.devices || []);
      }
    } catch (error) {
      console.error('Network discovery failed:', error);
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    }
  };

  const handleForceSync = async () => {
    setSyncStatus(prev => ({ ...prev, syncing: true }));
    
    try {
      const response = await fetch('/api/sync/force', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        addToSyncLog('success', 'Manual sync completed successfully');
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date().toISOString(),
          syncing: false
        }));
      } else {
        addToSyncLog('error', 'Sync failed: Server error');
      }
    } catch (error) {
      addToSyncLog('error', `Sync failed: ${error.message}`);
    } finally {
      setSyncStatus(prev => ({ ...prev, syncing: false }));
    }
  };

  const addToSyncLog = (type, message) => {
    const logEntry = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleString()
    };
    setSyncLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
  };

  const getStatusIcon = () => {
    if (syncStatus.syncing) {
      return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
    }
    return syncStatus.isOnline ? 
      <Wifi className="w-5 h-5 text-green-500" /> : 
      <WifiOff className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (syncStatus.syncing) return 'Synchronizing...';
    if (syncStatus.isOnline) return 'Online';
    return 'Offline';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Data Synchronization</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className={`font-medium ${
                syncStatus.isOnline ? 'text-green-600' : 'text-red-600'
              }`}>
                {getStatusText()}
              </span>
            </div>
            <button
              onClick={handleForceSync}
              disabled={syncStatus.syncing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncStatus.syncing ? 'Syncing...' : 'Force Sync'}
            </button>
          </div>
        </div>

        {/* Sync Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Devices Found</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{discoveredDevices.length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Last Sync</h3>
            </div>
            <p className="text-sm text-green-600">
              {syncStatus.lastSync ? 
                new Date(syncStatus.lastSync).toLocaleString() : 
                'Never'
              }
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Status</h3>
            </div>
            <p className="text-sm text-yellow-600">
              {syncStatus.isOnline ? 'Ready to sync' : 'Network unavailable'}
            </p>
          </div>
        </div>

        {/* Discovered Devices */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Discovered Devices</h3>
          {discoveredDevices.length > 0 ? (
            <div className="space-y-2">
              {discoveredDevices.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-800">{device.name || device.ip}</p>
                      <p className="text-sm text-gray-600">{device.ip}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last seen: {new Date(device.last_seen).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wifi className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No devices found on the network</p>
              <p className="text-sm">Make sure other instances of the app are running</p>
            </div>
          )}
        </div>

        {/* Sync Log */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sync Log</h3>
          {syncLog.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {syncLog.map((entry) => (
                <div key={entry.id} className={`p-3 rounded-lg ${
                  entry.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' :
                  entry.type === 'error' ? 'bg-red-50 border-l-4 border-red-500' :
                  'bg-blue-50 border-l-4 border-blue-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${
                      entry.type === 'success' ? 'text-green-800' :
                      entry.type === 'error' ? 'text-red-800' :
                      'text-blue-800'
                    }`}>
                      {entry.message}
                    </p>
                    <span className="text-sm text-gray-500">{entry.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No sync activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataSync;