import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageSelector } from '../LanguageSelector';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

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

// Mock document
Object.defineProperty(document, 'documentElement', {
  value: {
    dir: 'ltr',
    lang: 'en',
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
  writable: true,
});

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
});

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('LanguageSelector', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('en');
  });

  it('renders dropdown variant by default', () => {
    renderWithI18n(<LanguageSelector />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('aria-label', 'Select Language');
  });

  it('renders compact variant correctly', () => {
    renderWithI18n(<LanguageSelector variant="compact" />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('EN');
  });

  it('renders buttons variant correctly', () => {
    renderWithI18n(<LanguageSelector variant="buttons" />);
    
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
    expect(radioGroup).toHaveAttribute('aria-label', 'Select Language');
    
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(10); // All supported languages
  });

  it('changes language when dropdown option is selected', async () => {
    renderWithI18n(<LanguageSelector />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'sw' } });
    
    await waitFor(() => {
      expect(i18n.language).toBe('sw');
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'culturalContext', 
      expect.stringContaining('East Africa')
    );
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'languageChanged',
        detail: expect.objectContaining({
          language: 'sw'
        })
      })
    );
  });

  it('cycles through languages in compact variant', async () => {
    renderWithI18n(<LanguageSelector variant="compact" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('EN');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).toHaveTextContent('SW');
    });
  });

  it('sets language when button variant is clicked', async () => {
    renderWithI18n(<LanguageSelector variant="buttons" />);
    
    const swahiliButton = screen.getByRole('radio', { name: /kiswahili/i });
    fireEvent.click(swahiliButton);
    
    await waitFor(() => {
      expect(i18n.language).toBe('sw');
    });
  });

  it('shows native names when showNativeNames is true', () => {
    renderWithI18n(<LanguageSelector showNativeNames={true} />);
    
    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    
    // Check that native names are shown
    expect(options[0]).toHaveTextContent('English (English)');
    expect(options[1]).toHaveTextContent('Kiswahili (Swahili)');
    expect(options[2]).toHaveTextContent('العربية (Arabic)');
  });

  it('shows English names when showNativeNames is false', () => {
    renderWithI18n(<LanguageSelector showNativeNames={false} />);
    
    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    
    // Check that English names are shown
    expect(options[0]).toHaveTextContent('English');
    expect(options[1]).toHaveTextContent('Swahili');
    expect(options[2]).toHaveTextContent('Arabic');
  });

  it('indicates current language in buttons variant', async () => {
    await i18n.changeLanguage('ar');
    
    renderWithI18n(<LanguageSelector variant="buttons" />);
    
    const arabicButton = screen.getByRole('radio', { name: /العربية/i });
    expect(arabicButton).toHaveAttribute('aria-checked', 'true');
  });

  it('applies custom className', () => {
    renderWithI18n(<LanguageSelector className="custom-class" />);
    
    const container = screen.getByRole('combobox').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('stores cultural context in localStorage when language changes', async () => {
    renderWithI18n(<LanguageSelector />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'ar' } });
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'culturalContext',
        expect.stringContaining('Middle East & North Africa')
      );
    });
  });

  it('dispatches languageChanged event with cultural context', async () => {
    renderWithI18n(<LanguageSelector />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'yo' } });
    
    await waitFor(() => {
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'languageChanged',
          detail: expect.objectContaining({
            language: 'yo',
            culturalContext: expect.objectContaining({
              region: 'West Africa',
              greetingStyle: 'respectful',
              educationalApproach: 'storytelling'
            })
          })
        })
      );
    });
  });
});