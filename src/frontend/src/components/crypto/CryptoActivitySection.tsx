import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { getLocalTransactions, type LocalTransaction } from '../../state/localTransactions';
import CryptoActivityRow from './CryptoActivityRow';

export default function CryptoActivitySection() {
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = () => {
      const allTransactions = getLocalTransactions();
      const cryptoTransactions = allTransactions.filter(
        (tx) => tx.type === 'crypto' || tx.metadata?.asset || tx.metadata?.direction
      );
      setTransactions(cryptoTransactions);
      setIsLoading(false);
    };

    loadTransactions();

    const handleUpdate = () => {
      loadTransactions();
    };

    window.addEventListener('localTransactionAdded', handleUpdate);
    return () => window.removeEventListener('localTransactionAdded', handleUpdate);
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.metadata?.direction === 'send';
    if (filter === 'received') return tx.metadata?.direction === 'receive';
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {filter !== 'all' ? filter : ''} transactions yet
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <CryptoActivityRow key={tx.id} transaction={tx} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
