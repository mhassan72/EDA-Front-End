import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface CostEstimatorProps {
  estimatedCost: number;
  creditBalance: number;
  hasInsufficientCredits: boolean;
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({
  estimatedCost,
  creditBalance,
  hasInsufficientCredits
}) => {
  const remainingCredits = creditBalance - estimatedCost;
  const usagePercentage = (estimatedCost / creditBalance) * 100;

  const getStatusColor = () => {
    if (hasInsufficientCredits) return 'text-red-600 dark:text-red-400';
    if (usagePercentage > 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusIcon = () => {
    if (hasInsufficientCredits) return <AlertTriangle className="w-4 h-4" />;
    if (usagePercentage > 50) return <TrendingUp className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusMessage = () => {
    if (hasInsufficientCredits) return 'Insufficient credits';
    if (usagePercentage > 75) return 'High cost generation';
    if (usagePercentage > 50) return 'Moderate cost';
    return 'Low cost generation';
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-w-[200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Cost Estimate
          </span>
        </div>
        <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Estimated Cost:
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {estimatedCost.toLocaleString()} credits
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Current Balance:
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {creditBalance.toLocaleString()} credits
          </span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              After Generation:
            </span>
            <span className={`font-medium ${getStatusColor()}`}>
              {hasInsufficientCredits 
                ? `Need ${Math.abs(remainingCredits).toLocaleString()} more`
                : `${remainingCredits.toLocaleString()} credits`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Usage
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {Math.min(usagePercentage, 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-2 rounded-full ${
              hasInsufficientCredits
                ? 'bg-red-500'
                : usagePercentage > 75
                ? 'bg-amber-500'
                : usagePercentage > 50
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className={`mt-2 text-xs ${getStatusColor()}`}>
        {getStatusMessage()}
      </div>

      {/* Warning for high usage */}
      {usagePercentage > 75 && !hasInsufficientCredits && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-700 dark:text-amber-300"
        >
          This generation will use a significant portion of your credits.
        </motion.div>
      )}

      {/* Insufficient credits warning */}
      {hasInsufficientCredits && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300"
        >
          You need to add more credits to proceed with this generation.
        </motion.div>
      )}
    </div>
  );
};