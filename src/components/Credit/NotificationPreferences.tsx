import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  BarChart3,
  AlertTriangle,
  Check,
  X,
  Save,
  RefreshCw
} from 'lucide-react';
import { creditService } from '@/services/credit';
import toast from 'react-hot-toast';

interface NotificationPreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  isOpen,
  onClose
}) => {
  const [preferences, setPreferences] = useState({
    lowBalanceThreshold: 100,
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true
  });

  const queryClient = useQueryClient();

  // Get current preferences
  const { data: currentPreferences, isLoading } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: () => creditService.getNotificationPreferences(),
    enabled: isOpen,
  });

  // Update preferences when data loads
  useEffect(() => {
    if (currentPreferences) {
      setPreferences(currentPreferences);
    }
  }, [currentPreferences]);

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (newPreferences: typeof preferences) => 
      creditService.updateNotificationPreferences(newPreferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Notification preferences updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update preferences');
    },
  });

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const handleReset = () => {
    if (currentPreferences) {
      setPreferences(currentPreferences);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customize how and when you receive notifications
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Low Balance Threshold */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Low Balance Alert
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified when your credit balance falls below this threshold
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Threshold (credits)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={preferences.lowBalanceThreshold}
                      onChange={(e) => setPreferences(prev => ({ 
                        ...prev, 
                        lowBalanceThreshold: parseInt(e.target.value) 
                      }))}
                      className="flex-1"
                    />
                    <div className="w-20">
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={preferences.lowBalanceThreshold}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          lowBalanceThreshold: parseInt(e.target.value) || 10 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>10</span>
                    <span>1000</span>
                  </div>
                </div>
              </div>

              {/* Notification Channels */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Notification Channels
                </h3>
                
                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Email Notifications
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setPreferences(prev => ({ 
                        ...prev, 
                        emailNotifications: !prev.emailNotifications 
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.emailNotifications 
                          ? 'bg-purple-600' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Push Notifications
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive browser push notifications
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setPreferences(prev => ({ 
                        ...prev, 
                        pushNotifications: !prev.pushNotifications 
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.pushNotifications 
                          ? 'bg-purple-600' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Weekly Reports */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Weekly Reports
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive weekly usage and spending reports
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setPreferences(prev => ({ 
                        ...prev, 
                        weeklyReports: !prev.weeklyReports 
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.weeklyReports 
                          ? 'bg-purple-600' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  What You'll Be Notified About
                </h3>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Low credit balance alerts
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Payment confirmations and receipts
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Task completion notifications
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Account security alerts
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Weekly usage and spending summaries
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Privacy & Control
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      You can change these preferences at any time. We respect your privacy and 
                      will never share your notification preferences with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updatePreferencesMutation.isPending}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
            >
              {updatePreferencesMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};