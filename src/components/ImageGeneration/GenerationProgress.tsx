import React from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  Clock, 
  Cpu, 
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { TaskProgress } from '@/types';

interface GenerationProgressProps {
  progress: number;
  message?: string;
  taskProgress?: TaskProgress | null;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  progress,
  message,
  taskProgress
}) => {
  const getProgressColor = () => {
    if (progress < 25) return 'bg-blue-500';
    if (progress < 50) return 'bg-purple-500';
    if (progress < 75) return 'bg-indigo-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (!taskProgress) return <Loader2 className="w-5 h-5 animate-spin" />;
    
    switch (taskProgress.status) {
      case 'queued':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'running':
        return <Cpu className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    if (taskProgress?.message) return taskProgress.message;
    if (message) return message;
    
    if (progress < 10) return 'Initializing generation...';
    if (progress < 30) return 'Processing prompt...';
    if (progress < 60) return 'Generating image...';
    if (progress < 90) return 'Applying final touches...';
    return 'Almost done...';
  };

  const formatTimeRemaining = (estimatedCompletion?: Date) => {
    if (!estimatedCompletion) return null;
    
    const now = new Date();
    const remaining = estimatedCompletion.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Completing...';
    
    const seconds = Math.round(remaining / 1000);
    if (seconds < 60) return `${seconds}s remaining`;
    
    const minutes = Math.round(seconds / 60);
    return `${minutes}m remaining`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      {/* Main Progress Circle */}
      <div className="relative w-32 h-32 mb-6">
        {/* Background Circle */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={getProgressColor()}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              strokeDasharray: '314.16',
              strokeDashoffset: `${314.16 * (1 - progress / 100)}`
            }}
          />
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: taskProgress?.status === 'running' ? 360 : 0 }}
            transition={{ 
              duration: 2, 
              repeat: taskProgress?.status === 'running' ? Infinity : 0,
              ease: 'linear' 
            }}
          >
            {getStatusIcon()}
          </motion.div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Generating Your Image
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getStatusMessage()}
        </p>
      </div>

      {/* Time Remaining */}
      {taskProgress?.estimatedCompletion && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Clock className="w-4 h-4" />
          <span>{formatTimeRemaining(taskProgress.estimatedCompletion)}</span>
        </div>
      )}

      {/* Progress Steps */}
      <div className="w-full max-w-md">
        <div className="flex justify-between mb-2">
          {['Queue', 'Process', 'Generate', 'Complete'].map((step, index) => {
            const stepProgress = (index + 1) * 25;
            const isActive = progress >= stepProgress - 25;
            const isCompleted = progress >= stepProgress;
            
            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Zap className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {step}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-2 rounded-full ${getProgressColor()}`}
          />
        </div>
      </div>

      {/* Task Details */}
      {taskProgress && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg w-full max-w-md">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Task ID:</span>
              <span className="font-mono text-xs text-gray-900 dark:text-white">
                {taskProgress.taskId.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`capitalize font-medium ${
                taskProgress.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                taskProgress.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                taskProgress.status === 'running' ? 'text-blue-600 dark:text-blue-400' :
                'text-amber-600 dark:text-amber-400'
              }`}>
                {taskProgress.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Fun Facts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-6 text-center"
      >
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: Higher quality settings take longer but produce better results
        </p>
      </motion.div>
    </div>
  );
};