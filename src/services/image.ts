import { apiService } from './api';
import { 
  ImageGenerationRequest, 
  GeneratedImage, 
  AIModel, 

  TaskProgress,
 
} from '@/types';

export class ImageService {
  private static instance: ImageService;

  private constructor() {}

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  /**
   * Get available image generation models
   */
  async getImageModels(): Promise<AIModel[]> {
    return apiService.get<AIModel[]>('/v1/models/image-generation');
  }

  /**
   * Estimate cost for image generation
   */
  async estimateCost(request: Partial<ImageGenerationRequest>): Promise<number> {
    return apiService.post<number>('/v1/images/estimate-cost', request);
  }

  /**
   * Generate images
   */
  async generateImages(request: ImageGenerationRequest): Promise<{ taskId: string }> {
    return apiService.post<{ taskId: string }>('/v1/images/generate', request);
  }

  /**
   * Get generation task status
   */
  async getTaskStatus(taskId: string): Promise<TaskProgress> {
    return apiService.get<TaskProgress>(`/v1/images/tasks/${taskId}/status`);
  }

  /**
   * Get generated images for a task
   */
  async getTaskResults(taskId: string): Promise<GeneratedImage[]> {
    return apiService.get<GeneratedImage[]>(`/v1/images/tasks/${taskId}/results`);
  }

  /**
   * Get user's image gallery
   */
  async getUserImages(page: number = 1, limit: number = 20): Promise<{
    images: GeneratedImage[];
    total: number;
    hasMore: boolean;
  }> {
    return apiService.get<{
      images: GeneratedImage[];
      total: number;
      hasMore: boolean;
    }>(`/v1/images/gallery?page=${page}&limit=${limit}`);
  }

  /**
   * Delete an image
   */
  async deleteImage(imageId: string): Promise<void> {
    return apiService.delete<void>(`/v1/images/${imageId}`);
  }

  /**
   * Download image
   */
  async downloadImage(imageId: string): Promise<Blob> {
    const response = await fetch(`/api/v1/images/${imageId}/download`, {
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download image');
    }
    
    return response.blob();
  }

  /**
   * Subscribe to real-time task updates
   */
  subscribeToTaskUpdates(taskId: string, onUpdate: (progress: TaskProgress) => void): () => void {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll use polling as a fallback
    const pollInterval = setInterval(async () => {
      try {
        const progress = await this.getTaskStatus(taskId);
        onUpdate(progress);
        
        if (progress.status === 'completed' || progress.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error polling task status:', error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }

  private async getAuthToken(): Promise<string | null> {
    // This should be imported from auth service
    const { authService } = await import('./auth');
    return authService.getIdToken();
  }
}

// Export singleton instance
export const imageService = ImageService.getInstance();