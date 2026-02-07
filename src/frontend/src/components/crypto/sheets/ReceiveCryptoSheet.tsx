import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../ui/sheet';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../../state/localTransactions';

interface CryptoAsset {
  id: string;
  name: string;
  ticker: string;
  icon: string;
}

interface ReceiveCryptoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: CryptoAsset[];
}

export default function ReceiveCryptoSheet({ 
  open, 
  onOpenChange, 
  assets 
}: ReceiveCryptoSheetProps) {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [copied, setCopied] = useState(false);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setSelectedAssetId('');
      setCopied(false);
    }
  }, [open]);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  
  // Mock address for demonstration
  const mockAddress = selectedAsset 
    ? `${selectedAsset.ticker.toLowerCase()}1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`
    : '';

  const handleCopy = async () => {
    if (!mockAddress) {
      toast.error('Please select an asset first');
      return;
    }

    // Check if clipboard API is available
    if (!navigator.clipboard) {
      toast.error('Clipboard not available');
      return;
    }

    try {
      await navigator.clipboard.writeText(mockAddress);
      setCopied(true);
      toast.success('Address copied to clipboard');
      
      // Log a placeholder received transaction
      if (selectedAsset) {
        addLocalTransaction({
          type: 'crypto',
          amount: 0,
          currency: 'USD',
          description: `Receive ${selectedAsset.name} - Address copied`,
          status: 'pending',
          asset: selectedAsset.ticker,
          direction: 'received',
        });
        
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new Event('localTransactionAdded'));
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy address');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Receive Crypto</SheetTitle>
          <SheetDescription>
            Select an asset to get your receiving address
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="receive-asset">Asset</Label>
            <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
              <SelectTrigger id="receive-asset">
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

          {selectedAsset && (
            <>
              <div className="space-y-2">
                <Label>Your {selectedAsset.name} Address</Label>
                <div className="p-4 bg-muted rounded-xl break-all text-sm font-mono">
                  {mockAddress}
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center px-2">
                    QR Code<br/>Placeholder
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCopy}
                className="w-full"
                variant={copied ? 'secondary' : 'default'}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
