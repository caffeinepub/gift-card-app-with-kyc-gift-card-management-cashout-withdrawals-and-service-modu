import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../ui/sheet';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../../state/localTransactions';

interface SendCryptoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Array<{ symbol: string; name: string; balance: string }>;
}

export default function SendCryptoSheet({ open, onOpenChange, assets }: SendCryptoSheetProps) {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset || !address || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const transaction = {
      id: `send-${Date.now()}`,
      type: 'crypto' as const,
      description: `Send ${selectedAsset}`,
      amount: parseFloat(amount),
      currency: 'usd' as const,
      status: 'pending' as const,
      timestamp: BigInt(Date.now() * 1000000),
      metadata: {
        asset: selectedAsset,
        direction: 'send' as const,
      },
    };

    addLocalTransaction(transaction);
    toast.success('Transaction submitted');
    
    setSelectedAsset('');
    setAddress('');
    setAmount('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>Send Crypto</SheetTitle>
          <SheetDescription>Send cryptocurrency to another wallet</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="asset">Select Asset</Label>
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger id="asset">
                <SelectValue placeholder="Choose asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                    {asset.name} ({asset.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Recipient Address</Label>
            <Input
              id="address"
              placeholder="Enter wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Send
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
