import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, User } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../state/localTransactions';

const PROVIDERS = ['MTN', 'Airtel', 'Glo', '9mobile'];
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function AirtimePage() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!provider || !phoneNumber || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const transaction = {
      id: `airtime-${Date.now()}`,
      type: 'airtime' as const,
      description: `${provider} Airtime - ${phoneNumber}`,
      amount: parseFloat(amount),
      currency: 'ngn' as const,
      status: 'pending' as const,
      timestamp: BigInt(Date.now() * 1000000),
      metadata: {
        provider,
        phoneNumber,
      },
    };

    addLocalTransaction(transaction);
    toast.success('Airtime purchase successful');
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
            <h1 className="text-2xl font-bold text-white">Buy Airtime</h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Network Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    +234
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="8012345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-14 pr-10"
                    required
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
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
                  {QUICK_AMOUNTS.map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant="outline"
                      onClick={() => handleQuickAmount(value)}
                      className="h-12"
                    >
                      ₦{value}
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
