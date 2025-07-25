import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  CreditCard,
  TrendingUp,
  Calendar,
  Trophy,
  DollarSign,
  Activity,
  AlertCircle,
  Star,
  Award,
  UserPlus,
  User,
  UserMinus,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Shield
} from 'lucide-react';

// Types
interface Athlete {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  phone?: string;
  parent_phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  medical_notes?: string;
  current_belt: string;
  join_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  specialization?: string;
  belt_level: string;
  years_experience?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  coach_id: string;
  schedule?: string;
  capacity: number;
  current_count: number;
  age_group?: string;
  belt_level_range?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  athlete_id: string;
  amount: number;
  payment_type: 'monthly' | 'yearly_license';
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface BeltTest {
  id: string;
  athlete_id: string;
  current_belt: string;
  target_belt: string;
  test_date: string;
  examiner_id: string;
  status: 'scheduled' | 'passed' | 'failed' | 'cancelled';
  score?: number;
  notes?: string;
  requirements_met?: any;
  created_at: string;
  updated_at: string;
}

interface BeltProgression {
  id: string;
  athlete_id: string;
  from_belt: string;
  to_belt: string;
  test_id: string;
  promotion_date: string;
  notes?: string;
  created_at: string;
}

interface DashboardData {
  total_athletes: number;
  active_athletes: number;
  total_coaches: number;
  total_groups: number;
  pending_payments: number;
  overdue_payments: number;
  monthly_revenue: number;
  yearly_license_revenue: number;
  belt_distribution: Array<{ _id: string; count: number }>;
  upcoming_tests: number;
}

const API_BASE_URL = 'http://localhost:5001/api';

const BELT_LEVELS = [
  { value: 'white', label: 'White', color: 'bg-gray-100 text-gray-800' },
  { value: 'yellow', label: 'Yellow', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-100 text-orange-800' },
  { value: 'green', label: 'Green', color: 'bg-green-100 text-green-800' },
  { value: 'blue', label: 'Blue', color: 'bg-blue-100 text-blue-800' },
  { value: 'brown', label: 'Brown', color: 'bg-amber-100 text-amber-800' },
  { value: 'black_1st', label: 'Black 1st Dan', color: 'bg-gray-900 text-white' },
  { value: 'black_2nd', label: 'Black 2nd Dan', color: 'bg-gray-900 text-white' },
  { value: 'black_3rd', label: 'Black 3rd Dan', color: 'bg-gray-900 text-white' },
  { value: 'black_4th', label: 'Black 4th Dan', color: 'bg-gray-900 text-white' },
  { value: 'black_5th', label: 'Black 5th Dan', color: 'bg-gray-900 text-white' },
];

const getBeltDisplay = (belt: string) => {
  const beltInfo = BELT_LEVELS.find(b => b.value === belt);
  return beltInfo || { value: belt, label: belt, color: 'bg-gray-100 text-gray-800' };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [beltTests, setBeltTests] = useState<BeltTest[]>([]);
  const [beltProgressions, setBeltProgressions] = useState<BeltProgression[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch functions
  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    }
  };

  const fetchAthletes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/athletes`);
      if (!response.ok) throw new Error('Failed to fetch athletes');
      const data = await response.json();
      setAthletes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch athletes');
    }
  };

  const fetchCoaches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/coaches`);
      if (!response.ok) throw new Error('Failed to fetch coaches');
      const data = await response.json();
      setCoaches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coaches');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/groups`);
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    }
  };

  const fetchBeltTests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/belt-tests`);
      if (!response.ok) throw new Error('Failed to fetch belt tests');
      const data = await response.json();
      setBeltTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch belt tests');
    }
  };

  const fetchBeltProgressions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/belt-progressions`);
      if (!response.ok) throw new Error('Failed to fetch belt progressions');
      const data = await response.json();
      setBeltProgressions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch belt progressions');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboard(),
        fetchAthletes(),
        fetchCoaches(),
        fetchGroups(),
        fetchPayments(),
        fetchBeltTests(),
        fetchBeltProgressions()
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Athletes</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.total_athletes || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Coaches</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.total_coaches || 0}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.pending_payments || 0}</p>
            </div>
            <CreditCard className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Tests</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.upcoming_tests || 0}</p>
            </div>
            <Trophy className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Belt Distribution</h3>
          <div className="space-y-3">
            {dashboardData?.belt_distribution?.map((item) => {
              const beltInfo = getBeltDisplay(item._id);
              return (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${beltInfo.color}`}>
                      {beltInfo.label}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{item.count} athletes</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Revenue Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Revenue</span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(dashboardData?.monthly_revenue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Yearly License Revenue</span>
              <span className="text-lg font-semibold text-blue-600">
                {formatCurrency(dashboardData?.yearly_license_revenue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overdue Payments</span>
              <span className="text-lg font-semibold text-red-600">
                {dashboardData?.overdue_payments || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Athletes Component
  const Athletes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Athletes</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <span>Add Athlete</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Belt Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {athletes.map((athlete) => {
                const beltInfo = getBeltDisplay(athlete.current_belt);
                return (
                  <tr key={athlete.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {athlete.first_name} {athlete.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {athlete.gender} • {new Date().getFullYear() - new Date(athlete.date_of_birth).getFullYear()} years old
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${beltInfo.color}`}>
                        {beltInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {athlete.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(athlete.join_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Belt Tests Component
  const BeltTests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Belt Tests</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Trophy className="h-4 w-4" />
          <span>Schedule Test</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Athlete
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Belt Progression
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {beltTests.map((test) => {
                const athlete = athletes.find(a => a.id === test.athlete_id);
                const currentBelt = getBeltDisplay(test.current_belt);
                const targetBelt = getBeltDisplay(test.target_belt);
                
                return (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {athlete ? `${athlete.first_name} ${athlete.last_name}` : 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentBelt.color}`}>
                          {currentBelt.label}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${targetBelt.color}`}>
                          {targetBelt.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(test.test_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        test.status === 'passed' ? 'bg-green-100 text-green-800' :
                        test.status === 'failed' ? 'bg-red-100 text-red-800' :
                        test.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.score ? `${test.score}/100` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {test.status === 'scheduled' && (
                        <>
                          <button className="text-green-600 hover:text-green-900 mr-3">Pass</button>
                          <button className="text-red-600 hover:text-red-900">Fail</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Belt Progressions Component
  const BeltProgressions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Belt Progressions</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Athlete
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Belt Progression
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promotion Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {beltProgressions.map((progression) => {
                const athlete = athletes.find(a => a.id === progression.athlete_id);
                const fromBelt = getBeltDisplay(progression.from_belt);
                const toBelt = getBeltDisplay(progression.to_belt);
                
                return (
                  <tr key={progression.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {athlete ? `${athlete.first_name} ${athlete.last_name}` : 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${fromBelt.color}`}>
                          {fromBelt.label}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${toBelt.color}`}>
                          {toBelt.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(progression.promotion_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {progression.notes || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Galia Club Ain Sefra</h1>
            </div>
            <div className="text-sm text-gray-500">
              Karate Management System
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'athletes', label: 'Athletes', icon: Users },
              { id: 'belt-tests', label: 'Belt Tests', icon: Trophy },
              { id: 'belt-progressions', label: 'Belt Progressions', icon: Award },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'athletes' && <Athletes />}
          {activeTab === 'belt-tests' && <BeltTests />}
          {activeTab === 'belt-progressions' && <BeltProgressions />}
        </div>
      </main>
    </div>
  );
}

export default App;