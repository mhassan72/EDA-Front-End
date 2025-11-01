import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, 
  ExternalLink, 
  Check, 
  Clock, 
  AlertCircle,
  Copy,
  Search,
  X,
  RefreshCw,
  Link as LinkIcon
} from 'lucide-react';
import { creditService } from '@/services/credit';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface BlockchainVerificationProps {
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BlockchainVerification: React.FC<BlockchainVerificationProps> = ({
  transactionId,
  isOpen,
  onClose
}) => {
  const [manualTxId, setManualTxId] = useState('');

  // Get blockchain verification data
  const { data: verification, isLoading, refetch } = useQuery({
    queryKey: ['blockchainVerification', transactionId],
    queryFn: () => creditService.verifyBlockchainTransaction(transactionId),
    enabled: isOpen && !!transactionId,
    refetchInterval: (data) => data?.verified ? false : 10000, // Poll every 10s if not verified
  });

  const handleCopyTxId = (txId: string) => {
    navigator.clipboard.writeText(txId);
    toast.success('Transaction ID copied to clipboard');
  };

  const handleVerifyManual = () => {
    if (!manualTxId.trim()) {
      toast.error('Please enter a transaction ID');
      return;
    }
    // This would trigger verification for a different transaction
    toast.info('Manual verification not implemented in demo');
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />;
    }
    
    if (verification?.verified) {
      return <Check className="w-6 h-6 text-green-600 dark:text-green-400" />;
    }
    
    if (verification?.verified === false) {
      return <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
    }
    
    return <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
  };

  const getStatusColor = () => {
    if (verification?.verified) {
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
    }
    
    if (verification?.verified === false) {
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
    }
    
    return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900';
  };

  const getStatusText = () => {
    if (isLoading) return 'Verifying...';
    if (verification?.verified) return 'Verified';
    if (verification?.verified === false) return 'Not Verified';
    return 'Pending';
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
            <div className={`p-2 rounded-lg ${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Blockchain Verification
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Verify transaction on the blockchain
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Status Overview */}
          <div className="mb-8">
            <div className={`p-4 rounded-lg ${getStatusColor()}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon()}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {getStatusText()}
                    </h3>
                    <p className="text-sm opacity-80">
                      {verification?.verified 
                        ? 'Transaction has been verified on the blockchain'
                        : verification?.verified === false
                        ? 'Transaction could not be verified'
                        : 'Verification in progress...'
                      }
                    </p>
                  </div>
                </div>
                
                {verification?.confirmations && (
                  <div className="text-right">
                    <div className="font-semibold">{verification.confirmations}</div>
                    <div className="text-sm opacity-80">Confirmations</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-6">
            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction ID
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white break-all">
                  {transactionId}
                </div>
                <button
                  onClick={() => handleCopyTxId(transactionId)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Blockchain Details */}
            {verification && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {verification.blockHash && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Block Hash
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white break-all">
                        {verification.blockHash}
                      </div>
                      <button
                        onClick={() => handleCopyTxId(verification.blockHash!)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {verification.confirmations !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmations
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {verification.confirmations}
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {verification.confirmations >= 6 ? (
                            <span className="text-green-600 dark:text-green-400">Fully Confirmed</span>
                          ) : verification.confirmations >= 3 ? (
                            <span className="text-amber-600 dark:text-amber-400">Partially Confirmed</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">Unconfirmed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {verification.timestamp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Block Timestamp
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {format(new Date(verification.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Network
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                    Ethereum Mainnet
                  </div>
                </div>
              </div>
            )}

            {/* Explorer Link */}
            {verification?.explorerUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blockchain Explorer
                </label>
                <a
                  href={verification.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>View on Etherscan</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Manual Verification */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Verify Different Transaction
              </h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={manualTxId}
                  onChange={(e) => setManualTxId(e.target.value)}
                  placeholder="Enter transaction ID to verify..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleVerifyManual}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Verify</span>
                </button>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    Blockchain Security
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    All cryptocurrency transactions are recorded on the blockchain and can be 
                    independently verified. This ensures complete transparency and immutability 
                    of your payment records.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Progress */}
            {verification && verification.confirmations !== undefined && verification.confirmations < 6 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">
                      Confirmation in Progress
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Your transaction has {verification.confirmations} confirmation{verification.confirmations !== 1 ? 's' : ''}. 
                      We recommend waiting for at least 6 confirmations for full security.
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Confirmation Progress</span>
                        <span>{verification.confirmations}/6</span>
                      </div>
                      <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(verification.confirmations / 6) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};