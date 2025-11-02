import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  History, 
  Download, 
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { CreditTransaction, TransactionType, CreditSource } from '@/types';
import { creditService } from '@/services/credit';
import { format } from 'date-fns';

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  isOpen,
  onClose
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    source: '',
    startDate: '',
    endDate: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState<CreditTransaction | null>(null);

  const { data: transactionData, isLoading, refetch } = useQuery({
    queryKey: ['transactions', currentPage, filters],
    queryFn: () => creditService.getTransactionHistory(
      currentPage,
      20,
      {
        type: filters.type || undefined,
        source: filters.source || undefined,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      }
    ),
    enabled: isOpen,
  });

  const filteredTransactions = transactionData?.transactions.filter(transaction =>
    transaction.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.ADDITION:
      case TransactionType.PAYMENT:
      case TransactionType.WELCOME_BONUS:
        return <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case TransactionType.DEDUCTION:
        return <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case TransactionType.REFUND:
        return <ArrowDownLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.ADDITION:
      case TransactionType.PAYMENT:
      case TransactionType.WELCOME_BONUS:
        return 'text-green-600 dark:text-green-400';
      case TransactionType.DEDUCTION:
        return 'text-red-600 dark:text-red-400';
      case TransactionType.REFUND:
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSourceLabel = (source: CreditSource) => {
    switch (source) {
      case CreditSource.AI_INTERACTION:
        return 'AI Chat';
      case CreditSource.IMAGE_GENERATION:
        return 'Image Generation';
      case CreditSource.PAYMENT:
        return 'Payment';
      case CreditSource.WELCOME_BONUS:
        return 'Welcome Bonus';
      case CreditSource.ADMIN_ADJUSTMENT:
        return 'Admin Adjustment';
      default:
        return (source as string).replace('_', ' ');
    }
  };

  const exportTransactions = () => {
    if (!transactionData?.transactions) return;
    
    const csv = [
      ['Date', 'Type', 'Source', 'Amount', 'Balance Before', 'Balance After', 'Reason', 'Status'].join(','),
      ...transactionData.transactions.map(t => [
        format(new Date(t.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        t.type,
        t.source,
        t.amount,
        t.balanceBefore,
        t.balanceAfter,
        `"${t.reason}"`,
        t.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Transaction History
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {transactionData?.total || 0} total transactions
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportTransactions}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Download className="w-5 h-5" />
            </button>
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

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Types</option>
              <option value="addition">Addition</option>
              <option value="deduction">Deduction</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
              <option value="welcome_bonus">Welcome Bonus</option>
            </select>

            {/* Source Filter */}
            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Sources</option>
              <option value="ai_interaction">AI Chat</option>
              <option value="image_generation">Image Generation</option>
              <option value="payment">Payment</option>
              <option value="welcome_bonus">Welcome Bonus</option>
              <option value="admin_adjustment">Admin Adjustment</option>
            </select>

            {/* Start Date */}
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />

            {/* End Date */}
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No transactions found</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transaction.reason}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getSourceLabel(transaction.source)} • {format(new Date(transaction.timestamp), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === TransactionType.DEDUCTION ? '-' : '+'}
                        {Math.abs(transaction.amount).toLocaleString()} credits
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Balance: {transaction.balanceAfter.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {transactionData && transactionData.total > 20 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, transactionData.total)} of {transactionData.total} transactions
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                {currentPage}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!transactionData.hasMore}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Transaction Details
                  </h3>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 mb-1">Transaction ID</label>
                      <p className="font-mono text-gray-900 dark:text-white">{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 mb-1">Status</label>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        selectedTransaction.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 mb-1">Type</label>
                      <p className="text-gray-900 dark:text-white capitalize">{selectedTransaction.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 mb-1">Source</label>
                      <p className="text-gray-900 dark:text-white">{getSourceLabel(selectedTransaction.source)}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 mb-1">Amount</label>
                      <p className={`font-semibold ${getTransactionColor(selectedTransaction.type)}`}>
                        {selectedTransaction.type === TransactionType.DEDUCTION ? '-' : '+'}
                        {Math.abs(selectedTransaction.amount).toLocaleString()} credits
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 mb-1">Date</label>
                      <p className="text-gray-900 dark:text-white">
                        {format(new Date(selectedTransaction.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 mb-1">Balance Before</label>
                      <p className="text-gray-900 dark:text-white">{selectedTransaction.balanceBefore.toLocaleString()} credits</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 mb-1">Balance After</label>
                      <p className="text-gray-900 dark:text-white">{selectedTransaction.balanceAfter.toLocaleString()} credits</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 mb-1">Reason</label>
                    <p className="text-gray-900 dark:text-white">{selectedTransaction.reason}</p>
                  </div>

                  {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 mb-1">Metadata</label>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm">
                        <pre className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {JSON.stringify(selectedTransaction.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};