import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../state/localTransactions';
import { BETTING_PROVIDERS, AMOUNT_CHIPS } from '../../config/betting';

export default function BettingPage() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState('');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!provider || !accountId || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const transaction = {
      id: `betting-${Date.now()}`,
      type: 'betting' as const,
      description: `${provider} Top-up - ${accountId}`,
      amount: parseFloat(amount),
      currency: 'ngn' as const,
      status: 'pending' as const,
      timestamp: BigInt(Date.now() * 1000000),
      metadata: {
        provider,
        accountId,
      },
    };

    addLocalTransaction(transaction);
    toast.success('Betting account top-up successful');
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[oklch(0.35_0.08_280)] to-[oklch(0.25_0.08_280)] pb-24">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/services/bills' })}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-white">Betting Top-up</h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Betting Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {BETTING_PROVIDERS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID / User ID</Label>
                <Input
                  id="accountId"
                  type="text"
                  placeholder="Enter your account ID"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Select</Label>
                <div className="grid grid-cols-3 gap-2">
                  {AMOUNT_CHIPS.map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant="outline"
                      onClick={() => handleQuickAmount(value)}
                      className="h-12"
                    >
                      ₦{value.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
