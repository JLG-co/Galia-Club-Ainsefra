import React, { useState } from 'react';
import { Users, UserCheck, Users as GroupIcon, CreditCard, Wifi, Menu, X } from 'lucide-react';
import Header from './components/Header';
import Athletes from './components/Athletes';
import Coaches from './components/Coaches';
import Groups from './components/Groups';
import Payments from './components/Payments';
import DataSync from './components/DataSync';

function App() {
  const [activeTab, setActiveTab] = useState('athletes');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'athletes', name: 'Athletes', icon: Users },
    { id: 'coaches', name: 'Coaches', icon: UserCheck },
    { id: 'groups', name: 'Groups', icon: GroupIcon },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'sync', name: 'Data Sync', icon: Wifi }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'athletes':
        return <Athletes />;
      case 'coaches':
        return <Coaches />;
      case 'groups':
        return <Groups />;
      case 'payments':
        return <Payments />;
      case 'sync':
        return <DataSync />;
      default:
        return <Athletes />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-blue-600 text-white rounded-md shadow-lg"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar */}
        <div className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-40 w-64 h-screen bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
          <div className="p-6 pt-8">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <main className="p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;