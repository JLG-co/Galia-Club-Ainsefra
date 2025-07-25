const CACHE_NAME = 'galia-club-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background Sync for data synchronization
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncDataWithDevices());
  }
});

// Function to sync data with other devices on the same network
async function syncDataWithDevices() {
  try {
    // This will be implemented to discover and sync with other devices
    console.log('Syncing data with other devices...');
    
    // Send message to main app about sync completion
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          timestamp: new Date().toISOString()
        });
      });
    });
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Handle file system operations
self.addEventListener('message', (event) => {
  if (event.data.type === 'SAVE_DATA') {
    handleDataSave(event.data.data);
  } else if (event.data.type === 'LOAD_DATA') {
    handleDataLoad();
  }
});

async function handleDataSave(data) {
  try {
    // This will interact with the File System Access API
    console.log('Saving data to file system:', data);
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

async function handleDataLoad() {
  try {
    // This will load data from the file system
    console.log('Loading data from file system');
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}