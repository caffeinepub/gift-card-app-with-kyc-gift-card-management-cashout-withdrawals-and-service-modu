import { Badge } from '../ui/badge';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import type { LocalTransaction } from '../../state/localTransactions';

interface CryptoActivityRowProps {
  transaction: LocalTransaction;
}

export default function CryptoActivityRow({ transaction }: CryptoActivityRowProps) {
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
    return <ArrowUpRight className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight truncate">
          {transaction.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatTimestamp(transaction.timestamp)}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-medium text-sm">
          {transaction.direction === 'received' ? '+' : '-'}
          {transaction.amount} {transaction.asset || transaction.currency}
        </p>
        <Badge className={`text-[10px] px-1.5 py-0 h-5 ${getStatusColor()}`}>
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
}
