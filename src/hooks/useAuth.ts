// Re-export the useAuth hook from context for convenience
export { useAuth } from '@/contexts/AuthContext';

// Additional authentication-related hooks can be added here
export const useAuthToken = () => {
  const getToken = async (): Promise<string | null> => {
    try {
      const { authService } = await import('@/services/auth');
      return await authService.getIdToken();
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  };

  return { getToken };
};