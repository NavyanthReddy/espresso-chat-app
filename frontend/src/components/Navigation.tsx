import React from 'react';
import { User } from '../types';
import { signOut } from '../services/firebase';

interface NavigationProps {
  user: User;
}

const Navigation: React.FC<NavigationProps> = ({ user }) => {
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Chat App</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                className="h-8 w-8 rounded-full"
                src={user.photoURL}
                alt={user.name}
              />
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 