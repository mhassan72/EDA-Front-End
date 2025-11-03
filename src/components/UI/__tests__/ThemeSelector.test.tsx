import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSelector } from '../ThemeSelector';
import { ThemeProvider } from '../../../contexts/ThemeContext';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
const matchMediaMock = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  value: matchMediaMock,
});

// Mock document.documentElement
Object.defineProperty(document, 'documentElement', {
  value: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
  writable: true,
});

const renderWithThemeProvider = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ThemeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renders dropdown variant by default', () => {
    renderWithThemeProvider(<ThemeSelector />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('aria-label', 'Select theme');
  });

  it('renders toggle variant correctly', () => {
    renderWithThemeProvider(<ThemeSelector variant="toggle" />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
  });

  it('renders buttons variant correctly', () => {
    renderWithThemeProvider(<ThemeSelector variant="buttons" />);
    
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
    expect(radioGroup).toHaveAttribute('aria-label', 'Theme selection');
    
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(3); // light, dark, system
  });

  it('changes theme when dropdown option is selected', () => {
    renderWithThemeProvider(<ThemeSelector />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'dark' } });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('toggles theme when toggle button is clicked', () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    renderWithThemeProvider(<ThemeSelector variant="toggle" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('sets theme when button variant is clicked', () => {
    renderWithThemeProvider(<ThemeSelector variant="buttons" />);
    
    const darkButton = screen.getByRole('radio', { name: /dark theme/i });
    fireEvent.click(darkButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('shows correct icons for different themes', () => {
    renderWithThemeProvider(<ThemeSelector variant="buttons" />);
    
    const lightButton = screen.getByRole('radio', { name: /light theme/i });
    const darkButton = screen.getByRole('radio', { name: /dark theme/i });
    const systemButton = screen.getByRole('radio', { name: /system theme/i });
    
    expect(lightButton).toHaveTextContent('☀️');
    expect(darkButton).toHaveTextContent('🌙');
    expect(systemButton).toHaveTextContent('💻');
  });

  it('indicates current theme in buttons variant', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    renderWithThemeProvider(<ThemeSelector variant="buttons" />);
    
    const darkButton = screen.getByRole('radio', { name: /dark theme/i });
    expect(darkButton).toHaveAttribute('aria-checked', 'true');
  });

  it('applies custom className', () => {
    renderWithThemeProvider(<ThemeSelector className="custom-class" />);
    
    const container = screen.getByRole('combobox').parentElement;
    expect(container).toHaveClass('custom-class');
  });
});