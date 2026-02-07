import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../state/localTransactions';

const AMOUNT_CHIPS = [100, 200, 500, 1000, 2000, 3000, 5000];

const NETWORK_PROVIDERS = [
  'MTN',
  'Airtel',
  'Glo',
  '9mobile',
];

export default function AirtimePage() {
  const [provider, setProvider] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isValid = provider && phoneNumber.trim() && amount && parseFloat(amount) > 0;

  const handleAmountChipClick = (chipAmount: number) => {
    setAmount(chipAmount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    addLocalTransaction({
      type: 'airtime',
      amount: parseFloat(amount),
      currency: 'NGN',
      description: `${provider} airtime for +234${phoneNumber}`,
      status: 'pending',
    });

    toast.success('Airtime purchase logged successfully');
    setProvider('');
    setPhoneNumber('');
    setAmount('');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold absolute left-1/2 -translate-x-1/2">
            Purchase Airtime
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Network Provider Selector */}
        <div className="space-y-2">
          <Select value={provider} onValueChange={setProvider} disabled={isProcessing}>
            <SelectTrigger className="w-full h-14 bg-muted/50 border-0 text-base">
              <SelectValue placeholder="Select network provider" />
            </SelectTrigger>
            <SelectContent>
              {NETWORK_PROVIDERS.map((net) => (
                <SelectItem key={net} value={net}>
                  {net}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone Number Input with +234 prefix */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-14 px-4 bg-muted/50 rounded-lg">
            <span className="text-base font-medium text-muted-foreground">+234</span>
          </div>
          <div className="relative flex-1">
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Phone number"
              disabled={isProcessing}
              className="h-14 bg-muted/50 border-0 text-base pr-12"
            />
            <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="text-sm text-muted-foreground">
          Wallet Bal: <span className="text-primary">₦0.00</span>
        </div>

        {/* Amount Input with NGN currency */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={isProcessing}
              className="h-14 bg-muted/50 border-0 text-base"
            />
          </div>
          <div className="flex items-center justify-center h-14 px-4 bg-muted/50 rounded-lg">
            <span className="text-base font-medium text-muted-foreground">NGN</span>
          </div>
        </div>

        {/* Amount Quick-Pick Chips */}
        <div className="flex flex-wrap gap-2">
          {AMOUNT_CHIPS.map((chipAmount) => (
            <button
              key={chipAmount}
              type="button"
              onClick={() => handleAmountChipClick(chipAmount)}
              disabled={isProcessing}
              className="px-4 py-2.5 bg-muted/50 hover:bg-muted rounded-full text-sm font-medium transition-colors disabled:opacity-50"
            >
              ₦{chipAmount.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="pt-8">
          <Button
            type="submit"
            disabled={!isValid || isProcessing}
            className="w-full h-14 text-base rounded-full bg-primary/20 hover:bg-primary/30 text-primary disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
