import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../ui/sheet';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../../state/localTransactions';

interface CryptoAsset {
  id: string;
  name: string;
  ticker: string;
  icon: string;
}

interface BuyCryptoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: CryptoAsset[];
}

export default function BuyCryptoSheet({ 
  open, 
  onOpenChange, 
  assets 
}: BuyCryptoSheetProps) {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !selectedAsset) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addLocalTransaction({
      type: 'crypto',
      amount: amountNum,
      currency: 'USD',
      description: `Buy ${selectedAsset.name}`,
      status: 'pending',
      asset: selectedAsset.ticker,
      direction: 'received',
    });

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('localTransactionAdded'));

    toast.success(`${selectedAsset.name} purchase initiated`);
    setAmount('');
    setSelectedAssetId('');
    setIsProcessing(false);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isProcessing) {
      // Reset state when closing
      setAmount('');
      setSelectedAssetId('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Buy Crypto</SheetTitle>
          <SheetDescription>
            Select an asset and enter the amount you want to buy
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="buy-asset">Asset</Label>
            <Select value={selectedAssetId} onValueChange={setSelectedAssetId} disabled={isProcessing}>
              <SelectTrigger id="buy-asset">
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name} ({asset.ticker})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buy-amount">Amount (USD)</Label>
            <Input
              id="buy-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
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
              'Confirm Purchase'
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
