import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  History,
  Settings,
  Bell,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { CreditBalance as CreditBalanceType } from '@/types';
import { creditService } from '@/services/credit';
import { format, subDays, startOfDay } from 'date-fns';

interface CreditDashboardProps {
  balance: CreditBalanceType | undefined;
  onTopUp: () => void;
  onViewHistory: () => void;
  onManageNotifications: () => void;
}

export const CreditDashboard: React.FC<CreditDashboardProps> = ({
  balance,
  onTopUp,
  onViewHistory,
  onManageNotifications
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Get usage analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['creditAnalytics', selectedPeriod],
    queryFn: () => creditService.getUsageAnalytics(selectedPeriod),
    enabled: !!balance,
  });

  // Get recent notifications
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => creditService.getNotifications(1, 5),
    enabled: !!balance,
  });

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  if (!balance) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const balancePercentage = balance.reservedCredits > 0 
    ? (balance.availableBalance / balance.currentBalance) * 100 
    : 100;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Credit Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your AI assistant credit usage and manage payments
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onManageNotifications}
            className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications && notifications.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.unreadCount}
              </span>
            )}
          </button>
          
          <button
            onClick={onTopUp}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credits</span>
          </button>
        </div>
      </div>

      {/* Balance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Current Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Coins className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Available</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {balance.availableBalance.toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Balance Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Usage</span>
              <span className="text-gray-900 dark:text-white">{balancePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${balancePercentage}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Reserved Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Reserved</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {balance.reservedCredits.toLocaleString()}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Credits reserved for active tasks
          </p>
        </motion.div>

        {/* Lifetime Earned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Earned</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {balance.lifetimeCreditsEarned.toLocaleString()}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All-time credits earned
          </p>
        </motion.div>

        {/* Lifetime Spent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingDown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Spent</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {balance.lifetimeCreditsSpent.toLocaleString()}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All-time credits used
          </p>
        </motion.div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usage Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Usage Trends
              </h3>
            </div>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="day">Last 7 Days</option>
              <option value="week">Last 4 Weeks</option>
              <option value="month">Last 12 Months</option>
              <option value="year">Last 3 Years</option>
            </select>
          </div>

          {analyticsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : analytics?.dailyUsage ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} credits`,
                    name === 'spent' ? 'Spent' : 'Earned'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="spent" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="earned" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No usage data available
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Usage by Category
            </h3>
          </div>

          {analyticsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : analytics?.categoryBreakdown ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} credits`} />
                </RechartsPieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2">
                {analytics.categoryBreakdown.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={onTopUp}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Add Credits</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Purchase more credits</div>
              </div>
            </button>
            
            <button
              onClick={onViewHistory}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">View History</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Transaction history</div>
              </div>
            </button>
            
            <button
              onClick={onManageNotifications}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Settings className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Settings</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Manage preferences</div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Notifications
            </h3>
            {notifications && notifications.unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full">
                {notifications.unreadCount} unread
              </span>
            )}
          </div>

          {notifications?.notifications && notifications.notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.isRead
                      ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${
                      notification.priority === 'critical' ? 'bg-red-100 dark:bg-red-900' :
                      notification.priority === 'high' ? 'bg-amber-100 dark:bg-amber-900' :
                      'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {notification.type === 'low_balance' ? (
                        <AlertCircle className={`w-4 h-4 ${
                          notification.priority === 'critical' ? 'text-red-600 dark:text-red-400' :
                          'text-amber-600 dark:text-amber-400'
                        }`} />
                      ) : notification.type === 'payment_success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {notification.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {format(new Date(notification.timestamp), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent notifications</p>
            </div>
          )}
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              balance.accountStatus === 'active' ? 'bg-green-500' : 
              balance.accountStatus === 'limited' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
              <div className="font-medium text-gray-900 dark:text-white capitalize">
                {balance.accountStatus}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {format(new Date(balance.lastUpdated), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Member Since</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {format(new Date(balance.lastUpdated), 'MMM yyyy')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};