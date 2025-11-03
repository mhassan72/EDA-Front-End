import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { SideMenu } from './SideMenu';
import { useSideMenu } from '../../hooks/useSideMenu';
import { useNavigation } from '../../contexts/NavigationContext';

export interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className
}) => {
  const { isOpen, isMobile, toggle } = useSideMenu({ defaultOpen: true });
  const {
    state,
    setMode,
    setSession,
    createNewSession
  } = useNavigation();

  const handleModeChange = (mode: 'general' | 'image' | 'educational') => {
    setMode(mode);
    if (isMobile) {
      toggle(); // Close menu on mobile after selection
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setSession(sessionId);
    if (isMobile) {
      toggle(); // Close menu on mobile after selection
    }
  };

  const handleNewSession = (type: 'general' | 'image' | 'educational') => {
    createNewSession(type);
    if (isMobile) {
      toggle(); // Close menu on mobile after creation
    }
  };

  return (
    <div className={clsx('min-h-screen bg-gray-50 dark:bg-gray-900 flex', className)}>
      {/* Side Menu */}
      <SideMenu
        isOpen={isOpen}
        onToggle={toggle}
        currentMode={state.currentMode}
        onModeChange={handleModeChange}
        sessions={state.sessions}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        className="flex-shrink-0"
      />

      {/* Main Content Area */}
      <motion.main
        animate={{
          marginLeft: !isMobile && isOpen ? 0 : 0,
          width: !isMobile && isOpen ? 'calc(100% - 320px)' : '100%'
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 200
        }}
        className={clsx(
          'flex-1 flex flex-col min-h-screen',
          !isMobile && isOpen ? 'lg:ml-80' : 'ml-0'
        )}
      >
        {/* Content */}
        <div className="flex-1 relative">
          {children}
        </div>
      </motion.main>
    </div>
  );
};