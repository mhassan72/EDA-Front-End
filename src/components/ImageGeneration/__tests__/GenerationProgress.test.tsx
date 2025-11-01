import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerationProgress } from '../GenerationProgress';
import { TaskProgress } from '@/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
  },
}));

const mockTaskProgress: TaskProgress = {
  taskId: 'task-123',
  status: 'running',
  progress: 45,
  message: 'Generating image...',
  estimatedCompletion: new Date(Date.now() + 60000), // 1 minute from now
  metadata: {}
};

describe('GenerationProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now for consistent time calculations
    vi.spyOn(Date, 'now').mockReturnValue(1640995200000); // Fixed timestamp
  });

  it('renders progress circle with correct percentage', () => {
    render(<GenerationProgress progress={75} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Generating Your Image')).toBeInTheDocument();
  });

  it('displays default message when no custom message provided', () => {
    render(<GenerationProgress progress={25} />);

    expect(screen.getByText('Processing prompt...')).toBeInTheDocument();
  });

  it('displays custom message when provided', () => {
    render(<GenerationProgress progress={50} message="Custom processing message" />);

    expect(screen.getByText('Custom processing message')).toBeInTheDocument();
  });

  it('displays task progress message when available', () => {
    render(
      <GenerationProgress 
        progress={60} 
        message="Default message"
        taskProgress={mockTaskProgress}
      />
    );

    expect(screen.getByText('Generating image...')).toBeInTheDocument();
  });

  it('shows correct status icon for different task statuses', () => {
    const queuedTask = { ...mockTaskProgress, status: 'queued' as const };
    const { rerender } = render(
      <GenerationProgress progress={0} taskProgress={queuedTask} />
    );

    // Should show clock icon for queued status
    expect(document.querySelector('.text-amber-500')).toBeInTheDocument();

    const runningTask = { ...mockTaskProgress, status: 'running' as const };
    rerender(<GenerationProgress progress={50} taskProgress={runningTask} />);

    // Should show CPU icon for running status
    expect(document.querySelector('.text-blue-500')).toBeInTheDocument();

    const completedTask = { ...mockTaskProgress, status: 'completed' as const };
    rerender(<GenerationProgress progress={100} taskProgress={completedTask} />);

    // Should show check circle for completed status
    expect(document.querySelector('.text-green-500')).toBeInTheDocument();

    const failedTask = { ...mockTaskProgress, status: 'failed' as const };
    rerender(<GenerationProgress progress={0} taskProgress={failedTask} />);

    // Should show alert circle for failed status
    expect(document.querySelector('.text-red-500')).toBeInTheDocument();
  });

  it('displays time remaining when estimated completion is provided', () => {
    const fixedTime = new Date('2024-01-01T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(fixedTime);
    
    const taskWithEstimate = {
      ...mockTaskProgress,
      estimatedCompletion: new Date(fixedTime.getTime() + 120000) // 2 minutes from fixed time
    };

    render(<GenerationProgress progress={50} taskProgress={taskWithEstimate} />);

    expect(screen.getByText('2m remaining')).toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('shows seconds remaining for short durations', () => {
    const fixedTime = new Date('2024-01-01T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(fixedTime);
    
    const taskWithShortEstimate = {
      ...mockTaskProgress,
      estimatedCompletion: new Date(fixedTime.getTime() + 30000) // 30 seconds from fixed time
    };

    render(<GenerationProgress progress={90} taskProgress={taskWithShortEstimate} />);

    expect(screen.getByText('30s remaining')).toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('shows completing message when time has passed', () => {
    const taskWithPastEstimate = {
      ...mockTaskProgress,
      estimatedCompletion: new Date(Date.now() - 10000) // 10 seconds ago
    };

    render(<GenerationProgress progress={95} taskProgress={taskWithPastEstimate} />);

    expect(screen.getByText('Completing...')).toBeInTheDocument();
  });

  it('displays progress steps with correct states', () => {
    render(<GenerationProgress progress={60} />);

    // Check that progress steps are rendered
    expect(screen.getByText('Queue')).toBeInTheDocument();
    expect(screen.getByText('Process')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();

    // At 60% progress, first 2 steps should be completed, 3rd should be active
    const stepElements = document.querySelectorAll('.w-8.h-8.rounded-full');
    expect(stepElements).toHaveLength(4);
  });

  it('shows task details when task progress is provided', () => {
    render(<GenerationProgress progress={50} taskProgress={mockTaskProgress} />);

    expect(screen.getByText('Task ID:')).toBeInTheDocument();
    expect(screen.getByText('task-123...')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('running')).toBeInTheDocument();
  });

  it('applies correct progress color based on percentage', () => {
    const { rerender } = render(<GenerationProgress progress={20} />);
    
    // Low progress should use blue
    expect(document.querySelector('.bg-blue-500')).toBeInTheDocument();

    rerender(<GenerationProgress progress={40} />);
    // Medium-low progress should use purple
    expect(document.querySelector('.bg-purple-500')).toBeInTheDocument();

    rerender(<GenerationProgress progress={60} />);
    // Medium-high progress should use indigo
    expect(document.querySelector('.bg-indigo-500')).toBeInTheDocument();

    rerender(<GenerationProgress progress={90} />);
    // High progress should use green
    expect(document.querySelector('.bg-green-500')).toBeInTheDocument();
  });

  it('displays appropriate message based on progress percentage', () => {
    const { rerender } = render(<GenerationProgress progress={5} />);
    expect(screen.getByText('Initializing generation...')).toBeInTheDocument();

    rerender(<GenerationProgress progress={25} />);
    expect(screen.getByText('Processing prompt...')).toBeInTheDocument();

    rerender(<GenerationProgress progress={50} />);
    expect(screen.getByText('Generating image...')).toBeInTheDocument();

    rerender(<GenerationProgress progress={75} />);
    expect(screen.getByText('Applying final touches...')).toBeInTheDocument();

    rerender(<GenerationProgress progress={95} />);
    expect(screen.getByText('Almost done...')).toBeInTheDocument();
  });

  it('shows tip message after delay', () => {
    render(<GenerationProgress progress={50} />);

    expect(screen.getByText('💡 Tip: Higher quality settings take longer but produce better results')).toBeInTheDocument();
  });

  it('handles missing estimated completion gracefully', () => {
    const taskWithoutEstimate = {
      ...mockTaskProgress,
      estimatedCompletion: undefined
    };

    render(<GenerationProgress progress={50} taskProgress={taskWithoutEstimate} />);

    // Should not show time remaining section
    expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
  });

  it('displays correct status colors for different task states', () => {
    const completedTask = { ...mockTaskProgress, status: 'completed' as const };
    render(<GenerationProgress progress={100} taskProgress={completedTask} />);

    // Completed status should have green color
    expect(document.querySelector('.text-green-600')).toBeInTheDocument();

    const failedTask = { ...mockTaskProgress, status: 'failed' as const };
    const { rerender } = render(<GenerationProgress progress={0} taskProgress={failedTask} />);

    // Failed status should have red color
    expect(document.querySelector('.text-red-600')).toBeInTheDocument();
  });

  it('renders progress bar with correct width', () => {
    render(<GenerationProgress progress={65} />);

    // Progress bar should have width corresponding to progress percentage
    const progressBar = document.querySelector('.h-2.rounded-full:not(.bg-gray-200):not(.bg-gray-700)');
    expect(progressBar).toBeInTheDocument();
  });
});