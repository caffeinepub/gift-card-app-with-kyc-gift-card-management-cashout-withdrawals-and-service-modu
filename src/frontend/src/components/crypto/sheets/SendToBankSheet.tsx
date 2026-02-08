import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Separator } from '../../ui/separator';
import { ArrowLeft, Loader2, Building2, Plus } from 'lucide-react';
import { useGetPayoutMethods, useAddPayoutMethod, useRequestWithdrawal } from '../../../hooks/useQueries';
import { toast } from 'sonner';
import type { Currency } from '../../../types/app-types';
import NigerianBankSelect from '../../payout/NigerianBankSelect';

interface SendToBankSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'amount' | 'method' | 'add-method' | 'review';

export default function SendToBankSheet({ open, onOpenChange }: SendToBankSheetProps) {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<string>('usd');
  const [selectedMethodId, setSelectedMethodId] = useState('');

  // Add payout method form
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const { data: payoutMethods = [], isLoading: methodsLoading } = useGetPayoutMethods();
  const addPayoutMethod = useAddPayoutMethod();
  const requestWithdrawal = useRequestWithdrawal();

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setStep('amount');
      setAmount('');
      setCurrency('usd');
      setSelectedMethodId('');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
    }, 300);
  };

  const handleAmountNext = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setStep('method');
  };

  const handleMethodNext = () => {
    if (!selectedMethodId) {
      toast.error('Please select a payout method');
      return;
    }
    setStep('review');
  };

  const handleAddMethodSubmit = async () => {
    if (!bankName || !accountName || !accountNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const newMethodId = await addPayoutMethod.mutateAsync({
        bankName,
        accountName,
        accountNumber,
      });
      toast.success('Payout method added');
      setSelectedMethodId(newMethodId);
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      setStep('review');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add payout method';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleConfirm = async () => {
    try {
      await requestWithdrawal.mutateAsync({
        amount: BigInt(Math.floor(parseFloat(amount) * 100)),
        payoutMethodId: selectedMethodId,
      });

      toast.success('Withdrawal request submitted successfully');
      handleClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to submit withdrawal request';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const selectedMethod = payoutMethods.find(m => m.id === selectedMethodId);

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'usd': return '$';
      case 'ngn': return '₦';
      case 'kes': return 'KSh';
      case 'inr': return '₹';
      default: return curr.toUpperCase();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            {step !== 'amount' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (step === 'method') setStep('amount');
                  else if (step === 'add-method') setStep('method');
                  else if (step === 'review') setStep('method');
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <SheetTitle>Send to Bank</SheetTitle>
              <SheetDescription>
                {step === 'amount' && 'Enter the amount you want to withdraw'}
                {step === 'method' && 'Select or add a payout method'}
                {step === 'add-method' && 'Add a new bank account'}
                {step === 'review' && 'Review and confirm your withdrawal'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {step === 'amount' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD - US Dollar</SelectItem>
                    <SelectItem value="ngn">NGN - Nigerian Naira</SelectItem>
                    <SelectItem value="kes">KES - Kenyan Shilling</SelectItem>
                    <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAmountNext} className="w-full" size="lg">
                Continue
              </Button>
            </>
          )}

          {step === 'method' && (
            <>
              <div className="space-y-3">
                <Label>Select Payout Method</Label>
                {methodsLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading methods...
                  </div>
                ) : payoutMethods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No payout methods yet</p>
                    <p className="text-sm">Add one to continue</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {payoutMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethodId(method.id)}
                        className={`w-full text-left p-4 border rounded-lg transition-colors ${
                          selectedMethodId === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium">{method.bankName}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.accountName} • {method.accountNumber}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <Button
                variant="outline"
                onClick={() => setStep('add-method')}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Payout Method
              </Button>

              {payoutMethods.length > 0 && (
                <Button
                  onClick={handleMethodNext}
                  className="w-full"
                  size="lg"
                  disabled={!selectedMethodId}
                >
                  Continue
                </Button>
              )}
            </>
          )}

          {step === 'add-method' && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <NigerianBankSelect
                    value={bankName}
                    onValueChange={setBankName}
                    disabled={addPayoutMethod.isPending}
                    placeholder="Select your bank"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="John Doe"
                    disabled={addPayoutMethod.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    disabled={addPayoutMethod.isPending}
                  />
                </div>
              </div>

              <Button
                onClick={handleAddMethodSubmit}
                className="w-full"
                size="lg"
                disabled={addPayoutMethod.isPending}
              >
                {addPayoutMethod.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Method & Continue
              </Button>
            </>
          )}

          {step === 'review' && selectedMethod && (
            <>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-2xl font-bold">
                      {getCurrencySymbol(currency)}{parseFloat(amount).toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Currency</span>
                    <span className="font-medium">{currency.toUpperCase()}</span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Payout Method</p>
                  <p className="font-medium">{selectedMethod.bankName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMethod.accountName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMethod.accountNumber}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Your withdrawal request will be reviewed and processed within 1-3 business days.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full"
                size="lg"
                disabled={requestWithdrawal.isPending}
              >
                {requestWithdrawal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Withdrawal
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
