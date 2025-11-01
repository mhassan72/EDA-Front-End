import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Grid3X3,
  List,
  RefreshCw,
  Calendar,
  Image as ImageIcon,
  X,
  ZoomIn,
  Share2,
  Copy
} from 'lucide-react';
import { GeneratedImage } from '@/types';
import { format } from 'date-fns';

interface ImageGalleryProps {
  images: GeneratedImage[];
  loading: boolean;
  onDelete: (imageId: string) => void;
  onDownload: (imageId: string, filename: string) => void;
  onRefresh: () => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  loading,
  onDelete,
  onDownload,
  onRefresh
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'model' | 'size'>('date');
  const [filterModel, setFilterModel] = useState<string>('all');

  // Get unique models for filter
  const uniqueModels = Array.from(new Set(images.map(img => img.model)));

  // Filter and sort images
  const filteredImages = images
    .filter(image => {
      const matchesSearch = image.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModel = filterModel === 'all' || image.model === filterModel;
      return matchesSearch && matchesModel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'model':
          return a.model.localeCompare(b.model);
        case 'size':
          return a.fileSize - b.fileSize;
        default:
          return 0;
      }
    });

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Gallery Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Image Gallery
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredImages.length} of {images.length} images
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Model Filter */}
          <select
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Models</option>
            {uniqueModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'model' | 'size')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="model">Sort by Model</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">Loading images...</p>
            </div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {searchQuery || filterModel !== 'all' ? 'No images match your filters' : 'No images generated yet'}
              </p>
              {searchQuery || filterModel !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterModel('all');
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredImages.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow'
                    : 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-4'
                }
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Image */}
                    <div className="relative group cursor-pointer" onClick={() => handleImageClick(image)}>
                      <img
                        src={image.thumbnailUrl}
                        alt={image.prompt}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {image.prompt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>{format(new Date(image.createdAt), 'MMM d, yyyy')}</span>
                        <span>{image.creditsUsed} credits</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {image.size}
                        </span>
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownload(image.id, `generated-${image.id}.png`);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(image.id);
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <img
                      src={image.thumbnailUrl}
                      alt={image.prompt}
                      className="w-16 h-16 object-cover rounded cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {image.prompt}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{format(new Date(image.createdAt), 'MMM d, yyyy HH:mm')}</span>
                        <span>{image.model}</span>
                        <span>{image.size}</span>
                        <span>{formatFileSize(image.fileSize)}</span>
                        <span>{image.creditsUsed} credits</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onDownload(image.id, `generated-${image.id}.png`)}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(image.id)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Image Details
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image */}
                  <div>
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.prompt}
                      className="w-full rounded-lg"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prompt
                      </label>
                      <div className="flex items-start space-x-2">
                        <p className="text-sm text-gray-900 dark:text-white flex-1 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          {selectedImage.prompt}
                        </p>
                        <button
                          onClick={() => handleCopyPrompt(selectedImage.prompt)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Model</label>
                        <p className="text-gray-900 dark:text-white">{selectedImage.model}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Size</label>
                        <p className="text-gray-900 dark:text-white">{selectedImage.size}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Credits Used</label>
                        <p className="text-gray-900 dark:text-white">{selectedImage.creditsUsed}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">File Size</label>
                        <p className="text-gray-900 dark:text-white">{formatFileSize(selectedImage.fileSize)}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Created</label>
                        <p className="text-gray-900 dark:text-white">
                          {format(new Date(selectedImage.createdAt), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                      {selectedImage.seed && (
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 font-medium">Seed</label>
                          <p className="text-gray-900 dark:text-white font-mono">{selectedImage.seed}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4">
                      <button
                        onClick={() => onDownload(selectedImage.id, `generated-${selectedImage.id}.png`)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => {
                          onDelete(selectedImage.id);
                          setSelectedImage(null);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};