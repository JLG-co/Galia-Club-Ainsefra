import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Header = ({ activeTab, setActiveTab }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'athletes', label: 'Athletes', icon: '🥋' },
    { id: 'coaches', label: 'Coaches', icon: '👨‍🏫' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'categories', label: 'Categories', icon: '📋' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-red-800 to-red-600 dark:from-red-900 dark:to-red-700 text-white shadow-lg transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
              <span className="text-red-800 dark:text-red-400 font-bold text-xl">G</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Galia Club Ain Sefra</h1>
              <p className="text-red-100 dark:text-red-200 text-sm">Modern Karate Club Management System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Online/Offline Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${navigator.onLine ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-sm hidden sm:inline">
                {navigator.onLine ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-red-700 hover:bg-red-600 dark:bg-red-800 dark:hover:bg-red-700 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-red-700 hover:bg-red-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className={`mt-4 ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col md:flex-row md:space-x-1 space-y-1 md:space-y-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-red-800 dark:text-red-400 shadow-md transform scale-105'
                    : 'text-red-100 dark:text-red-200 hover:text-white hover:bg-red-700 dark:hover:bg-red-600'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="capitalize">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;