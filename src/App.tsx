import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { authService } from './services/auth';
import { AuthPage } from './components/Auth/AuthPage';
import { Navigation } from './components/Layout/Navigation';
import { MainLayout } from './components/Layout/MainLayout';
import { AppRouter } from './components/Layout/AppRouter';
import { PaymentModal } from './components/Payment/PaymentModal';
import { LoadingSpinner } from './components/UI/LoadingSpinner';
import { NavigationProvider } from './contexts/NavigationContext';
import { useQuery } from '@tanstack/react-query';
import { apiService } from './services/api';
import { CreditBalance as CreditBalanceType } from './types';
import toast from 'react-hot-toast';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Get credit balance
  const { data: creditBalance, refetch: refetchBalance } = useQuery<CreditBalanceType>({
    queryKey: ['creditBalance'],
    queryFn: () => apiService.get<CreditBalanceType>('/v1/credits/balance'),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInsufficientCredits = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    refetchBalance();
    toast.success('Credits added successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <NavigationProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Top Navigation */}
        <Navigation 
          user={user} 
          creditBalance={creditBalance?.currentBalance || 0}
          onSignOut={() => authService.signOut()}
        />

        {/* Main Layout with Side Menu */}
        <MainLayout className="pt-16">
          <AppRouter
            creditBalance={creditBalance?.currentBalance || 0}
            creditBalanceData={creditBalance}
            onInsufficientCredits={handleInsufficientCredits}
            onTopUp={() => setShowPaymentModal(true)}
          />
        </MainLayout>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <PaymentModal
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              onSuccess={handlePaymentSuccess}
              currentBalance={creditBalance?.currentBalance || 0}
            />
          )}
        </AnimatePresence>
      </div>
    </NavigationProvider>
  );
}

export default App;