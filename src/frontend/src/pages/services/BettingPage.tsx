import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, Loader2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../state/localTransactions';
import { BETTING_PROVIDERS, AMOUNT_CHIPS } from '../../config/betting';

type Step = 'details' | 'review';

export default function BettingPage() {
  const [step, setStep] = useState<Step>('details');
  const [provider, setProvider] = useState('');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isValid = provider && accountId.trim() && amount && parseFloat(amount) > 0;

  const handleAmountChipClick = (chipAmount: number) => {
    setAmount(chipAmount.toString());
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error('Please fill in all fields');
      return;
    }

    setStep('review');
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addLocalTransaction({
      type: 'betting',
      amount: parseFloat(amount),
      currency: 'NGN',
      description: `${provider} betting top-up for ${accountId}`,
      status: 'pending',
    });

    toast.success('Betting top-up successful');
    
    // Reset form and step
    setProvider('');
    setAccountId('');
    setAmount('');
    setStep('details');
    setIsProcessing(false);
  };

  const handleBack = () => {
    if (step === 'review') {
      setStep('details');
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10"
            disabled={isProcessing}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold absolute left-1/2 -translate-x-1/2">
            {step === 'details' ? 'Betting Top-Up' : 'Review & Confirm'}
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Details Step */}
      {step === 'details' && (
        <form onSubmit={handleContinue} className="px-4 py-6 space-y-6">
          {/* Provider Selector */}
          <div className="space-y-2">
            <Label htmlFor="provider" className="text-sm font-medium">
              Betting Provider
            </Label>
            <Select value={provider} onValueChange={setProvider} disabled={isProcessing}>
              <SelectTrigger id="provider" className="w-full h-14 bg-muted/50 border-0 text-base">
                <SelectValue placeholder="Select betting provider" />
              </SelectTrigger>
              <SelectContent>
                {BETTING_PROVIDERS.map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Betting Account ID Input */}
          <div className="space-y-2">
            <Label htmlFor="accountId" className="text-sm font-medium">
              Betting Account ID
            </Label>
            <div className="relative">
              <Input
                id="accountId"
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Enter your betting account ID"
                disabled={isProcessing}
                className="h-14 bg-muted/50 border-0 text-base pr-12"
              />
              <Trophy className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="text-sm text-muted-foreground">
            Wallet Bal: <span className="text-primary">₦0.00</span>
          </div>

          {/* Amount Input with NGN currency */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="amount"
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
              Continue
            </Button>
          </div>
        </form>
      )}

      {/* Review Step */}
      {step === 'review' && (
        <div className="px-4 py-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
              <CardDescription>
                Please review your betting top-up details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">{provider}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Account ID</span>
                <span className="font-medium">{accountId}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-lg">₦{parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="w-full h-14 text-base rounded-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Top-Up'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep('details')}
              disabled={isProcessing}
              className="w-full h-14 text-base rounded-full"
            >
              Back to Edit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
