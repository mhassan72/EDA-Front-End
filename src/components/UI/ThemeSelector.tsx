import React from 'react';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { Button } from './Button';

interface ThemeSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'buttons' | 'toggle';
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  className = '', 
  variant = 'dropdown' 
}) => {
  const { theme, setTheme, toggleTheme, actualTheme } = useTheme();

  const themeOptions: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  if (variant === 'toggle') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`p-2 ${className}`}
        aria-label={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} theme`}
      >
        {actualTheme === 'light' ? '🌙' : '☀️'}
      </Button>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-1 ${className}`} role="radiogroup" aria-label="Theme selection">
        {themeOptions.map((option) => (
          <Button
            key={option.value}
            variant={theme === option.value ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setTheme(option.value)}
            className="px-3 py-2"
            role="radio"
            aria-checked={theme === option.value}
            aria-label={`${option.label} theme`}
          >
            <span className="mr-1" aria-hidden="true">{option.icon}</span>
            {option.label}
          </Button>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="
          appearance-none bg-white dark:bg-neutral-800 
          border border-neutral-300 dark:border-neutral-600
          rounded-lg px-3 py-2 pr-8
          text-neutral-900 dark:text-neutral-100
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-colors duration-200
        "
        aria-label="Select theme"
      >
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-neutral-500 dark:text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default ThemeSelector;