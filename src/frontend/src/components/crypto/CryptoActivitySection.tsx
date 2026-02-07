import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import CryptoActivityRow from './CryptoActivityRow';
import { getLocalTransactions, type LocalTransaction } from '../../state/localTransactions';

export default function CryptoActivitySection() {
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Load transactions on mount
    const loadTransactions = () => {
      const allTransactions = getLocalTransactions();
      // Filter to crypto-related transactions
      const cryptoTransactions = allTransactions.filter(
        (tx) => tx.type === 'crypto' || tx.asset || tx.direction
      );
      setTransactions(cryptoTransactions);
      setIsLoading(false);
    };

    loadTransactions();

    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      loadTransactions();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleLocalUpdate = () => {
      loadTransactions();
    };
    window.addEventListener('localTransactionAdded', handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localTransactionAdded', handleLocalUpdate);
    };
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'sent') return tx.direction === 'sent';
    if (activeFilter === 'received') return tx.direction === 'received';
    return true;
  });

  return (
    <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activity</h3>

        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter} className="mt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No transactions yet</p>
                <p className="text-xs mt-1">Your crypto activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTransactions.map((tx) => (
                  <CryptoActivityRow key={tx.id} transaction={tx} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
