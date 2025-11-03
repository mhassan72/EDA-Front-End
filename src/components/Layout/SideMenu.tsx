import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  ImageIcon, 
  BookOpen, 
  Menu, 
  X, 
  Plus,
  History,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

export interface ChatSession {
  id: string;
  title: string;
  type: 'general' | 'image' | 'educational';
  lastMessage: string;
  timestamp: Date;
  isActive?: boolean;
}

export interface SideMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  currentMode: 'general' | 'image' | 'educational';
  onModeChange: (mode: 'general' | 'image' | 'educational') => void;
  sessions: ChatSession[];
  onSessionSelect: (sessionId: string) => void;
  onNewSession: (type: 'general' | 'image' | 'educational') => void;
  className?: string;
}

const modeConfig = {
  general: {
    icon: MessageCircle,
    label: 'General Chat',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  image: {
    icon: ImageIcon,
    label: 'Image Generation',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  educational: {
    icon: BookOpen,
    label: 'Educational Mode',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800'
  }
};

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onToggle,
  currentMode,
  onModeChange,
  sessions,
  onSessionSelect,
  onNewSession,
  className
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    image: true,
    educational: true
  });

  // Group sessions by type
  const sessionsByType = sessions.reduce((acc, session) => {
    if (!acc[session.type]) {
      acc[session.type] = [];
    }
    acc[session.type].push(session);
    return acc;
  }, {} as Record<string, ChatSession[]>);

  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle side menu"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
          width: isOpen ? 320 : 0
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 200
        }}
        className={clsx(
          'fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 overflow-hidden',
          'lg:relative lg:translate-x-0 lg:w-80',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Assistant
              </h2>
              <button
                onClick={onToggle}
                className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Chat Modes
            </h3>
            <div className="space-y-2">
              {Object.entries(modeConfig).map(([mode, config]) => {
                const Icon = config.icon;
                const isActive = currentMode === mode;
                
                return (
                  <button
                    key={mode}
                    onClick={() => onModeChange(mode as any)}
                    className={clsx(
                      'w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200',
                      isActive
                        ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNewSession(mode as any);
                      }}
                      className={clsx(
                        'p-1 rounded-md transition-colors',
                        isActive
                          ? 'hover:bg-white/20 dark:hover:bg-black/20'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                      )}
                      aria-label={`New ${config.label.toLowerCase()} session`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session History */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <History className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Recent Sessions
                </h3>
              </div>

              {Object.entries(modeConfig).map(([type, config]) => {
                const typeSessions = sessionsByType[type] || [];
                const isExpanded = expandedSections[type];
                const Icon = config.icon;

                if (typeSessions.length === 0) return null;

                return (
                  <div key={type} className="mb-4">
                    <button
                      onClick={() => toggleSection(type)}
                      className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-3 h-3 ${config.color}`} />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {config.label} ({typeSessions.length})
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-5 mt-2 space-y-1">
                            {typeSessions.map((session) => (
                              <button
                                key={session.id}
                                onClick={() => onSessionSelect(session.id)}
                                className={clsx(
                                  'w-full text-left p-2 rounded-md transition-colors',
                                  session.isActive
                                    ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                )}
                              >
                                <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                                  {truncateText(session.title)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  {truncateText(session.lastMessage, 40)}
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  {formatTimestamp(session.timestamp)}
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {sessions.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No sessions yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Start a conversation to see your history here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};