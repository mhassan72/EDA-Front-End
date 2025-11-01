import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ImageIcon, 
  CreditCard, 
  User, 
  LogOut,
  Coins
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavigationProps {
  user: FirebaseUser;
  creditBalance: number;
  onSignOut: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  user,
  creditBalance,
  onSignOut
}) => {
  const location = useLocation();

  const navItems = [
    {
      path: '/image-generation',
      label: 'Image Generation',
      icon: ImageIcon
    },
    {
      path: '/credits',
      label: 'Credits',
      icon: CreditCard
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Assistant
              </h1>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-purple-100 dark:bg-purple-900/20 rounded-lg -z-10"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* Credit Balance */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {creditBalance.toLocaleString()}
              </span>
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                    {user.email}
                  </div>
                  <button
                    onClick={onSignOut}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};