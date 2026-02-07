import { useParams, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useGetGiftCard } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, AlertCircle, DollarSign, TrendingDown, Percent, Building2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { calculateConversion, CONVERSION_CONFIG } from '../../config/finance';
import { VENDORS, selectBestVendor } from '../../config/vendors';
import { getBrandRateTable, findMatchingTier } from '../../config/giftCardRatesNGN';
import GiftCardRateTable from '../../components/giftcards/GiftCardRateTable';
import NGNRateInlineSummary from '../../components/giftcards/NGNRateInlineSummary';
import { toast } from 'sonner';

export default function SellGiftCardPage() {
  const { id } = useParams({ from: '/gift-cards/$id/sell' });
  const navigate = useNavigate();
  const { data: card, isLoading } = useGetGiftCard(id);

  const faceValue = card ? Number(card.amount) / 100 : 0;
  
  const [amount, setAmount] = useState<string>(faceValue.toString());
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');

  // Parse amount as number
  const parsedAmount = useMemo(() => {
    const num = parseFloat(amount);
    return isNaN(num) || num <= 0 ? 0 : num;
  }, [amount]);

  // Get rate table for this brand
  const rateTable = useMemo(() => {
    if (!card) return null;
    return getBrandRateTable(card.brand);
  }, [card]);

  // Find matching tier for entered amount
  const matchedTier = useMemo(() => {
    if (!rateTable || parsedAmount <= 0) return null;
    return findMatchingTier(parsedAmount, rateTable);
  }, [parsedAmount, rateTable]);

  // Select best vendor when amount changes
  const bestVendor = useMemo(() => {
    return selectBestVendor(parsedAmount, CONVERSION_CONFIG.fee);
  }, [parsedAmount]);

  // Set default vendor on mount or when best vendor changes
  useMemo(() => {
    if (!selectedVendorId && bestVendor) {
      setSelectedVendorId(bestVendor.id);
    }
  }, [bestVendor, selectedVendorId]);

  // Get selected vendor
  const selectedVendor = useMemo(() => {
    return VENDORS.find(v => v.id === selectedVendorId) || bestVendor;
  }, [selectedVendorId, bestVendor]);

  // Calculate conversion with selected vendor
  const conversion = useMemo(() => {
    if (parsedAmount <= 0) {
      return { gross: 0, fee: 0, net: 0, rate: 0, feeRate: 0 };
    }
    return calculateConversion(parsedAmount, {
      rate: selectedVendor.rate,
      fee: selectedVendor.fee,
    });
  }, [parsedAmount, selectedVendor]);

  const isAmountValid = parsedAmount > 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Gift card not found</p>
        <Button onClick={() => navigate({ to: '/gift-cards' })} className="mt-4">
          Back to Gift Cards
        </Button>
      </div>
    );
  }

  if (card.status.__kind__ !== 'available') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/gift-cards' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gift Cards
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This gift card is not available for sale. Status: {card.status.__kind__}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSell = () => {
    if (!isAmountValid) {
      toast.error('Please enter a valid amount');
      return;
    }
    toast.info(
      `Sell order placed: ${formatCurrency(parsedAmount, card.currency)} via ${selectedVendor.name}. You'll receive ${formatCurrency(conversion.net, card.currency)}. Backend integration coming soon.`
    );
    // This will be implemented when backend supports selling
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/gift-cards' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gift Cards
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Sell Gift Card</CardTitle>
          <CardDescription>
            Convert your {card.brand} gift card to cash
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {card.image && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img 
                src={card.image.getDirectURL()} 
                alt={card.brand}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Face Value</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(faceValue, card.currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="amount">Amount to Sell</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="mt-1.5"
                />
                {!isAmountValid && amount !== '' && (
                  <p className="text-sm text-destructive mt-1.5">
                    Please enter a valid positive amount
                  </p>
                )}
              </div>

              {/* Inline Nigeria Rate Summary */}
              {isAmountValid && (
                <NGNRateInlineSummary 
                  matchedTier={matchedTier} 
                  showUnavailable={!matchedTier}
                />
              )}

              <div>
                <Label htmlFor="vendor">Select Vendor</Label>
                <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                  <SelectTrigger id="vendor" className="mt-1.5">
                    <SelectValue placeholder="Choose a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDORS.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{vendor.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(vendor.rate * 100).toFixed(0)}% rate
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isAmountValid ? (
              <div className="space-y-3 p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Conversion Breakdown</h3>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Vendor Rate ({(conversion.rate * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <span className="font-medium">{formatCurrency(conversion.gross, card.currency)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Processing Fee ({(conversion.feeRate * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(conversion.fee, card.currency)}
                  </span>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">You'll Receive</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(conversion.net, card.currency)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground text-center">
                  Enter a valid amount to see conversion breakdown
                </p>
              </div>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Once you confirm, the funds will be added to your account balance and this card will be marked as sold.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate({ to: `/gift-cards/${card.id}` })}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSell}
              disabled={!isAmountValid}
            >
              Confirm Sale
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rate Table Section */}
      {rateTable && (
        <GiftCardRateTable brandName={card.brand} rateTable={rateTable} />
      )}
    </div>
  );
}
