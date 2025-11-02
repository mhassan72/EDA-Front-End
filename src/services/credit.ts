import { apiService } from './api';
import { 
  CreditBalance, 
  CreditTransaction, 
  PaymentRequest, 
  PaymentResult,
  PaymentMethod,
  Notification,
 
} from '@/types';

export class CreditService {
  private static instance: CreditService;

  private constructor() {}

  public static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService();
    }
    return CreditService.instance;
  }

  /**
   * Get current credit balance
   */
  async getCreditBalance(): Promise<CreditBalance> {
    return apiService.get<CreditBalance>('/v1/credits/balance');
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    page: number = 1, 
    limit: number = 20,
    filters?: {
      type?: string;
      source?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{
    transactions: CreditTransaction[];
    total: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.type) params.append('type', filters.type);
      if (filters.source) params.append('source', filters.source);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    }

    return apiService.get<{
      transactions: CreditTransaction[];
      total: number;
      hasMore: boolean;
    }>(`/v1/credits/transactions?${params.toString()}`);
  }

  /**
   * Get usage analytics
   */
  async getUsageAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalSpent: number;
    totalEarned: number;
    dailyUsage: Array<{ date: string; spent: number; earned: number }>;
    categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
    modelUsage: Array<{ model: string; usage: number; cost: number }>;
  }> {
    return apiService.get<{
      totalSpent: number;
      totalEarned: number;
      dailyUsage: Array<{ date: string; spent: number; earned: number }>;
      categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
      modelUsage: Array<{ model: string; usage: number; cost: number }>;
    }>(`/v1/credits/analytics?period=${period}`);
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiService.get<PaymentMethod[]>('/v1/payments/methods');
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    return apiService.post<PaymentMethod>('/v1/payments/methods', method);
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(methodId: string): Promise<void> {
    return apiService.delete<void>(`/v1/payments/methods/${methodId}`);
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    return apiService.put<void>(`/v1/payments/methods/${methodId}/default`);
  }

  /**
   * Process payment
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    return apiService.post<PaymentResult>('/v1/payments/process', request);
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(page: number = 1, limit: number = 20): Promise<{
    payments: PaymentResult[];
    total: number;
    hasMore: boolean;
  }> {
    return apiService.get<{
      payments: PaymentResult[];
      total: number;
      hasMore: boolean;
    }>(`/v1/payments/history?page=${page}&limit=${limit}`);
  }

  /**
   * Verify blockchain transaction
   */
  async verifyBlockchainTransaction(transactionId: string): Promise<{
    verified: boolean;
    blockHash?: string;
    confirmations?: number;
    timestamp?: Date;
    explorerUrl?: string;
  }> {
    return apiService.get<{
      verified: boolean;
      blockHash?: string;
      confirmations?: number;
      timestamp?: Date;
      explorerUrl?: string;
    }>(`/v1/payments/verify/${transactionId}`);
  }

  /**
   * Get notifications
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> {
    return apiService.get<{
      notifications: Notification[];
      total: number;
      unreadCount: number;
    }>(`/v1/notifications?page=${page}&limit=${limit}`);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    return apiService.put<void>(`/v1/notifications/${notificationId}/read`);
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: {
    lowBalanceThreshold: number;
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
  }): Promise<void> {
    return apiService.put<void>('/v1/notifications/preferences', preferences);
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<{
    lowBalanceThreshold: number;
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
  }> {
    return apiService.get<{
      lowBalanceThreshold: number;
      emailNotifications: boolean;
      pushNotifications: boolean;
      weeklyReports: boolean;
    }>('/v1/notifications/preferences');
  }

  /**
   * Subscribe to real-time balance updates
   */
  subscribeToBalanceUpdates(callback: (balance: CreditBalance) => void): () => void {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll use polling as a fallback
    const pollInterval = setInterval(async () => {
      try {
        const balance = await this.getCreditBalance();
        callback(balance);
      } catch (error) {
        console.error('Error polling balance updates:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }
}

// Export singleton instance
export const creditService = CreditService.getInstance();