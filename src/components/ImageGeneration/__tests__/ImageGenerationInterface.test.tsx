
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGenerationInterface } from '../ImageGenerationInterface';
import { imageService } from '@/services/image';
import { ImageSize, ImageQuality, ImageStyle, ModelCategory } from '@/types';

// Mock the image service
vi.mock('@/services/image', () => ({
  imageService: {
    getImageModels: vi.fn(),
    getUserImages: vi.fn(),
    estimateCost: vi.fn(),
    generateImages: vi.fn(),
    getTaskResults: vi.fn(),
    deleteImage: vi.fn(),
    downloadImage: vi.fn(),
    subscribeToTaskUpdates: vi.fn(),
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

const mockModels = [
  {
    id: 'flux-schnell',
    name: 'FLUX Schnell',
    description: 'Fast image generation',
    category: ModelCategory.IMAGE_GENERATION,
    provider: 'black-forest-labs',
    apiEndpoint: 'https://api.example.com',
    isActive: true,
    capabilities: {
      maxTokens: 0,
      supportsStreaming: false,
      supportsImages: true,
      supportsTools: false,
      contextWindow: 0
    },
    pricing: {
      costPer1kInputTokens: 0,
      costPer1kOutputTokens: 0,
      minimumCost: 10,
      currency: 'credits' as const
    },
    performance: {
      averageLatency: 100,
      tokensPerSecond: 0,
      qualityScore: 85,
      speedScore: 90,
      costScore: 80,
      reliabilityScore: 95
    },
    metadata: {
      addedAt: new Date(),
      lastUpdated: new Date(),
      addedBy: 'system',
      tags: ['fast', 'image']
    }
  }
];

const mockGeneratedImages = [
  {
    id: 'img-1',
    url: 'https://example.com/image1.jpg',
    thumbnailUrl: 'https://example.com/thumb1.jpg',
    size: ImageSize.SQUARE_1024,
    format: 'png',
    fileSize: 1024000,
    prompt: 'A beautiful sunset',
    model: 'flux-schnell',
    createdAt: new Date(),
    creditsUsed: 50,
  }
];

const mockTaskProgress = {
  taskId: 'task-123',
  status: 'running' as const,
  progress: 50,
  message: 'Generating image...',
  estimatedCompletion: new Date(Date.now() + 60000),
  metadata: {}
};

describe('ImageGenerationInterface', () => {
  const defaultProps = {
    creditBalance: 1000,
    onInsufficientCredits: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(imageService.getImageModels).mockResolvedValue(mockModels);
    vi.mocked(imageService.getUserImages).mockResolvedValue({
      images: mockGeneratedImages,
      total: 1,
      hasMore: false
    });
    vi.mocked(imageService.estimateCost).mockResolvedValue(50);
    vi.mocked(imageService.generateImages).mockResolvedValue({ taskId: 'task-123' });
    vi.mocked(imageService.getTaskResults).mockResolvedValue(mockGeneratedImages);
    vi.mocked(imageService.subscribeToTaskUpdates).mockReturnValue(() => {});
  });

  it('renders image generation interface', async () => {
    render(<ImageGenerationInterface {...defaultProps} />);

    expect(screen.getByText('AI Image Generation')).toBeInTheDocument();
    expect(screen.getByText('Create stunning images with AI-powered models')).toBeInTheDocument();
    
    // Should show generate tab by default
    expect(screen.getByText('Generate')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
  });

  it('loads available models on mount', async () => {
    render(<ImageGenerationInterface {...defaultProps} />);

    await waitFor(() => {
      expect(imageService.getImageModels).toHaveBeenCalled();
    });
  });

  it('loads gallery images on mount', async () => {
    render(<ImageGenerationInterface {...defaultProps} />);

    await waitFor(() => {
      expect(imageService.getUserImages).toHaveBeenCalledWith(1, 20);
    });
  });

  it('updates cost estimation when prompt changes', async () => {
    render(<ImageGenerationInterface {...defaultProps} />);

    // Wait for initial load
    await waitFor(() => {
      expect(imageService.getImageModels).toHaveBeenCalled();
    });

    // Find and fill prompt input
    const promptInput = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(promptInput, { target: { value: 'A beautiful landscape' } });

    await waitFor(() => {
      expect(imageService.estimateCost).toHaveBeenCalled();
    });
  });

  it('handles image generation successfully', async () => {
    const mockSubscribe = vi.fn((_taskId, callback) => {
      // Simulate progress updates
      setTimeout(() => callback(mockTaskProgress), 100);
      setTimeout(() => callback({ ...mockTaskProgress, status: 'completed', progress: 100 }), 200);
      return () => {};
    });
    vi.mocked(imageService.subscribeToTaskUpdates).mockImplementation(mockSubscribe);

    render(<ImageGenerationInterface {...defaultProps} />);

    // Wait for models to load
    await waitFor(() => {
      expect(imageService.getImageModels).toHaveBeenCalled();
    });

    // Fill in prompt
    const promptInput = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(promptInput, { target: { value: 'A beautiful landscape' } });

    // Click generate button
    const generateButton = screen.getByText('Generate Images');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(imageService.generateImages).toHaveBeenCalledWith({
        prompt: 'A beautiful landscape',
        negativePrompt: '',
        size: ImageSize.SQUARE_1024,
        quality: ImageQuality.STANDARD,
        style: ImageStyle.NATURAL,
        count: 1,
        guidanceScale: 7.5,
        steps: 20,
        model: 'flux-schnell'
      });
    });

    // Should subscribe to task updates
    expect(imageService.subscribeToTaskUpdates).toHaveBeenCalledWith('task-123', expect.any(Function));
  });

  it('prevents generation with insufficient credits', async () => {
    const onInsufficientCredits = vi.fn();
    
    render(
      <ImageGenerationInterface 
        creditBalance={10} // Low balance
        onInsufficientCredits={onInsufficientCredits}
      />
    );

    // Wait for cost estimation
    await waitFor(() => {
      expect(imageService.estimateCost).toHaveBeenCalled();
    });

    // Fill in prompt
    const promptInput = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(promptInput, { target: { value: 'A beautiful landscape' } });

    // Try to generate
    const generateButton = screen.getByText('Add Credits to Generate');
    fireEvent.click(generateButton);

    expect(onInsufficientCredits).toHaveBeenCalled();
    expect(imageService.generateImages).not.toHaveBeenCalled();
  });

  it('switches between generate and gallery tabs', async () => {
    render(<ImageGenerationInterface {...defaultProps} />);

    // Should start on generate tab
    expect(screen.getByPlaceholderText('Describe the image you want to generate...')).toBeInTheDocument();

    // Switch to gallery tab
    const galleryTab = screen.getByText('Gallery');
    fireEvent.click(galleryTab);

    // Should show gallery content
    await waitFor(() => {
      // Gallery should be rendered (specific content depends on ImageGallery component)
      expect(screen.queryByPlaceholderText('Describe the image you want to generate...')).not.toBeInTheDocument();
    });
  });

  it('displays generated images after completion', async () => {
    const mockSubscribe = vi.fn((_taskId, callback) => {
      // Simulate completion
      setTimeout(() => callback({ ...mockTaskProgress, status: 'completed', progress: 100 }), 100);
      return () => {};
    });
    vi.mocked(imageService.subscribeToTaskUpdates).mockImplementation(mockSubscribe);

    render(<ImageGenerationInterface {...defaultProps} />);

    // Wait for models and start generation
    await waitFor(() => {
      expect(imageService.getImageModels).toHaveBeenCalled();
    });

    const promptInput = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(promptInput, { target: { value: 'A beautiful landscape' } });

    const generateButton = screen.getByText('Generate Images');
    fireEvent.click(generateButton);

    // Wait for completion and results loading
    await waitFor(() => {
      expect(imageService.getTaskResults).toHaveBeenCalledWith('task-123');
    });
  });

  it('handles image deletion', async () => {
    vi.mocked(imageService.deleteImage).mockResolvedValue();

    render(<ImageGenerationInterface {...defaultProps} />);

    // Wait for initial load
    await waitFor(() => {
      expect(imageService.getUserImages).toHaveBeenCalled();
    });

    // This would typically involve interacting with the ImageGallery component
    // The actual test would depend on how the delete functionality is exposed
  });

  it('handles image download', async () => {
    const mockBlob = new Blob(['fake image data'], { type: 'image/png' });
    vi.mocked(imageService.downloadImage).mockResolvedValue(mockBlob);

    // Mock URL.createObjectURL and document methods
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    const mockClick = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();
    const mockCreateElement = vi.fn(() => ({
      href: '',
      download: '',
      click: mockClick,
    }));

    Object.defineProperty(document, 'createElement', { value: mockCreateElement });
    Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
    Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });

    render(<ImageGenerationInterface {...defaultProps} />);

    // Wait for initial load
    await waitFor(() => {
      expect(imageService.getUserImages).toHaveBeenCalled();
    });

    // This would typically involve interacting with the ImageGallery component
    // The actual test would depend on how the download functionality is exposed
  });

  it('shows progress during generation', async () => {
    const mockSubscribe = vi.fn((_taskId, callback) => {
      // Simulate progress updates
      setTimeout(() => callback({ ...mockTaskProgress, progress: 25 }), 50);
      setTimeout(() => callback({ ...mockTaskProgress, progress: 50 }), 100);
      setTimeout(() => callback({ ...mockTaskProgress, progress: 75 }), 150);
      return () => {};
    });
    vi.mocked(imageService.subscribeToTaskUpdates).mockImplementation(mockSubscribe);

    render(<ImageGenerationInterface {...defaultProps} />);

    // Start generation
    await waitFor(() => {
      expect(imageService.getImageModels).toHaveBeenCalled();
    });

    const promptInput = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(promptInput, { target: { value: 'A beautiful landscape' } });

    const generateButton = screen.getByText('Generate Images');
    fireEvent.click(generateButton);

    // Should show progress component
    await waitFor(() => {
      expect(screen.getByText('Generating Your Image')).toBeInTheDocument();
    });
  });

  it('handles generation errors gracefully', async () => {
    const mockSubscribe = vi.fn((_taskId, callback) => {
      // Simulate failure
      setTimeout(() => callback({ ...mockTaskProgress, status: 'failed', message: 'Generation failed' }), 100);
      return () => {};
    });
    vi.mocked(imageService.subscribeToTaskUpdates).mockImplementation(mockSubscribe);

    render(<ImageGenerationInterface {...defaultProps} />);

    // Start generation
    await waitFor(() => {
      expect(imageService.getImageModels).toHaveBeenCalled();
    });

    const promptInput = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(promptInput, { target: { value: 'A beautiful landscape' } });

    const generateButton = screen.getByText('Generate Images');
    fireEvent.click(generateButton);

    // Should handle the error and stop generating
    await waitFor(() => {
      expect(screen.queryByText('Generating Your Image')).not.toBeInTheDocument();
    });
  });

  it('displays empty state when no images generated', () => {
    render(<ImageGenerationInterface {...defaultProps} />);

    expect(screen.getByText('Generated images will appear here')).toBeInTheDocument();
  });

  it('updates UI state correctly during generation lifecycle', async () => {
    const mockSubscribe = vi.fn((_taskId, callback) => {
      // Simulate complete lifecycle
      setTimeout(() => callback({ ...mockTaskProgress, status: 'queued', progress: 0 }), 50);
      setTimeout(() => callback({ ...mockTaskProgress, status: 'running', progress: 50 }), 100);
      setTimeout(() => callback({ ...mockTaskProgress, status: 'completed', progress: 100 }), 150);
      return () => {};
    });
    vi.mocked(imageService.subscribeToTaskUpdates).mockImplementation(mockSubscribe);

    render(<ImageGenerationInterface {...defaultProps} />);

    // Wait for initial setup
    await waitFor(() => {
      expect(imageService.getImageModels).toHaveBeenCalled();
    });

    // Start generation
    const promptInput = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } });

    const generateButton = screen.getByText('Generate Images');
    fireEvent.click(generateButton);

    // Should show generating state
    await waitFor(() => {
      expect(screen.getByText('Generating Your Image')).toBeInTheDocument();
    });

    // Should eventually complete and load results
    await waitFor(() => {
      expect(imageService.getTaskResults).toHaveBeenCalledWith('task-123');
    }, { timeout: 3000 });
  });
});