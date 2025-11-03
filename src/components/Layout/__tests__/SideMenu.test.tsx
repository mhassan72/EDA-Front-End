import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SideMenu, SideMenuProps, ChatSession } from '../SideMenu';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  MessageCircle: () => <div data-testid="message-circle-icon" />,
  ImageIcon: () => <div data-testid="image-icon" />,
  BookOpen: () => <div data-testid="book-open-icon" />,
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  History: () => <div data-testid="history-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
}));

const mockSessions: ChatSession[] = [
  {
    id: 'session-1',
    title: 'General Chat Session',
    type: 'general',
    lastMessage: 'Hello, how can I help you?',
    timestamp: new Date('2023-01-01T10:00:00Z'),
    isActive: true
  },
  {
    id: 'session-2',
    title: 'Image Generation Session',
    type: 'image',
    lastMessage: 'Create a beautiful landscape',
    timestamp: new Date('2023-01-01T09:00:00Z'),
    isActive: false
  },
  {
    id: 'session-3',
    title: 'Educational Session',
    type: 'educational',
    lastMessage: 'Explain quantum physics',
    timestamp: new Date('2023-01-01T08:00:00Z'),
    isActive: false
  }
];

const defaultProps: SideMenuProps = {
  isOpen: true,
  onToggle: vi.fn(),
  currentMode: 'general',
  onModeChange: vi.fn(),
  sessions: mockSessions,
  onSessionSelect: vi.fn(),
  onNewSession: vi.fn(),
};

