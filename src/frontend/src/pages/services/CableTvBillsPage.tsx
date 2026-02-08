import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../state/localTransactions';

export default function CableTvBillsPage() {
  const navigate = useNavigate();
  const [smartcardNumber, setSmartcardNumber] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const transaction = {
      id: `cable-${Date.now()}`,
      type: 'cable' as const,
      description: `Cable | TV Bills - ${smartcardNumber}`,
      amount: parseFloat(amount),
      currency: 'usd' as const,
      status: 'pending' as const,
      timestamp: BigInt(Date.now() * 1000000),
      metadata: {
        accountId: smartcardNumber,
      },
    };

    addLocalTransaction(transaction);
    toast.success('Cable TV payment successful');
    navigate({ to: '/' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/services/bills' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Cable | TV Bills</h1>
          <p className="text-sm text-muted-foreground">
            Pay your cable TV subscription
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          Cable TV bill payment is currently under development. Check back soon!
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smartcard">Smartcard / Decoder Number</Label>
              <Input
                id="smartcard"
                type="text"
                placeholder="Enter smartcard number"
                value={smartcardNumber}
                onChange={(e) => setSmartcardNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Pay Bill
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
