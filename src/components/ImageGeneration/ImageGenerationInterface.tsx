import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ImageIcon, 
  Wand2, 
  Settings, 
  Download, 
  Trash2, 
  Eye,
  Loader2,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { 
  ImageGenerationRequest, 
  GeneratedImage, 
  AIModel, 
  ImageSize, 
  ImageQuality, 
  ImageStyle,
  TaskProgress,
  ImageGenerationUIState
} from '@/types';
import { imageService } from '@/services/image';
import { ImageGenerationForm } from './ImageGenerationForm';
import { ImageGallery } from './ImageGallery';
import { GenerationProgress } from './GenerationProgress';
import { ModelSelector } from './ModelSelector';
import { CostEstimator } from './CostEstimator';

interface ImageGenerationInterfaceProps {
  creditBalance: number;
  onInsufficientCredits: () => void;
}

export const ImageGenerationInterface: React.FC<ImageGenerationInterfaceProps> = ({
  creditBalance,
  onInsufficientCredits
}) => {
  const [uiState, setUIState] = useState<ImageGenerationUIState>({
    isGenerating: false,
    progress: 0,
    estimatedCost: 0,
    hasInsufficientCredits: false
  });

  const [activeTab, setActiveTab] = useState<'generate' | 'gallery'>('generate');
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [generationRequest, setGenerationRequest] = useState<Partial<ImageGenerationRequest>>({
    prompt: '',
    negativePrompt: '',
    size: ImageSize.SQUARE_1024,
    quality: ImageQuality.STANDARD,
    style: ImageStyle.NATURAL,
    count: 1,
    guidanceScale: 7.5,
    steps: 20
  });
  
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [galleryImages, setGalleryImages] = useState<GeneratedImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Load available models on component mount
  useEffect(() => {
    loadAvailableModels();
    loadGalleryImages();
  }, []);

  // Update cost estimation when request changes
  useEffect(() => {
    if (generationRequest.prompt && selectedModel) {
      updateCostEstimation();
    }
  }, [generationRequest, selectedModel]);

  // Check for insufficient credits
  useEffect(() => {
    const hasInsufficientCredits = creditBalance < uiState.estimatedCost;
    setUIState(prev => ({ ...prev, hasInsufficientCredits }));
  }, [creditBalance, uiState.estimatedCost]);

  const loadAvailableModels = async () => {
    try {
      const models = await imageService.getImageModels();
      setAvailableModels(models);
      if (models.length > 0 && !selectedModel) {
        setSelectedModel(models[0].id);
      }
    } catch (error) {
      console.error('Failed to load image models:', error);
    }
  };

  const updateCostEstimation = async () => {
    try {
      const cost = await imageService.estimateCost({
        ...generationRequest,
        model: selectedModel
      });
      setUIState(prev => ({ ...prev, estimatedCost: cost }));
    } catch (error) {
      console.error('Failed to estimate cost:', error);
    }
  };

  const handleGenerate = async () => {
    if (uiState.hasInsufficientCredits) {
      onInsufficientCredits();
      return;
    }

    if (!generationRequest.prompt || !selectedModel) {
      return;
    }

    try {
      setUIState(prev => ({ ...prev, isGenerating: true, progress: 0 }));
      
      const fullRequest: ImageGenerationRequest = {
        ...generationRequest as ImageGenerationRequest,
        model: selectedModel
      };

      const { taskId } = await imageService.generateImages(fullRequest);
      setCurrentTask(taskId);

      // Subscribe to task updates
      const unsubscribe = imageService.subscribeToTaskUpdates(taskId, (progress) => {
        setTaskProgress(progress);
        setUIState(prev => ({ 
          ...prev, 
          progress: progress.progress,
          currentTask: progress.message
        }));

        if (progress.status === 'completed') {
          loadTaskResults(taskId);
          setUIState(prev => ({ ...prev, isGenerating: false }));
        } else if (progress.status === 'failed') {
          setUIState(prev => ({ ...prev, isGenerating: false }));
          console.error('Image generation failed:', progress.message);
        }
      });

      // Cleanup subscription when component unmounts or task completes
      return unsubscribe;
    } catch (error) {
      console.error('Failed to start image generation:', error);
      setUIState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const loadTaskResults = async (taskId: string) => {
    try {
      const images = await imageService.getTaskResults(taskId);
      setGeneratedImages(images);
      // Refresh gallery to include new images
      loadGalleryImages();
    } catch (error) {
      console.error('Failed to load task results:', error);
    }
  };

  const loadGalleryImages = async () => {
    try {
      setGalleryLoading(true);
      const { images } = await imageService.getUserImages(1, 20);
      setGalleryImages(images);
    } catch (error) {
      console.error('Failed to load gallery images:', error);
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await imageService.deleteImage(imageId);
      setGalleryImages(prev => prev.filter(img => img.id !== imageId));
      setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleDownloadImage = async (imageId: string, filename: string) => {
    try {
      const blob = await imageService.downloadImage(imageId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Image Generation
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create stunning images with AI-powered models
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <CostEstimator 
              estimatedCost={uiState.estimatedCost}
              creditBalance={creditBalance}
              hasInsufficientCredits={uiState.hasInsufficientCredits}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'generate'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Wand2 className="w-4 h-4 inline mr-2" />
            Generate
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Gallery
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex"
            >
              {/* Generation Form */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <ModelSelector
                    models={availableModels}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                  />
                  
                  <ImageGenerationForm
                    request={generationRequest}
                    onRequestChange={setGenerationRequest}
                    onGenerate={handleGenerate}
                    isGenerating={uiState.isGenerating}
                    hasInsufficientCredits={uiState.hasInsufficientCredits}
                  />
                </div>
              </div>

              {/* Results Panel */}
              <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 p-6">
                {uiState.isGenerating ? (
                  <GenerationProgress
                    progress={uiState.progress}
                    message={uiState.currentTask}
                    taskProgress={taskProgress}
                  />
                ) : generatedImages.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Generated Images
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {generatedImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.thumbnailUrl}
                            alt="Generated image"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDownloadImage(image.id, `generated-${image.id}.png`)}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                              >
                                <Download className="w-4 h-4 text-gray-700" />
                              </button>
                              <button
                                onClick={() => handleDeleteImage(image.id)}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Generated images will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <ImageGallery
                images={galleryImages}
                loading={galleryLoading}
                onDelete={handleDeleteImage}
                onDownload={handleDownloadImage}
                onRefresh={loadGalleryImages}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};