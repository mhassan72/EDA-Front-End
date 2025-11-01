import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wand2, 
  Settings, 
  AlertCircle,
  CreditCard,
  Sliders
} from 'lucide-react';
import { 
  ImageGenerationRequest, 
  ImageSize, 
  ImageQuality, 
  ImageStyle 
} from '@/types';

interface ImageGenerationFormProps {
  request: Partial<ImageGenerationRequest>;
  onRequestChange: (request: Partial<ImageGenerationRequest>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasInsufficientCredits: boolean;
}

export const ImageGenerationForm: React.FC<ImageGenerationFormProps> = ({
  request,
  onRequestChange,
  onGenerate,
  isGenerating,
  hasInsufficientCredits
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleInputChange = (field: keyof ImageGenerationRequest, value: any) => {
    onRequestChange({
      ...request,
      [field]: value
    });
  };

  const imageSizeOptions = [
    { value: ImageSize.SQUARE_512, label: '512×512', aspect: 'Square' },
    { value: ImageSize.SQUARE_1024, label: '1024×1024', aspect: 'Square' },
    { value: ImageSize.PORTRAIT_512_768, label: '512×768', aspect: 'Portrait' },
    { value: ImageSize.LANDSCAPE_768_512, label: '768×512', aspect: 'Landscape' },
    { value: ImageSize.PORTRAIT_1024_1536, label: '1024×1536', aspect: 'Portrait HD' },
    { value: ImageSize.LANDSCAPE_1536_1024, label: '1536×1024', aspect: 'Landscape HD' }
  ];

  const qualityOptions = [
    { value: ImageQuality.STANDARD, label: 'Standard', description: 'Good quality, faster generation' },
    { value: ImageQuality.HD, label: 'HD', description: 'High quality, slower generation' },
    { value: ImageQuality.ULTRA_HD, label: 'Ultra HD', description: 'Best quality, slowest generation' }
  ];

  const styleOptions = [
    { value: ImageStyle.NATURAL, label: 'Natural', description: 'Realistic and natural looking' },
    { value: ImageStyle.VIVID, label: 'Vivid', description: 'Enhanced colors and contrast' },
    { value: ImageStyle.ARTISTIC, label: 'Artistic', description: 'Creative and stylized' },
    { value: ImageStyle.PHOTOGRAPHIC, label: 'Photographic', description: 'Photo-realistic style' }
  ];

  return (
    <div className="space-y-6">
      {/* Main Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Image Description
        </label>
        <textarea
          value={request.prompt || ''}
          onChange={(e) => handleInputChange('prompt', e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          disabled={isGenerating}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Be specific and descriptive for better results
        </p>
      </div>

      {/* Negative Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Negative Prompt (Optional)
        </label>
        <textarea
          value={request.negativePrompt || ''}
          onChange={(e) => handleInputChange('negativePrompt', e.target.value)}
          placeholder="What you don't want in the image..."
          className="w-full h-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          disabled={isGenerating}
        />
      </div>

      {/* Basic Settings */}
      <div className="grid grid-cols-2 gap-4">
        {/* Image Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Size
          </label>
          <select
            value={request.size || ImageSize.SQUARE_1024}
            onChange={(e) => handleInputChange('size', e.target.value as ImageSize)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isGenerating}
          >
            {imageSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.aspect})
              </option>
            ))}
          </select>
        </div>

        {/* Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quality
          </label>
          <select
            value={request.quality || ImageQuality.STANDARD}
            onChange={(e) => handleInputChange('quality', e.target.value as ImageQuality)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isGenerating}
          >
            {qualityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {styleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleInputChange('style', option.value)}
              className={`p-3 text-left border rounded-lg transition-colors ${
                request.style === option.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              disabled={isGenerating}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-white">
                {option.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
        disabled={isGenerating}
      >
        <Settings className="w-4 h-4" />
        <span>Advanced Settings</span>
        <motion.div
          animate={{ rotate: showAdvanced ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Sliders className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Advanced Settings */}
      <motion.div
        initial={false}
        animate={{ height: showAdvanced ? 'auto' : 0, opacity: showAdvanced ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="space-y-4 pt-2">
          {/* Number of Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Images: {request.count || 1}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={request.count || 1}
              onChange={(e) => handleInputChange('count', parseInt(e.target.value))}
              className="w-full"
              disabled={isGenerating}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
            </div>
          </div>

          {/* Guidance Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Guidance Scale: {request.guidanceScale || 7.5}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={request.guidanceScale || 7.5}
              onChange={(e) => handleInputChange('guidanceScale', parseFloat(e.target.value))}
              className="w-full"
              disabled={isGenerating}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>1 (Creative)</span>
              <span>20 (Precise)</span>
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Generation Steps: {request.steps || 20}
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={request.steps || 20}
              onChange={(e) => handleInputChange('steps', parseInt(e.target.value))}
              className="w-full"
              disabled={isGenerating}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>10 (Fast)</span>
              <span>50 (High Quality)</span>
            </div>
          </div>

          {/* Seed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seed (Optional)
            </label>
            <input
              type="number"
              value={request.seed || ''}
              onChange={(e) => handleInputChange('seed', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Random seed for reproducible results"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isGenerating}
            />
          </div>
        </div>
      </motion.div>

      {/* Generate Button */}
      <div className="pt-4">
        {hasInsufficientCredits && (
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 mb-3">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Insufficient credits for this generation</span>
          </div>
        )}
        
        <button
          onClick={onGenerate}
          disabled={isGenerating || !request.prompt || hasInsufficientCredits}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            isGenerating || !request.prompt || hasInsufficientCredits
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : hasInsufficientCredits
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Wand2 className="w-5 h-5" />
              </motion.div>
              <span>Generating...</span>
            </>
          ) : hasInsufficientCredits ? (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Add Credits to Generate</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate Images</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};