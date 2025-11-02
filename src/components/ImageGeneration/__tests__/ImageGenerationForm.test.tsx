import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGenerationForm } from '../ImageGenerationForm';
import { ImageSize, ImageQuality, ImageStyle } from '@/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('ImageGenerationForm', () => {
  const defaultProps = {
    request: {
      prompt: '',
      negativePrompt: '',
      size: ImageSize.SQUARE_1024,
      quality: ImageQuality.STANDARD,
      style: ImageStyle.NATURAL,
      count: 1,
      guidanceScale: 7.5,
      steps: 20
    },
    onRequestChange: vi.fn(),
    onGenerate: vi.fn(),
    isGenerating: false,
    hasInsufficientCredits: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<ImageGenerationForm {...defaultProps} />);

    expect(screen.getByPlaceholderText('Describe the image you want to generate...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What you don\'t want in the image...')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
  });

  it('updates prompt when user types', () => {
    const onRequestChange = vi.fn();
    render(<ImageGenerationForm {...defaultProps} onRequestChange={onRequestChange} />);

    const promptInput = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(promptInput, { target: { value: 'A beautiful sunset' } });

    expect(onRequestChange).toHaveBeenCalledWith({
      ...defaultProps.request,
      prompt: 'A beautiful sunset'
    });
  });

  it('updates negative prompt when user types', () => {
    const onRequestChange = vi.fn();
    render(<ImageGenerationForm {...defaultProps} onRequestChange={onRequestChange} />);

    const negativePromptInput = screen.getByPlaceholderText('What you don\'t want in the image...');
    fireEvent.change(negativePromptInput, { target: { value: 'blurry, low quality' } });

    expect(onRequestChange).toHaveBeenCalledWith({
      ...defaultProps.request,
      negativePrompt: 'blurry, low quality'
    });
  });

  it('updates size when user selects different option', () => {
    const onRequestChange = vi.fn();
    render(<ImageGenerationForm {...defaultProps} onRequestChange={onRequestChange} />);

    const sizeSelect = screen.getByDisplayValue('1024×1024 (Square)');
    fireEvent.change(sizeSelect, { target: { value: ImageSize.PORTRAIT_512_768 } });

    expect(onRequestChange).toHaveBeenCalledWith({
      ...defaultProps.request,
      size: ImageSize.PORTRAIT_512_768
    });
  });

  it('updates quality when user selects different option', () => {
    const onRequestChange = vi.fn();
    render(<ImageGenerationForm {...defaultProps} onRequestChange={onRequestChange} />);

    const qualitySelect = screen.getByDisplayValue('Standard');
    fireEvent.change(qualitySelect, { target: { value: ImageQuality.HD } });

    expect(onRequestChange).toHaveBeenCalledWith({
      ...defaultProps.request,
      quality: ImageQuality.HD
    });
  });

  it('updates style when user clicks style button', () => {
    const onRequestChange = vi.fn();
    render(<ImageGenerationForm {...defaultProps} onRequestChange={onRequestChange} />);

    const vividStyleButton = screen.getByText('Vivid');
    fireEvent.click(vividStyleButton);

    expect(onRequestChange).toHaveBeenCalledWith({
      ...defaultProps.request,
      style: ImageStyle.VIVID
    });
  });

  it('shows advanced settings when toggle clicked', () => {
    render(<ImageGenerationForm {...defaultProps} />);

    const advancedToggle = screen.getByText('Advanced Settings');
    fireEvent.click(advancedToggle);

    expect(screen.getByText('Number of Images: 1')).toBeInTheDocument();
    expect(screen.getByText('Guidance Scale: 7.5')).toBeInTheDocument();
    expect(screen.getByText('Generation Steps: 20')).toBeInTheDocument();
  });

  it('updates advanced settings correctly', () => {
    const onRequestChange = vi.fn();
    render(<ImageGenerationForm {...defaultProps} onRequestChange={onRequestChange} />);

    // Open advanced settings
    const advancedToggle = screen.getByText('Advanced Settings');
    fireEvent.click(advancedToggle);

    // Update number of images
    const countSlider = screen.getByDisplayValue('1');
    fireEvent.change(countSlider, { target: { value: '3' } });

    expect(onRequestChange).toHaveBeenCalledWith({
      ...defaultProps.request,
      count: 3
    });
  });

  it('updates guidance scale correctly', () => {
    const onRequestChange = vi.fn();
    render(<ImageGenerationForm {...defaultProps} onRequestChange={onRequestChange} />);

    // Open advanced settings
    const advancedToggle = screen.getByText('Advanced Settings');
    fireEvent.click(advancedToggle);

    // Update guidance scale
    const guidanceSlider = screen.getByDisplayValue('7.5');
    fireEvent.change(guidanceSlider, { target: { value: '10' } });

    expect(onRequestChange).toHaveBeenCalledWith({
      ...defaultProps.request,
      guidanceScale: 10
    });
  });

  it('updates generation steps correctly', () => {
    const onRequestChange = vi.fn();
    render(<ImageGenerationForm {...defaultProps} onRequestChange={onRequestChange} />);

    // Open advanced settings
    const advancedToggle = screen.getByText('Advanced Settings');
    fireEvent.click(advancedToggle);

    // Update steps
    const stepsSlider = screen.getByDisplayValue('20');
    fireEvent.change(stepsSlider, { target: { value: '30' } });

    expect(onRequestChange).toHaveBeenCalledWith({
      ...defaultProps.request,
      steps: 30
    });
  });

  it('updates seed when provided', () => {
    const onRequestChange = vi.fn();
    render(<ImageGenerationForm {...defaultProps} onRequestChange={onRequestChange} />);

    // Open advanced settings
    const advancedToggle = screen.getByText('Advanced Settings');
    fireEvent.click(advancedToggle);

    // Update seed
    const seedInput = screen.getByPlaceholderText('Random seed for reproducible results');
    fireEvent.change(seedInput, { target: { value: '12345' } });

    expect(onRequestChange).toHaveBeenCalledWith({
      ...defaultProps.request,
      seed: 12345
    });
  });

  it('calls onGenerate when generate button clicked', () => {
    const onGenerate = vi.fn();
    const propsWithPrompt = {
      ...defaultProps,
      request: { ...defaultProps.request, prompt: 'A beautiful landscape' },
      onGenerate
    };

    render(<ImageGenerationForm {...propsWithPrompt} />);

    const generateButton = screen.getByText('Generate Images');
    fireEvent.click(generateButton);

    expect(onGenerate).toHaveBeenCalled();
  });

  it('disables form when generating', () => {
    const propsGenerating = {
      ...defaultProps,
      isGenerating: true,
      request: { ...defaultProps.request, prompt: 'Test prompt' }
    };

    render(<ImageGenerationForm {...propsGenerating} />);

    const promptInput = screen.getByPlaceholderText('Describe the image you want to generate...');
    const generateButton = screen.getByRole('button', { name: /generating/i });

    expect(promptInput).toBeDisabled();
    expect(generateButton).toBeDisabled();
  });

  it('shows insufficient credits state', () => {
    const propsInsufficientCredits = {
      ...defaultProps,
      hasInsufficientCredits: true,
      request: { ...defaultProps.request, prompt: 'Test prompt' }
    };

    render(<ImageGenerationForm {...propsInsufficientCredits} />);

    expect(screen.getByText('Insufficient credits for this generation')).toBeInTheDocument();
    expect(screen.getByText('Add Credits to Generate')).toBeInTheDocument();
  });

  it('disables generate button when no prompt provided', () => {
    render(<ImageGenerationForm {...defaultProps} />);

    const generateButton = screen.getByRole('button', { name: /generate images/i });
    expect(generateButton).toBeDisabled();
  });

  it('enables generate button when prompt is provided', () => {
    const propsWithPrompt = {
      ...defaultProps,
      request: { ...defaultProps.request, prompt: 'A beautiful landscape' }
    };

    render(<ImageGenerationForm {...propsWithPrompt} />);

    const generateButton = screen.getByRole('button', { name: /generate images/i });
    expect(generateButton).not.toBeDisabled();
  });

  it('displays style options with descriptions', () => {
    render(<ImageGenerationForm {...defaultProps} />);

    expect(screen.getByText('Natural')).toBeInTheDocument();
    expect(screen.getByText('Realistic and natural looking')).toBeInTheDocument();
    expect(screen.getByText('Vivid')).toBeInTheDocument();
    expect(screen.getByText('Enhanced colors and contrast')).toBeInTheDocument();
    expect(screen.getByText('Artistic')).toBeInTheDocument();
    expect(screen.getByText('Creative and stylized')).toBeInTheDocument();
    expect(screen.getByText('Photographic')).toBeInTheDocument();
    expect(screen.getByText('Photo-realistic style')).toBeInTheDocument();
  });

  it('highlights selected style correctly', () => {
    const propsWithVividStyle = {
      ...defaultProps,
      request: { ...defaultProps.request, style: ImageStyle.VIVID }
    };

    render(<ImageGenerationForm {...propsWithVividStyle} />);

    const vividButton = screen.getByText('Vivid').closest('button');
    expect(vividButton).toHaveClass('border-purple-500');
  });

  it('shows quality options correctly', () => {
    render(<ImageGenerationForm {...defaultProps} />);

    const qualitySelect = screen.getByDisplayValue('Standard');
    expect(qualitySelect).toBeInTheDocument();

    // Check that all quality options are available
    const options = qualitySelect.querySelectorAll('option');
    expect(options).toHaveLength(3); // Standard, HD, Ultra HD
  });

  it('shows size options correctly', () => {
    render(<ImageGenerationForm {...defaultProps} />);

    const sizeSelect = screen.getByDisplayValue('1024×1024 (Square)');
    expect(sizeSelect).toBeInTheDocument();

    // Check that multiple size options are available
    const options = sizeSelect.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(1);
  });

  it('provides helpful text for form fields', () => {
    render(<ImageGenerationForm {...defaultProps} />);

    expect(screen.getByText('Be specific and descriptive for better results')).toBeInTheDocument();
  });

  it('shows slider labels for advanced settings', () => {
    render(<ImageGenerationForm {...defaultProps} />);

    // Open advanced settings
    const advancedToggle = screen.getByText('Advanced Settings');
    fireEvent.click(advancedToggle);

    expect(screen.getByText('1 (Creative)')).toBeInTheDocument();
    expect(screen.getByText('20 (Precise)')).toBeInTheDocument();
    expect(screen.getByText('10 (Fast)')).toBeInTheDocument();
    expect(screen.getByText('50 (High Quality)')).toBeInTheDocument();
  });

  it('handles seed input clearing correctly', () => {
    const onRequestChange = vi.fn();
    
    // Start with a request that has a seed value
    const propsWithSeed = {
      ...defaultProps,
      request: { ...defaultProps.request, seed: 12345 }
    };
    
    render(<ImageGenerationForm {...propsWithSeed} onRequestChange={onRequestChange} />);

    // Open advanced settings
    const advancedToggle = screen.getByText('Advanced Settings');
    fireEvent.click(advancedToggle);

    // Clear any previous calls
    onRequestChange.mockClear();

    // Clear the seed (since it already has a value)
    const seedInput = screen.getByPlaceholderText('Random seed for reproducible results') as HTMLInputElement;
    fireEvent.change(seedInput, { target: { value: '' } });
    
    // Verify seed was cleared
    expect(onRequestChange).toHaveBeenCalledWith({
      ...defaultProps.request,
      seed: undefined
    });
  });
});