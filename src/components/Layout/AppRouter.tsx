import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import { ImageGenerationInterface } from '../ImageGeneration/ImageGenerationInterface';
import { CreditBalance } from '../Credit/CreditBalance';
import { CreditBalance as CreditBalanceType } from '../../types';

export interface AppRouterProps {
  creditBalance: number;
  creditBalanceData: CreditBalanceType | undefined;
  onInsufficientCredits: () => void;
  onTopUp: () => void;
}

const ChatModeComponent: React.FC = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const { state, setMode } = useNavigation();

  useEffect(() => {
    if (mode && ['general', 'image', 'educational'].includes(mode)) {
      if (state.currentMode !== mode) {
        setMode(mode as 'general' | 'image' | 'educational');
      }
    } else {
      // Invalid mode, redirect to general
      navigate('/chat/general', { replace: true });
    }
  }, [mode, state.currentMode, setMode, navigate]);

  const modeConfig = {
    general: {
      title: 'General Chat',
      description: 'Have conversations with AI on any topic',
      icon: '💬'
    },
    image: {
      title: 'Image Generation',
      description: 'Create images using AI-powered generation',
      icon: '🎨'
    },
    educational: {
      title: 'Educational Mode',
      description: 'Learn with structured AI tutoring and explanations',
      icon: '📚'
    }
  };

  const currentConfig = mode && modeConfig[mode as keyof typeof modeConfig] 
    ? modeConfig[mode as keyof typeof modeConfig]
    : modeConfig.general;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{currentConfig.icon}</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {currentConfig.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {currentConfig.description}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The {currentConfig.title.toLowerCase()} interface will be implemented in upcoming tasks.
            </p>
            
            {/* Current Session Info */}
            {state.currentSessionId && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Current Session
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Session ID: {state.currentSessionId}
                </p>
              </div>
            )}

            {/* Mode Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {state.sessions.filter(s => s.type === 'general').length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  General Sessions
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {state.sessions.filter(s => s.type === 'image').length}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Image Sessions
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {state.sessions.filter(s => s.type === 'educational').length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Educational Sessions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppRouter: React.FC<AppRouterProps> = ({
  creditBalance,
  creditBalanceData,
  onInsufficientCredits,
  onTopUp
}) => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={<Navigate to="/chat/general" replace />} 
      />
      <Route 
        path="/chat/:mode" 
        element={<ChatModeComponent />} 
      />
      <Route 
        path="/image-generation" 
        element={
          <ImageGenerationInterface
            creditBalance={creditBalance}
            onInsufficientCredits={onInsufficientCredits}
          />
        } 
      />
      <Route 
        path="/credits" 
        element={
          <CreditBalance 
            balance={creditBalanceData}
            onTopUp={onTopUp}
          />
        } 
      />
      {/* Fallback route */}
      <Route 
        path="*" 
        element={<Navigate to="/chat/general" replace />} 
      />
    </Routes>
  );
};