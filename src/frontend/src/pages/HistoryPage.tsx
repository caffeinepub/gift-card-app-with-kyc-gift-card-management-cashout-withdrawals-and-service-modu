import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { getLocalTransactions, type LocalTransaction } from '../state/localTransactions';
import HistoryTransactionRow from '../components/history/HistoryTransactionRow';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);

  useEffect(() => {
    // Load transactions on mount
    const loadTransactions = () => {
      const allTransactions = getLocalTransactions();
      setTransactions(allTransactions);
    };

    loadTransactions();

    // Listen for new transactions
    const handleTransactionUpdate = () => {
      loadTransactions();
    };

    window.addEventListener('localTransactionAdded', handleTransactionUpdate);

    return () => {
      window.removeEventListener('localTransactionAdded', handleTransactionUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/' })}
              className="lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Transaction History</h1>
              <p className="text-sm text-muted-foreground">
                {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {transactions.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ArrowLeft className="h-8 w-8 text-muted-foreground rotate-90" />
              </div>
              <h3 className="text-lg font-semibold">No transactions yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your transaction history will appear here once you start using the app.
              </p>
              <Button
                onClick={() => navigate({ to: '/' })}
                className="mt-4"
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="divide-y divide-border">
            {transactions.map((transaction) => (
              <HistoryTransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
