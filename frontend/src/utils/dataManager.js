// Enhanced Data Manager with File System Access and Sync Capabilities
class DataManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.fileHandle = null;
    this.data = {
      athletes: [],
      coaches: [],
      groups: [],
      payments: [],
      categories: [],
      settings: {
        darkMode: false,
        lastSync: null,
        deviceId: this.generateDeviceId()
      }
    };
    
    this.init();
  }

  generateDeviceId() {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered', registration);
      } catch (error) {
        console.log('SW registration failed', error);
      }
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Load data from file system or fallback to localStorage
    await this.loadData();
  }

  async loadData() {
    try {
      // Try to load from file system first
      if (this.supportsFileSystemAccess()) {
        await this.loadFromFileSystem();
      } else {
        // Fallback to localStorage
        this.loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      this.loadFromLocalStorage();
    }
  }

  supportsFileSystemAccess() {
    return 'showDirectoryPicker' in window;
  }

  async loadFromFileSystem() {
    try {
      if (!this.fileHandle) {
        // Request directory access
        const dirHandle = await window.showDirectoryPicker();
        
        // Try to get existing data file
        try {
          this.fileHandle = await dirHandle.getFileHandle('galia-club-data.json');
        } catch (error) {
          // Create new file if it doesn't exist
          this.fileHandle = await dirHandle.createFile('galia-club-data.json');
        }
      }

      if (this.fileHandle) {
        const file = await this.fileHandle.getFile();
        const text = await file.text();
        
        if (text.trim()) {
          this.data = JSON.parse(text);
        }
      }
    } catch (error) {
      console.error('File system access failed:', error);
      throw error;
    }
  }

  loadFromLocalStorage() {
    const stored = localStorage.getItem('galia-club-data');
    if (stored) {
      this.data = JSON.parse(stored);
    }
  }

  async saveData() {
    this.data.settings.lastSync = new Date().toISOString();
    
    try {
      if (this.supportsFileSystemAccess() && this.fileHandle) {
        await this.saveToFileSystem();
      } else {
        this.saveToLocalStorage();
      }
    } catch (error) {
      console.error('Failed to save data:', error);
      // Fallback to localStorage
      this.saveToLocalStorage();
    }
  }

  async saveToFileSystem() {
    try {
      const writable = await this.fileHandle.createWritable();
      await writable.write(JSON.stringify(this.data, null, 2));
      await writable.close();
    } catch (error) {
      console.error('File system save failed:', error);
      throw error;
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('galia-club-data', JSON.stringify(this.data));
  }

  // Data CRUD operations
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Athletes operations
  async addAthlete(athleteData) {
    const athlete = {
      id: this.generateId(),
      ...athleteData,
      weight: athleteData.weight || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.data.athletes.push(athlete);
    
    // Auto-generate payments
    await this.createAutomaticPayments(athlete.id);
    
    await this.saveData();
    return athlete;
  }

  async updateAthlete(id, updates) {
    const index = this.data.athletes.findIndex(a => a.id === id);
    if (index !== -1) {
      this.data.athletes[index] = {
        ...this.data.athletes[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      await this.saveData();
      return this.data.athletes[index];
    }
    return null;
  }

  async deactivateAthlete(id) {
    const athlete = this.data.athletes.find(a => a.id === id);
    if (athlete) {
      athlete.is_active = false;
      athlete.updated_at = new Date().toISOString();
      await this.saveData();
      return true;
    }
    return false;
  }

  getAthletes() {
    return this.data.athletes;
  }

  getActiveAthletes() {
    return this.data.athletes.filter(a => a.is_active);
  }

  // Coaches operations
  async addCoach(coachData) {
    const coach = {
      id: this.generateId(),
      ...coachData,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.data.coaches.push(coach);
    await this.saveData();
    return coach;
  }

  getCoaches() {
    return this.data.coaches;
  }

  // Groups operations
  async addGroup(groupData) {
    const group = {
      id: this.generateId(),
      ...groupData,
      current_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.data.groups.push(group);
    await this.saveData();
    return group;
  }

  getGroups() {
    return this.data.groups;
  }

  // Payments operations
  async createAutomaticPayments(athleteId) {
    const monthlyPayment = {
      id: this.generateId(),
      athlete_id: athleteId,
      payment_type: 'monthly',
      amount: 500,
      currency: 'DZD',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const yearlyPayment = {
      id: this.generateId(),
      athlete_id: athleteId,
      payment_type: 'yearly_license',
      amount: 300,
      currency: 'DZD',
      due_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    this.data.payments.push(monthlyPayment, yearlyPayment);
  }

  getPayments() {
    // Filter out payments for deactivated athletes
    const activeAthleteIds = this.getActiveAthletes().map(a => a.id);
    return this.data.payments.filter(p => activeAthleteIds.includes(p.athlete_id));
  }

  async markPaymentAsPaid(paymentId) {
    const payment = this.data.payments.find(p => p.id === paymentId);
    if (payment) {
      payment.status = 'paid';
      payment.paid_date = new Date().toISOString();
      await this.saveData();
      return true;
    }
    return false;
  }

  // Categories and Age calculation
  calculateCategory(birthDate) {
    const birthYear = new Date(birthDate).getFullYear();
    
    if (birthYear === 2017 || birthYear === 2018) {
      return "Poussin";
    } else if (birthYear === 2015 || birthYear === 2016) {
      return "Pupille";
    } else if (birthYear === 2013 || birthYear === 2014) {
      return "Benjamin(e)";
    } else if (birthYear === 2011 || birthYear === 2012) {
      return "Minim(e)";
    } else if (birthYear === 2009 || birthYear === 2010) {
      return "Cadet(e)";
    } else if (birthYear === 2007 || birthYear === 2008) {
      return "Junior(e)";
    } else if (birthYear <= 2006) {
      return "Senior(e)";
    } else {
      return "غير مصنف";
    }
  }

  getWeightCategory(weight, category) {
    // Weight categories by age group
    const weightLimits = {
      'Poussin': [30, 35, 40, 45, 50, '+50'],
      'Pupille': [35, 40, 45, 50, 55, '+55'],
      'Benjamin(e)': [40, 45, 50, 55, 60, '+60'],
      'Minim(e)': [45, 50, 55, 60, 65, '+65'],
      'Cadet(e)': [50, 55, 60, 65, 70, '+70'],
      'Junior(e)': [55, 60, 65, 70, 75, '+75'],
      'Senior(e)': [60, 65, 70, 75, 80, '+80']
    };

    const limits = weightLimits[category] || weightLimits['Senior(e)'];
    
    for (let i = 0; i < limits.length - 1; i++) {
      if (weight <= limits[i]) {
        return `-${limits[i]}`;
      }
    }
    return limits[limits.length - 1];
  }

  // Dashboard statistics
  getDashboardStats() {
    const activeAthletes = this.getActiveAthletes();
    const payments = this.getPayments();
    
    return {
      total_athletes: this.data.athletes.length,
      active_athletes: activeAthletes.length,
      total_coaches: this.data.coaches.filter(c => c.is_active).length,
      total_groups: this.data.groups.filter(g => g.is_active).length,
      pending_payments: payments.filter(p => p.status === 'pending').length,
      overdue_payments: payments.filter(p => p.status === 'pending' && new Date(p.due_date) < new Date()).length,
      monthly_revenue: payments.filter(p => p.payment_type === 'monthly' && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      yearly_license_revenue: payments.filter(p => p.payment_type === 'yearly_license' && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
    };
  }

  // Enhanced Excel Export
  async exportToExcel(selectedCategories = 'all') {
    const athletes = this.getActiveAthletes();
    
    let exportData = athletes.map(athlete => {
      const category = this.calculateCategory(athlete.date_of_birth);
      const weightCategory = athlete.weight ? this.getWeightCategory(athlete.weight, category) : 'N/A';
      
      return {
        athlete,
        category,
        weightCategory: `${category} ${weightCategory}`,
        fullData: {
          'Club Full Name': 'GALIA CLUB AIN SEFRA',
          'Club Short Name': 'GALIA CLUB',
          'Country': 'ALG',
          'First Name': athlete.first_name,
          'Last Name': athlete.last_name,
          'Sex': athlete.gender === 'male' ? 'M' : 'F',
          'Birthdate': new Date(athlete.date_of_birth).toISOString().split('T')[0],
          'Category Name': category,
          'Weight': athlete.weight || 'N/A',
          'Weight Category': weightCategory
        }
      };
    });

    // Filter by selected categories if not 'all'
    if (selectedCategories !== 'all') {
      exportData = exportData.filter(item => 
        selectedCategories.includes(item.category)
      );
    }

    return exportData.map(item => item.fullData);
  }

  // Settings management
  async updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    await this.saveData();
  }

  getSettings() {
    return this.data.settings;
  }

  // Sync with other devices (placeholder for network discovery)
  async syncData() {
    if (!this.isOnline) return;

    try {
      // This would implement device discovery and data sync
      console.log('Syncing with other devices...');
      
      // Register sync event with service worker
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-data');
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

export default new DataManager();