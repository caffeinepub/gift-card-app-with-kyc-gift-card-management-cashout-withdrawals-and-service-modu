import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Wifi, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../state/localTransactions';

export default function WifiInternetPage() {
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountId || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addLocalTransaction({
      type: 'bills',
      amount: parseFloat(amount),
      currency: 'USD',
      description: `Wifi | Internet bill payment for account ${accountId}`,
      status: 'pending',
    });

    toast.success('Internet payment logged (placeholder)');
    setAccountId('');
    setAmount('');
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Wifi className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Wifi | Internet</h1>
          <p className="text-muted-foreground mt-1">
            Pay your internet bills
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <Badge variant="secondary" className="mr-2">Coming Soon</Badge>
          This is a placeholder. Real internet provider integration will be added in a future update.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Pay Internet Bill</CardTitle>
          <CardDescription>
            Top up your internet subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account">Account ID</Label>
              <Input
                id="account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Enter your customer ID"
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="30.00"
                disabled={isProcessing}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay Bill'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
