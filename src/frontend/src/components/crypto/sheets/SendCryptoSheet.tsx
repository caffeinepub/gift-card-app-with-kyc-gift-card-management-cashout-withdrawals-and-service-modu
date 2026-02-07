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

interface SendCryptoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: CryptoAsset[];
  preselectedAsset?: CryptoAsset;
}

export default function SendCryptoSheet({ 
  open, 
  onOpenChange, 
  assets,
  preselectedAsset 
}: SendCryptoSheetProps) {
  const [selectedAssetId, setSelectedAssetId] = useState(preselectedAsset?.id || '');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !amount || !selectedAsset) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addLocalTransaction({
      type: 'crypto',
      amount: parseFloat(amount),
      currency: 'USD',
      description: `Send ${selectedAsset.name} to ${address.slice(0, 8)}...`,
      status: 'pending',
      asset: selectedAsset.ticker,
      direction: 'sent',
    });

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('localTransactionAdded'));

    toast.success(`${selectedAsset.name} sent successfully`);
    setAddress('');
    setAmount('');
    setSelectedAssetId('');
    setIsProcessing(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Send Crypto</SheetTitle>
          <SheetDescription>
            Enter the destination address and amount to send
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="send-asset">Asset</Label>
            <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
              <SelectTrigger id="send-asset">
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
            <Label htmlFor="send-address">Destination Address</Label>
            <Input
              id="send-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter wallet address"
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="send-amount">Amount</Label>
            <Input
              id="send-amount"
              type="number"
              step="0.00000001"
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
              'Send'
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
