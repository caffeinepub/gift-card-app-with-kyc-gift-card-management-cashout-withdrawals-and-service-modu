import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../ui/sheet';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../../state/localTransactions';

interface ReceiveCryptoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Array<{ symbol: string; name: string; balance: string }>;
}

export default function ReceiveCryptoSheet({ open, onOpenChange, assets }: ReceiveCryptoSheetProps) {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [copied, setCopied] = useState(false);

  const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  useEffect(() => {
    if (!open) {
      setSelectedAsset('');
      setCopied(false);
    }
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mockAddress);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy address');
    }
  };

  const handleReceive = () => {
    if (!selectedAsset) {
      toast.error('Please select an asset');
      return;
    }

    const transaction = {
      id: `receive-${Date.now()}`,
      type: 'crypto' as const,
      description: `Receive ${selectedAsset}`,
      amount: 0,
      currency: 'usd' as const,
      status: 'pending' as const,
      timestamp: BigInt(Date.now() * 1000000),
      metadata: {
        asset: selectedAsset,
        direction: 'receive' as const,
      },
    };

    addLocalTransaction(transaction);
    toast.success('Receive request created');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>Receive Crypto</SheetTitle>
          <SheetDescription>Share your wallet address to receive cryptocurrency</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
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

          {selectedAsset && (
            <>
              <div className="space-y-2">
                <Label>Your {selectedAsset} Address</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                    {mockAddress}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">QR Code</p>
                </div>
              </div>

              <Button onClick={handleReceive} className="w-full">
                Done
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
