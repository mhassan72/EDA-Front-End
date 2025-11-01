import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CreditBalance as CreditBalanceType } from '@/types';
import { CreditDashboard } from './CreditDashboard';
import { TransactionHistory } from './TransactionHistory';
import { NotificationPreferences } from './NotificationPreferences';
import { PaymentMethodManager } from '../Payment/PaymentMethodManager';

interface CreditBalanceProps {
  balance: CreditBalanceType | undefined;
  onTopUp: () => void;
}

export const CreditBalance: React.FC<CreditBalanceProps> = ({
  balance,
  onTopUp
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  return (
    <>
      <CreditDashboard
        balance={balance}
        onTopUp={onTopUp}
        onViewHistory={() => setShowHistory(true)}
        onManageNotifications={() => setShowNotifications(true)}
      />

      <AnimatePresence>
        {showHistory && (
          <TransactionHistory
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
          />
        )}

        {showNotifications && (
          <NotificationPreferences
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        )}

        {showPaymentMethods && (
          <PaymentMethodManager
            isOpen={showPaymentMethods}
            onClose={() => setShowPaymentMethods(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};