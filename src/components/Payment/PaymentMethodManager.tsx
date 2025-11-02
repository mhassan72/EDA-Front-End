import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, 
  Wallet, 
  Plus, 
  Trash2, 
  Star,
  Shield,
  X
} from 'lucide-react';
import { PaymentMethod } from '@/types';
import { creditService } from '@/services/credit';
import toast from 'react-hot-toast';

interface PaymentMethodManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentMethodManager: React.FC<PaymentMethodManagerProps> = ({
  isOpen,
  onClose
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'credit_card' as 'credit_card' | 'paypal' | 'crypto',
    name: '',
    metadata: {}
  });

  const queryClient = useQueryClient();

  // Get payment methods
  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => creditService.getPaymentMethods(),
    enabled: isOpen,
  });

  // Add payment method mutation
  const addMethodMutation = useMutation({
    mutationFn: (method: Omit<PaymentMethod, 'id'>) => creditService.addPaymentMethod(method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      setShowAddForm(false);
      setNewMethod({ type: 'credit_card', name: '', metadata: {} });
      toast.success('Payment method added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add payment method');
    },
  });

  // Remove payment method mutation
  const removeMethodMutation = useMutation({
    mutationFn: (methodId: string) => creditService.removePaymentMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast.success('Payment method removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove payment method');
    },
  });

  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: (methodId: string) => creditService.setDefaultPaymentMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast.success('Default payment method updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update default payment method');
    },
  });

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="w-5 h-5" />;
      case 'paypal':
        return <Wallet className="w-5 h-5" />;
      case 'crypto':
        return <Wallet className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'credit_card':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'paypal':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'crypto':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const handleAddMethod = () => {
    if (!newMethod.name.trim()) {
      toast.error('Please enter a name for the payment method');
      return;
    }

    addMethodMutation.mutate({
      type: newMethod.type,
      name: newMethod.name,
      isDefault: (paymentMethods?.length || 0) === 0, // First method is default
      metadata: newMethod.metadata
    });
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
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Payment Methods
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your payment methods for credit purchases
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add New Method Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors mb-6"
            >
              <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">Add Payment Method</span>
            </button>
          )}

          {/* Add Method Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Add New Payment Method
                </h3>
                
                <div className="space-y-4">
                  {/* Method Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
                        { value: 'paypal', label: 'PayPal', icon: Wallet },
                        { value: 'crypto', label: 'Crypto', icon: Wallet }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setNewMethod(prev => ({ ...prev, type: value as any }))}
                          className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                            newMethod.type === value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                        >
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Method Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={newMethod.name}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., My Visa Card, PayPal Account"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddMethod}
                      disabled={addMethodMutation.isPending}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                    >
                      {addMethodMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add Method</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewMethod({ type: 'credit_card', name: '', metadata: {} });
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment Methods List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : paymentMethods && paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getMethodColor(method.type)}`}>
                        {getMethodIcon(method.type)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {method.name}
                          </h3>
                          {method.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <Star className="w-3 h-3 mr-1" />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {method.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => setDefaultMutation.mutate(method.id)}
                          disabled={setDefaultMutation.isPending}
                          className="p-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => removeMethodMutation.mutate(method.id)}
                        disabled={removeMethodMutation.isPending}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        title="Remove method"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span>Secured with 256-bit SSL encryption</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Payment Methods
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add a payment method to purchase credits easily
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Payment Method</span>
              </button>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Your payment information is secure
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  We use industry-standard encryption and never store your full payment details. 
                  All transactions are processed through secure, PCI-compliant payment processors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};