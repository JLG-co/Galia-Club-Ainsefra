import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-gradient-to-r from-red-800 to-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-800 font-bold text-xl">G</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Galia Club Ain Sefra</h1>
              <p className="text-red-100 text-sm">Karate Club Management System</p>
            </div>
          </div>
        </div>
        <nav className="mt-4">
          <div className="flex space-x-1">
            {['dashboard', 'athletes', 'coaches', 'groups', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white text-red-800 shadow-md'
                    : 'text-red-100 hover:text-white hover:bg-red-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

const Dashboard = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Athletes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_athletes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Athletes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active_athletes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Coaches</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_coaches}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Groups</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_groups}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-800 font-medium">Pending Payments</span>
              <span className="text-2xl font-bold text-yellow-800">{stats.pending_payments}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-red-800 font-medium">Overdue Payments</span>
              <span className="text-2xl font-bold text-red-800">{stats.overdue_payments}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-green-800 font-medium">Monthly Revenue</span>
              <span className="text-xl font-bold text-green-800">{stats.monthly_revenue} DZD</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800 font-medium">License Revenue</span>
              <span className="text-xl font-bold text-blue-800">{stats.yearly_license_revenue} DZD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white p-8 rounded-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Welcome to Galia Club Ain Sefra</h2>
            <p className="text-red-100 text-lg mb-6">
              Professional karate club management system to organize athletes, track payments, 
              and manage training groups efficiently.
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
              className="w-64 h-48 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const AthleteForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    parent_phone: '',
    address: '',
    belt_level: 'White'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date_of_birth: initialData.date_of_birth ? new Date(initialData.date_of_birth).toISOString().split('T')[0] : ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date_of_birth: new Date(formData.date_of_birth).toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {initialData ? 'Edit Athlete' : 'Add New Athlete'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />

          <input
            type="tel"
            placeholder="Parent Phone Number"
            value={formData.parent_phone}
            onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />

          <textarea
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows="3"
          />

          <select
            value={formData.belt_level}
            onChange={(e) => setFormData({...formData, belt_level: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="White">White Belt</option>
            <option value="Yellow">Yellow Belt</option>
            <option value="Orange">Orange Belt</option>
            <option value="Green">Green Belt</option>
            <option value="Blue">Blue Belt</option>
            <option value="Brown">Brown Belt</option>
            <option value="Black">Black Belt</option>
          </select>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              {initialData ? 'Update' : 'Add'} Athlete
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Athletes = () => {
  const [athletes, setAthletes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAthletes = async () => {
    try {
      const response = await axios.get(`${API}/athletes`);
      setAthletes(response.data);
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
      await axios.post(`${API}/athletes`, athleteData);
      setShowForm(false);
      fetchAthletes();
    } catch (error) {
      console.error('Error adding athlete:', error);
      alert('Error adding athlete. Please try again.');
    }
  };

  const handleEditAthlete = async (athleteData) => {
    try {
      await axios.put(`${API}/athletes/${editingAthlete.id}`, athleteData);
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
        await axios.delete(`${API}/athletes/${athleteId}`);
        fetchAthletes();
      } catch (error) {
        console.error('Error deactivating athlete:', error);
        alert('Error deactivating athlete. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Athletes Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Athlete</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belt Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {athletes.map((athlete) => {
                const age = Math.floor((new Date() - new Date(athlete.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000));
                return (
                  <tr key={athlete.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-semibold">
                            {athlete.first_name[0]}{athlete.last_name[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {athlete.first_name} {athlete.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{athlete.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{age} years</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {athlete.belt_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{athlete.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        athlete.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {athlete.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingAthlete(athlete)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeactivateAthlete(athlete.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
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
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No athletes</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new athlete to the club.</p>
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

// Simple placeholder components for other tabs
const Coaches = () => <div className="bg-white p-6 rounded-xl shadow-lg">
  <h2 className="text-2xl font-bold mb-4">Coaches Management</h2>
  <p className="text-gray-600">Coaches management functionality coming soon...</p>
</div>;

const Groups = () => <div className="bg-white p-6 rounded-xl shadow-lg">
  <h2 className="text-2xl font-bold mb-4">Groups Management</h2>
  <p className="text-gray-600">Groups management functionality coming soon...</p>
</div>;

const Payments = () => <div className="bg-white p-6 rounded-xl shadow-lg">
  <h2 className="text-2xl font-bold mb-4">Payments Management</h2>
  <p className="text-gray-600">Payments management functionality coming soon...</p>
</div>;

function App() {
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
      const response = await axios.get(`${API}/dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'athletes':
        return <Athletes />;
      case 'coaches':
        return <Coaches />;
      case 'groups':
        return <Groups />;
      case 'payments':
        return <Payments />;
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;