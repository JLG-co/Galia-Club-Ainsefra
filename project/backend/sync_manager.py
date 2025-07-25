import json
import threading
import time
from datetime import datetime, timedelta
from network_discovery import NetworkDiscovery
from pymongo import MongoClient
import os

class SyncManager:
    def __init__(self, db_connection):
        self.db = db_connection
        self.discovery = NetworkDiscovery()
        self.last_sync = {}
        self.sync_interval = 30  # seconds
        self.running = False
        
    def start(self):
        """Start the synchronization manager"""
        self.running = True
        self.discovery.start_server()
        
        # Start background sync process
        sync_thread = threading.Thread(target=self._sync_loop)
        sync_thread.daemon = True
        sync_thread.start()
        
        # Start device discovery
        discovery_thread = threading.Thread(target=self._discovery_loop)
        discovery_thread.daemon = True
        discovery_thread.start()
        
        print("Sync Manager started")
    
    def _sync_loop(self):
        """Main synchronization loop"""
        while self.running:
            try:
                # Get latest data from local database
                local_data = self._get_local_data()
                self.discovery.update_sync_data(local_data)
                
                # Sync with discovered devices
                devices = self.discovery.get_devices()
                for device_ip, device_info in devices.items():
                    if self._should_sync_with_device(device_ip):
                        self._sync_with_device(device_ip, local_data)
                
                time.sleep(self.sync_interval)
            except Exception as e:
                print(f"Sync loop error: {e}")
                time.sleep(5)
    
    def _discovery_loop(self):
        """Device discovery loop"""
        while self.running:
            try:
                self.discovery.discover_devices()
                time.sleep(60)  # Discover every minute
            except Exception as e:
                print(f"Discovery loop error: {e}")
                time.sleep(10)
    
    def _get_local_data(self):
        """Get data from local database for synchronization"""
        try:
            data = {
                'athletes': list(self.db.athletes.find({}, {'_id': 0})),
                'coaches': list(self.db.coaches.find({}, {'_id': 0})),
                'groups': list(self.db.groups.find({}, {'_id': 0})),
                'payments': list(self.db.payments.find({}, {'_id': 0})),
                'timestamp': datetime.now().isoformat()
            }
            return data
        except Exception as e:
            print(f"Error getting local data: {e}")
            return {}
    
    def _should_sync_with_device(self, device_ip):
        """Check if we should sync with a device"""
        if device_ip not in self.last_sync:
            return True
        
        last_sync_time = datetime.fromisoformat(self.last_sync[device_ip])
        return datetime.now() - last_sync_time > timedelta(seconds=self.sync_interval)
    
    def _sync_with_device(self, device_ip, local_data):
        """Synchronize data with a remote device"""
        try:
            result = self.discovery.sync_with_device(device_ip, local_data)
            if result and result.get('type') == 'sync_acknowledged':
                self.last_sync[device_ip] = datetime.now().isoformat()
                print(f"Successfully synced with {device_ip}")
        except Exception as e:
            print(f"Error syncing with {device_ip}: {e}")
    
    def force_sync(self):
        """Force immediate synchronization with all devices"""
        local_data = self._get_local_data()
        devices = self.discovery.get_devices()
        
        results = {}
        for device_ip, device_info in devices.items():
            result = self._sync_with_device(device_ip, local_data)
            results[device_ip] = result
        
        return results
    
    def get_sync_status(self):
        """Get current synchronization status"""
        devices = self.discovery.get_devices()
        status = {
            'devices_count': len(devices),
            'devices': devices,
            'last_sync_times': self.last_sync,
            'sync_interval': self.sync_interval
        }
        return status
    
    def stop(self):
        """Stop the synchronization manager"""
        self.running = False
        self.discovery.stop()
        print("Sync Manager stopped")