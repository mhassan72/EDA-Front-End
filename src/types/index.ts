// Core AI Assistant Types
export interface User {
  uid: string;
  email?: string;
  name?: string;
  emailVerified: boolean;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultTextModel: string;
  defaultVisionModel: string;
  defaultImageModel: string;
  defaultEmbeddingModel: string;
  preferredQuality: 'standard' | 'hd' | 'ultra_hd';
  autoSelectModel: boolean;
  budgetLimits: BudgetLimits;
  modelPreferences: ModelPreferences;
}

export interface BudgetLimits {
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  perRequestLimit: number;
  alertThresholds: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface ModelPreferences {
  prioritizeSpeed: boolean;
  prioritizeCost: boolean;
  prioritizeQuality: boolean;
}

// Credit System Types
export interface CreditBalance {
  userId: string;
  currentBalance: number;
  reservedCredits: number;
  availableBalance: number;
  lastUpdated: Date;
  accountStatus: 'active' | 'suspended' | 'limited';
  lifetimeCreditsEarned: number;
  lifetimeCreditsSpent: number;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  source: CreditSource;
  reason: string;
  metadata: TransactionMetadata;
  timestamp: Date;
  status: TransactionStatus;
}

export enum TransactionType {
  DEDUCTION = 'deduction',
  ADDITION = 'addition',
  WELCOME_BONUS = 'welcome_bonus',
  PAYMENT = 'payment',
  REFUND = 'refund'
}

export enum CreditSource {
  AI_INTERACTION = 'ai_interaction',
  IMAGE_GENERATION = 'image_generation',
  PAYMENT = 'payment',
  WELCOME_BONUS = 'welcome_bonus',
  ADMIN_ADJUSTMENT = 'admin_adjustment'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface TransactionMetadata {
  conversationId?: string;
  messageLength?: number;
  model?: string;
  paymentId?: string;
  sagaId?: string;
  [key: string]: any;
}

// AI Conversation Types
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastMessageAt: Date;
  totalCreditsUsed: number;
  status: 'active' | 'archived' | 'deleted';
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
  timestamp: Date;
  creditsUsed?: number;
  model?: string;
  metadata?: MessageMetadata;
}

export interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface MessageMetadata {
  processingTime?: number;
  tokenCount?: number;
  modelUsed?: string;
  costBreakdown?: CostBreakdown;
  [key: string]: any;
}

export interface CostBreakdown {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  baseCost: number;
  additionalCosts: Record<string, number>;
  totalCost: number;
}

// AI Model Types
export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: ModelCategory;
  provider: string;
  apiEndpoint: string;
  isActive: boolean;
  capabilities: ModelCapabilities;
  pricing: ModelPricing;
  performance: ModelPerformance;
  metadata: ModelMetadata;
}

export enum ModelCategory {
  TEXT_GENERATION = 'text_generation',
  VISION_MODEL = 'vision_model',
  IMAGE_GENERATION = 'image_generation',
  EMBEDDINGS = 'embeddings'
}

export interface ModelCapabilities {
  maxTokens: number;
  supportsStreaming: boolean;
  supportsImages: boolean;
  supportsTools: boolean;
  contextWindow: number;
  supportedLanguages?: string[];
  specialFeatures?: string[];
}

export interface ModelPricing {
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  minimumCost: number;
  currency: 'credits' | 'usd';
}

export interface ModelPerformance {
  averageLatency: number;
  tokensPerSecond: number;
  qualityScore: number;
  speedScore: number;
  costScore: number;
  reliabilityScore: number;
}

export interface ModelMetadata {
  addedAt: Date;
  lastUpdated: Date;
  addedBy: string;
  tags: string[];
}

// Image Generation Types
export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  model: string;
  size: ImageSize;
  quality: ImageQuality;
  style?: ImageStyle;
  count: number;
  seed?: number;
  guidanceScale?: number;
  steps?: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  size: ImageSize;
  format: string;
  fileSize: number;
  prompt: string;
  model: string;
  seed?: number;
  createdAt: Date;
  creditsUsed: number;
}

export enum ImageSize {
  SQUARE_256 = '256x256',
  SQUARE_512 = '512x512',
  SQUARE_1024 = '1024x1024',
  PORTRAIT_512_768 = '512x768',
  LANDSCAPE_768_512 = '768x512',
  PORTRAIT_1024_1536 = '1024x1536',
  LANDSCAPE_1536_1024 = '1536x1024'
}

export enum ImageQuality {
  STANDARD = 'standard',
  HD = 'hd',
  ULTRA_HD = 'ultra_hd'
}

export enum ImageStyle {
  NATURAL = 'natural',
  VIVID = 'vivid',
  ARTISTIC = 'artistic',
  PHOTOGRAPHIC = 'photographic'
}

// Payment Types
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'crypto';
  name: string;
  isDefault: boolean;
  metadata: Record<string, any>;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  creditAmount: number;
  paymentMethodId: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  id: string;
  status: PaymentStatus;
  amount: number;
  creditAmount: number;
  paymentMethod: string;
  processedAt: Date;
  error?: string;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
}

export enum NotificationType {
  LOW_BALANCE = 'low_balance',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  TASK_COMPLETED = 'task_completed',
  SYSTEM_ALERT = 'system_alert'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Real-time Update Types
export interface RealtimeUpdate {
  type: 'balance_update' | 'conversation_update' | 'notification' | 'task_progress';
  data: any;
  timestamp: Date;
}

export interface TaskProgress {
  taskId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  estimatedCompletion?: Date;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

// UI State Types
export interface ChatUIState {
  isLoading: boolean;
  isStreaming: boolean;
  currentModel: string;
  estimatedCost: number;
  hasInsufficientCredits: boolean;
}

export interface ImageGenerationUIState {
  isGenerating: boolean;
  progress: number;
  currentTask?: string;
  estimatedCost: number;
  hasInsufficientCredits: boolean;
}

export interface CreditUIState {
  balance: CreditBalance | null;
  recentTransactions: CreditTransaction[];
  isLoading: boolean;
  lastUpdated: Date | null;
}