import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Zap, 
  DollarSign, 
  Star,
  Clock
} from 'lucide-react';
import { AIModel } from '@/types';

interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange
}) => {
  const getModelIcon = (modelId: string) => {
    if (modelId.includes('flux-schnell')) return '⚡';
    if (modelId.includes('flux-dev')) return '🎨';
    if (modelId.includes('dall-e')) return '🤖';
    return '🎭';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 9) return 'text-green-600 dark:text-green-400';
    if (score >= 7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        AI Model
      </label>
      
      <div className="space-y-3">
        {models.map((model) => (
          <motion.div
            key={model.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
              selectedModel === model.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onClick={() => onModelChange(model.id)}
          >
            {/* Selection Indicator */}
            {selectedModel === model.id && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
            )}

            {/* Model Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getModelIcon(model.id)}</div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {model.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {model.description}
                  </p>
                </div>
              </div>
              
              {model.isActive ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  Inactive
                </span>
              )}
            </div>

            {/* Model Stats */}
            {model.performance && (
              <div className="grid grid-cols-4 gap-4 text-sm">
                {/* Speed Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Zap className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className={`font-medium ${getPerformanceColor(model.performance.speedScore || 0)}`}>
                    {(model.performance.speedScore || 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Speed</div>
                </div>

                {/* Quality Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className={`font-medium ${getPerformanceColor(model.performance.qualityScore || 0)}`}>
                    {(model.performance.qualityScore || 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Quality</div>
                </div>

                {/* Cost Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                  </div>
                  <div className={`font-medium ${getPerformanceColor(model.performance.costScore || 0)}`}>
                    {(model.performance.costScore || 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Value</div>
                </div>

                {/* Latency */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatLatency(model.performance.averageLatency || 0)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Latency</div>
                </div>
              </div>
            )}

            {/* Pricing Info */}
            {model.pricing && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Cost per image:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {model.pricing.minimumCost || 0} credits
                  </span>
                </div>
              </div>
            )}

            {/* Model Tags */}
            {model.metadata?.tags && model.metadata.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {model.metadata.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
                {model.metadata.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    +{model.metadata.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Capabilities */}
            {model.capabilities && (
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>Max: {model.capabilities.maxTokens || 0} tokens</span>
                  {model.capabilities.supportsStreaming && (
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                      Streaming
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {models.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Cpu className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No image generation models available</p>
        </div>
      )}
    </div>
  );
};