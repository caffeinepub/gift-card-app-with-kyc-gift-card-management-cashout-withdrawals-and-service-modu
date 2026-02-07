import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../ui/sheet';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Loader2, ArrowDownUp } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../../state/localTransactions';

interface CryptoAsset {
  id: string;
  name: string;
  ticker: string;
  icon: string;
}

interface SwapCryptoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: CryptoAsset[];
}

export default function SwapCryptoSheet({ 
  open, 
  onOpenChange, 
  assets 
}: SwapCryptoSheetProps) {
  const [fromAssetId, setFromAssetId] = useState('');
  const [toAssetId, setToAssetId] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fromAsset = assets.find(a => a.id === fromAssetId);
  const toAsset = assets.find(a => a.id === toAssetId);

  // Mock exchange rate
  const mockRate = 1.05;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * mockRate).toFixed(8) : '0.00';

  const handleSwap = () => {
    const tempFrom = fromAssetId;
    const tempFromAmount = fromAmount;
    setFromAssetId(toAssetId);
    setToAssetId(tempFrom);
    setFromAmount(toAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromAmount || !fromAsset || !toAsset) {
      toast.error('Please fill in all fields');
      return;
    }

    if (fromAssetId === toAssetId) {
      toast.error('Cannot swap the same asset');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addLocalTransaction({
      type: 'crypto',
      amount: parseFloat(fromAmount),
      currency: 'USD',
      description: `Swap ${fromAsset.ticker} to ${toAsset.ticker}`,
      status: 'pending',
      direction: 'swap',
      fromAsset: fromAsset.ticker,
      toAsset: toAsset.ticker,
    });

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('localTransactionAdded'));

    toast.success(`Swapped ${fromAsset.ticker} to ${toAsset.ticker}`);
    setFromAmount('');
    setFromAssetId('');
    setToAssetId('');
    setIsProcessing(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Swap Crypto</SheetTitle>
          <SheetDescription>
            Exchange one cryptocurrency for another
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="from-asset">From</Label>
            <Select value={fromAssetId} onValueChange={setFromAssetId}>
              <SelectTrigger id="from-asset">
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
            <Input
              type="number"
              step="0.00000001"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              disabled={isProcessing}
            />
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleSwap}
              disabled={!fromAssetId || !toAssetId}
              className="rounded-full"
            >
              <ArrowDownUp className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-asset">To</Label>
            <Select value={toAssetId} onValueChange={setToAssetId}>
              <SelectTrigger id="to-asset">
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
            <Input
              type="text"
              value={toAmount}
              readOnly
              placeholder="0.00"
              className="bg-muted"
            />
          </div>

          {fromAsset && toAsset && fromAmount && (
            <div className="p-3 bg-muted rounded-xl text-sm">
              <p className="text-muted-foreground">Exchange Rate</p>
              <p className="font-medium">
                1 {fromAsset.ticker} ≈ {mockRate} {toAsset.ticker}
              </p>
            </div>
          )}

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
              'Swap'
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