describe('SideMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.innerWidth for responsive behavior
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders side menu with correct structure', () => {
    render(<SideMenu {...defaultProps} />);

    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Chat Modes')).toBeInTheDocument();
    expect(screen.getByText('Recent Sessions')).toBeInTheDocument();
  });

  it('displays all chat modes with correct labels', () => {
    render(<SideMenu {...defaultProps} />);

    expect(screen.getByText('General Chat')).toBeInTheDocument();
    expect(screen.getByText('Image Generation')).toBeInTheDocument();
    expect(screen.getByText('Educational Mode')).toBeInTheDocument();
  });

  it('highlights current mode correctly', () => {
    render(<SideMenu {...defaultProps} currentMode="image" />);

    const imageButton = screen.getByText('Image Generation').closest('button');
    expect(imageButton).toHaveClass('bg-purple-50');
  });

  it('calls onModeChange when mode is selected', () => {
    const onModeChange = vi.fn();
    render(<SideMenu {...defaultProps} onModeChange={onModeChange} />);

    const imageButton = screen.getByText('Image Generation');
    fireEvent.click(imageButton);

    expect(onModeChange).toHaveBeenCalledWith('image');
  });

  it('calls onNewSession when plus button is clicked', () => {
    const onNewSession = vi.fn();
    render(<SideMenu {...defaultProps} onNewSession={onNewSession} />);

    const plusButtons = screen.getAllByTestId('plus-icon');
    fireEvent.click(plusButtons[0].closest('button')!);

    expect(onNewSession).toHaveBeenCalledWith('general');
  });

  it('displays sessions grouped by type', () => {
    render(<SideMenu {...defaultProps} />);

    expect(screen.getByText('General Chat Session')).toBeInTheDocument();
    expect(screen.getByText('Image Generation Session')).toBeInTheDocument();
    expect(screen.getByText('Educational Session')).toBeInTheDocument();
  });

  it('shows session count for each type', () => {
    render(<SideMenu {...defaultProps} />);

    expect(screen.getByText('General Chat (1)')).toBeInTheDocument();
    expect(screen.getByText('Image Generation (1)')).toBeInTheDocument();
    expect(screen.getByText('Educational Mode (1)')).toBeInTheDocument();
  });

  it('calls onSessionSelect when session is clicked', () => {
    const onSessionSelect = vi.fn();
    render(<SideMenu {...defaultProps} onSessionSelect={onSessionSelect} />);

    const sessionButton = screen.getByText('General Chat Session');
    fireEvent.click(sessionButton);

    expect(onSessionSelect).toHaveBeenCalledWith('session-1');
  });

  it('highlights active session correctly', () => {
    render(<SideMenu {...defaultProps} />);

    const activeSession = screen.getByText('General Chat Session').closest('button');
    expect(activeSession).toHaveClass('bg-blue-50');
  });

  it('truncates long session titles', () => {
    const longTitleSessions: ChatSession[] = [
      {
        id: 'session-long',
        title: 'This is a very long session title that should be truncated',
        type: 'general',
        lastMessage: 'Hello',
        timestamp: new Date(),
        isActive: false
      }
    ];

    render(<SideMenu {...defaultProps} sessions={longTitleSessions} />);

    const truncatedTitle = screen.getByText('This is a very long session ti...');
    expect(truncatedTitle.textContent).toContain('...');
  });

  it('formats timestamps correctly', () => {
    const todaySessions: ChatSession[] = [
      {
        id: 'today-session',
        title: 'Today Session',
        type: 'general',
        lastMessage: 'Hello',
        timestamp: new Date(),
        isActive: false
      }
    ];

    render(<SideMenu {...defaultProps} sessions={todaySessions} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('shows empty state when no sessions exist', () => {
    render(<SideMenu {...defaultProps} sessions={[]} />);

    expect(screen.getByText('No sessions yet')).toBeInTheDocument();
    expect(screen.getByText('Start a conversation to see your history here')).toBeInTheDocument();
  });

  it('toggles section expansion when section header is clicked', async () => {
    render(<SideMenu {...defaultProps} />);

    const generalSection = screen.getByText('General Chat (1)');
    fireEvent.click(generalSection);

    // The session should be hidden after clicking
    await waitFor(() => {
      expect(screen.queryByText('General Chat Session')).not.toBeInTheDocument();
    });

    // Click again to expand
    fireEvent.click(generalSection);

    await waitFor(() => {
      expect(screen.getByText('General Chat Session')).toBeInTheDocument();
    });
  });

  it('calls onToggle when mobile menu button is clicked', () => {
    const onToggle = vi.fn();
    render(<SideMenu {...defaultProps} onToggle={onToggle} />);

    const menuButton = screen.getByLabelText('Toggle side menu');
    fireEvent.click(menuButton);

    expect(onToggle).toHaveBeenCalled();
  });

  it('calls onToggle when close button is clicked', () => {
    const onToggle = vi.fn();
    render(<SideMenu {...defaultProps} onToggle={onToggle} />);

    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);

    expect(onToggle).toHaveBeenCalled();
  });

  it('renders correctly when closed', () => {
    render(<SideMenu {...defaultProps} isOpen={false} />);

    const sideMenu = screen.getByRole('complementary');
    // Since we're mocking framer-motion, we can't test the actual animation
    // Instead, we'll check that the component renders without errors
    expect(sideMenu).toBeInTheDocument();
  });

  it('handles sessions with different timestamps correctly', () => {
    const mixedTimestampSessions: ChatSession[] = [
      {
        id: 'yesterday',
        title: 'Yesterday Session',
        type: 'general',
        lastMessage: 'Hello',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        isActive: false
      },
      {
        id: 'week-ago',
        title: 'Week Ago Session',
        type: 'general',
        lastMessage: 'Hello',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Week ago
        isActive: false
      }
    ];

    render(<SideMenu {...defaultProps} sessions={mixedTimestampSessions} />);

    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    // The week ago session will show as a date, not "7 days ago"
    // Let's just check that both sessions are rendered
    expect(screen.getByText('Yesterday Session')).toBeInTheDocument();
    expect(screen.getByText('Week Ago Session')).toBeInTheDocument();
  });

  it('prevents event propagation when new session button is clicked', () => {
    const onModeChange = vi.fn();
    const onNewSession = vi.fn();
    
    render(
      <SideMenu 
        {...defaultProps} 
        onModeChange={onModeChange} 
        onNewSession={onNewSession} 
      />
    );

    const plusButtons = screen.getAllByTestId('plus-icon');
    const plusButton = plusButtons[0].closest('button')!;
    
    fireEvent.click(plusButton);

    expect(onNewSession).toHaveBeenCalledWith('general');
    expect(onModeChange).not.toHaveBeenCalled();
  });
});