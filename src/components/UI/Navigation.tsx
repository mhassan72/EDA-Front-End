import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Menu, X } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}

export interface MobileNavigationProps {
  items: NavigationItem[];
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  className,
  onItemClick
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (item: NavigationItem) => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    }
    
    if (onItemClick) {
      onItemClick(item);
    }
    
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className={clsx(
          'md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 dark:hover:bg-gray-800 dark:hover:text-gray-300',
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="block h-6 w-6" />
        ) : (
          <Menu className="block h-6 w-6" />
        )}
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Menu
                </h2>
                <button
                  type="button"
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="p-4">
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={clsx(
                          'w-full flex items-center px-3 py-2 text-left rounded-md transition-colors',
                          item.active
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                          item.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                      >
                        {item.icon && (
                          <span className="mr-3 flex-shrink-0">
                            {item.icon}
                          </span>
                        )}
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export interface DesktopNavigationProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  items,
  orientation = 'horizontal',
  className,
  onItemClick
}) => {
  const handleItemClick = (item: NavigationItem) => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    }
    
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const containerClasses = orientation === 'horizontal' 
    ? 'hidden md:flex md:space-x-1' 
    : 'hidden md:flex md:flex-col md:space-y-1';

  return (
    <nav className={clsx(containerClasses, className)}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={clsx(
            'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            item.active
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
        >
          {item.icon && (
            <span className={clsx(
              'flex-shrink-0',
              orientation === 'horizontal' ? 'mr-2' : 'mr-3'
            )}>
              {item.icon}
            </span>
          )}
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export interface ResponsiveNavigationProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  items,
  orientation = 'horizontal',
  className,
  onItemClick
}) => {
  return (
    <div className={className}>
      <MobileNavigation items={items} onItemClick={onItemClick} />
      <DesktopNavigation 
        items={items} 
        orientation={orientation} 
        onItemClick={onItemClick} 
      />
    </div>
  );
};