import React, { useState, useEffect } from 'react';
import './App.css';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Header from './components/Header';
import AthleteForm from './components/AthleteForm';
import LoadingSpinner from './components/LoadingSpinner';
import dataManager from './utils/dataManager';

const Dashboard = ({ stats }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl shadow-lg border-l-4 border-blue-500 transform hover:scale-105 transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
        }`}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Athletes</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total_athletes}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg border-l-4 border-green-500 transform hover:scale-105 transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
        }`}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Athletes</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.active_athletes}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg border-l-4 border-purple-500 transform hover:scale-105 transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
        }`}>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Coaches</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total_coaches}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg border-l-4 border-orange-500 transform hover:scale-105 transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
        }`}>
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Groups</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total_groups}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span className="text-yellow-800 dark:text-yellow-400 font-medium">Pending Payments</span>
              <span className="text-2xl font-bold text-yellow-800 dark:text-yellow-400">{stats.pending_payments}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="text-red-800 dark:text-red-400 font-medium">Overdue Payments</span>
              <span className="text-2xl font-bold text-red-800 dark:text-red-400">{stats.overdue_payments}</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revenue Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-green-800 dark:text-green-400 font-medium">Monthly Revenue</span>
              <span className="text-xl font-bold text-green-800 dark:text-green-400">{stats.monthly_revenue} DZD</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-blue-800 dark:text-blue-400 font-medium">License Revenue</span>
              <span className="text-xl font-bold text-blue-800 dark:text-blue-400">{stats.yearly_license_revenue} DZD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-800 to-red-600 dark:from-red-900 dark:to-red-700 text-white p-8 rounded-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Welcome to Galia Club Ain Sefra</h2>
            <p className="text-red-100 dark:text-red-200 text-lg mb-6">
              Modern karate club management system with offline capabilities, 
              data synchronization, and enhanced features for the digital age.
            </p>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.active_athletes}</div>
                <div className="text-red-200 text-sm">Active Athletes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total_coaches}</div>
                <div className="text-red-200 text-sm">Expert Coaches</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1525198104776-f6e8a873f9b7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxrYXJhdGV8ZW58MHx8fHwxNzUzMDE4MTIzfDA&ixlib=rb-4.1.0&q=85"
              alt="Karate Training"
              className="w-64 h-48 object-cover rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Athletes = () => {
  const { isDarkMode } = useTheme();
  const [athletes, setAthletes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAthletes = async () => {
    try {
      const athletesData = dataManager.getAthletes();
      setAthletes(athletesData);
    } catch (error) {
      console.error('Error fetching athletes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const handleAddAthlete = async (athleteData) => {
    try {
      await dataManager.addAthlete(athleteData);
      setShowForm(false);
      fetchAthletes();
    } catch (error) {
      console.error('Error adding athlete:', error);
      alert('Error adding athlete. Please try again.');
    }
  };

  const handleEditAthlete = async (athleteData) => {
    try {
      await dataManager.updateAthlete(editingAthlete.id, athleteData);
      setEditingAthlete(null);
      fetchAthletes();
    } catch (error) {
      console.error('Error updating athlete:', error);
      alert('Error updating athlete. Please try again.');
    }
  };

  const handleDeactivateAthlete = async (athleteId) => {
    if (window.confirm('Are you sure you want to deactivate this athlete?')) {
      try {
        await dataManager.deactivateAthlete(athleteId);
        fetchAthletes();
      } catch (error) {
        console.error('Error deactivating athlete:', error);
        alert('Error deactivating athlete. Please try again.');
      }
    }
  };

  const calculateCategory = (birthDate) => {
    return dataManager.calculateCategory(birthDate);
  };

  const getWeightCategory = (weight, category) => {
    return dataManager.getWeightCategory(weight, category);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Athletes Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Athlete</span>
        </button>
      </div>

      <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Name</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Age</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Category</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Weight</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Belt Level</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Phone</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {athletes.map((athlete) => {
                const age = Math.floor((new Date() - new Date(athlete.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000));
                const category = calculateCategory(athlete.date_of_birth);
                const weightCategory = athlete.weight ? getWeightCategory(athlete.weight, category) : 'N/A';
                
                return (
                  <tr key={athlete.id} className={`hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-150`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            {athlete.first_name[0]}{athlete.last_name[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {athlete.first_name} {athlete.last_name}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{athlete.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{age} years</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {athlete.weight ? `${athlete.weight}kg (${weightCategory})` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        {athlete.belt_level}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{athlete.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        athlete.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {athlete.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingAthlete(athlete)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeactivateAthlete(athlete.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {athletes.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No athletes</h3>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Get started by adding a new athlete to the club.</p>
        </div>
      )}

      {showForm && (
        <AthleteForm
          onSubmit={handleAddAthlete}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingAthlete && (
        <AthleteForm
          initialData={editingAthlete}
          onSubmit={handleEditAthlete}
          onCancel={() => setEditingAthlete(null)}
        />
      )}
    </div>
  );
};

const PlaceholderComponent = ({ title, description }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="text-center py-12">
      <div className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} mb-4`}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
      <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>
      <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
      <div className="mt-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          🚧 Under Development
        </span>
      </div>
    </div>
  );
};

function AppContent() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    total_athletes: 0,
    active_athletes: 0,
    total_coaches: 0,
    total_groups: 0,
    pending_payments: 0,
    overdue_payments: 0,
    monthly_revenue: 0,
    yearly_license_revenue: 0
  });

  const fetchDashboardStats = async () => {
    try {
      const dashboardStats = dataManager.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    
    // Set up periodic stats refresh
    const interval = setInterval(fetchDashboardStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'athletes':
        return <Athletes />;
      case 'coaches':
        return <PlaceholderComponent title="Coaches Management" description="Enhanced coaches management with modern UI coming soon!" />;
      case 'groups':
        return <PlaceholderComponent title="Groups Management" description="Advanced group management system in development!" />;
      case 'payments':
        return <PlaceholderComponent title="Payments System" description="Enhanced payment tracking with offline support coming soon!" />;
      case 'categories':
        return <PlaceholderComponent title="Categories & Export" description="Advanced categorization and Excel export features in development!" />;
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;