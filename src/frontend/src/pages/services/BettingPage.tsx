import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Trophy, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../state/localTransactions';

export default function BettingPage() {
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
      type: 'betting',
      amount: parseFloat(amount),
      currency: 'USD',
      description: `Betting account top-up for ${accountId}`,
      status: 'pending',
    });

    toast.success('Betting top-up logged (placeholder)');
    setAccountId('');
    setAmount('');
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Betting</h1>
          <p className="text-muted-foreground mt-1">
            Top up your betting account
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <Badge variant="secondary" className="mr-2">Coming Soon</Badge>
          This is a placeholder. Real betting provider integration will be added in a future update.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Top Up Betting Account</CardTitle>
          <CardDescription>
            Add funds to your betting account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">Betting Account ID</Label>
              <Input
                id="accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Your betting account ID"
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
                placeholder="25.00"
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
                'Top Up Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
