import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  CreditCard, 
  Wallet,
  DollarSign,
  Coins,
  Check
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentBalance: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentBalance
}) => {
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [processing, setProcessing] = useState(false);

  const creditPackages = [
    { id: 'small', credits: 500, price: 9.99, popular: false },
    { id: 'medium', credits: 1200, price: 19.99, popular: true },
    { id: 'large', credits: 2500, price: 39.99, popular: false },
    { id: 'xl', credits: 5000, price: 69.99, popular: false }
  ];

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Credits
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current balance: {currentBalance.toLocaleString()} credits
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Credit Packages */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Choose Credit Package
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {creditPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {pkg.credits.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Credits
                    </div>
                    <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      ${pkg.price}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ${(pkg.price / pkg.credits * 1000).toFixed(2)}/1k credits
                    </div>
                  </div>
                  
                  {selectedPackage === pkg.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border rounded-lg flex items-center space-x-3 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Credit Card
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Visa, Mastercard, PayPal
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 border rounded-lg flex items-center space-x-3 transition-all ${
                  paymentMethod === 'crypto'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Wallet className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Cryptocurrency
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    BTC, ETH, USDC
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Summary */}
          {selectedPackage && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Order Summary
              </h4>
              {(() => {
                const pkg = creditPackages.find(p => p.id === selectedPackage);
                if (!pkg) return null;
                
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Credits:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {pkg.credits.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Price:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        ${pkg.price}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-900 dark:text-white">
                          New Balance:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {(currentBalance + pkg.credits).toLocaleString()} credits
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || processing}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
          >
            {processing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Coins className="w-5 h-5" />
                </motion.div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                <span>Purchase Credits</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};