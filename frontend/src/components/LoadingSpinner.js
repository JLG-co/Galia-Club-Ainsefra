import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'red' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    red: 'border-red-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    purple: 'border-purple-600'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 ${sizeClasses[size]} ${colorClasses[color]} border-t-transparent`}>
    </div>
  );
};

export default LoadingSpinner;