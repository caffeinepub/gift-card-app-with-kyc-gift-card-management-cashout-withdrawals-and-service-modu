import { Badge } from '../ui/badge';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Wallet } from 'lucide-react';
import type { LocalTransaction } from '../../state/localTransactions';

interface HistoryTransactionRowProps {
  transaction: LocalTransaction;
}

export default function HistoryTransactionRow({ transaction }: HistoryTransactionRowProps) {
  const getIcon = () => {
    if (transaction.direction === 'sent') {
      return <ArrowUpRight className="h-5 w-5 text-red-500" />;
    }
    if (transaction.direction === 'received') {
      return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
    }
    if (transaction.direction === 'swap') {
      return <ArrowLeftRight className="h-5 w-5 text-blue-500" />;
    }
    return <Wallet className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = () => {
    const displayCurrency = transaction.asset || transaction.currency;
    const prefix = transaction.direction === 'received' ? '+' : '';
    
    if (transaction.direction === 'swap' && transaction.fromAsset && transaction.toAsset) {
      return `${transaction.fromAsset} → ${transaction.toAsset}`;
    }
    
    return `${prefix}${transaction.amount} ${displayCurrency}`;
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight truncate">
          {transaction.description}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatTimestamp(transaction.timestamp)}
        </p>
      </div>
      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
        <p className="font-semibold text-sm">
          {formatAmount()}
        </p>
        <Badge 
          variant="outline" 
          className={`text-[10px] px-2 py-0.5 h-5 capitalize ${getStatusColor()}`}
        >
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
}
