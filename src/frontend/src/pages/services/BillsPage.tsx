import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { FileText, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../state/localTransactions';

export default function BillsPage() {
  const [billerReference, setBillerReference] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billerReference || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addLocalTransaction({
      type: 'bills',
      amount: parseFloat(amount),
      currency: 'USD',
      description: `Bill payment for ${billerReference}`,
      status: 'pending',
    });

    toast.success('Bill payment logged (placeholder)');
    setBillerReference('');
    setAmount('');
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Bills Payment</h1>
          <p className="text-muted-foreground mt-1">
            Pay your utility bills
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <Badge variant="secondary" className="mr-2">Coming Soon</Badge>
          This is a placeholder. Real bills payment integration will be added in a future update.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Pay Bill</CardTitle>
          <CardDescription>
            Pay electricity, water, internet, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Biller Reference</Label>
              <Input
                id="reference"
                value={billerReference}
                onChange={(e) => setBillerReference(e.target.value)}
                placeholder="Account or meter number"
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
                placeholder="50.00"
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
