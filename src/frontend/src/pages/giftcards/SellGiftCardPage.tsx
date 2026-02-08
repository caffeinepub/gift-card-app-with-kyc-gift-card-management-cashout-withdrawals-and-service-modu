import { useParams, useNavigate } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { useGetGiftCard } from '../../hooks/useQueries';
import { useSellGiftCardQuote, useCalculatePayout } from '../../hooks/useSellGiftCardQuote';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, AlertCircle, DollarSign, Lock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { getBrandRateTable } from '../../config/giftCardRatesNGN';
import GiftCardRateTable from '../../components/giftcards/GiftCardRateTable';
import NGNRateInlineSummary from '../../components/giftcards/NGNRateInlineSummary';
import { toast } from 'sonner';

export default function SellGiftCardPage() {
  const { id } = useParams({ from: '/gift-cards/$id/sell' });
  const navigate = useNavigate();
  const { data: card, isLoading } = useGetGiftCard(id);

  const faceValue = card ? Number(card.amount) / 100 : 0;
  
  const [amount, setAmount] = useState<string>(faceValue.toString());

  // Parse amount as number
  const parsedAmount = useMemo(() => {
    const num = parseFloat(amount);
    return isNaN(num) || num <= 0 ? 0 : num;
  }, [amount]);

  // Get rate table for this brand (for display only)
  const rateTable = useMemo(() => {
    if (!card) return null;
    return getBrandRateTable(card.brand);
  }, [card]);

  // Prepare quote params
  const quoteParams = useMemo(() => {
    if (!card || parsedAmount <= 0) return null;
    return {
      brandName: card.brand,
      amount: parsedAmount,
    };
  }, [card, parsedAmount]);

  // Fetch backend quote with rate snapshot
  const { 
    data: quote, 
    isLoading: quoteLoading, 
    error: quoteError,
    refetch: refetchQuote 
  } = useSellGiftCardQuote(quoteParams);

  // Calculate payout mutation
  const calculatePayoutMutation = useCalculatePayout();

  // Calculate payout when quote is available
  const [payout, setPayout] = useState<number | null>(null);

  useEffect(() => {
    if (quote && parsedAmount > 0) {
      calculatePayoutMutation.mutate(
        { quoteId: quote.id, amount: parsedAmount },
        {
          onSuccess: (calculatedPayout) => {
            setPayout(calculatedPayout);
          },
          onError: (error) => {
            console.error('Failed to calculate payout:', error);
            setPayout(null);
          },
        }
      );
    } else {
      setPayout(null);
    }
  }, [quote, parsedAmount]);

  const isAmountValid = parsedAmount > 0;
  const hasQuoteError = !!quoteError;

  // Show error toast when quote fails
  useEffect(() => {
    if (hasQuoteError) {
      toast.error(
        quoteError instanceof Error 
          ? quoteError.message 
          : 'Failed to fetch rate quote. Please try again.'
      );
    }
  }, [hasQuoteError, quoteError]);

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
    if (!isAmountValid || !payout) {
      toast.error('Please enter a valid amount and wait for the payout calculation');
      return;
    }
    
    toast.success(
      `Sell order confirmed! You will receive ${formatCurrency(payout, 'NGN')} for your ${formatCurrency(parsedAmount, card.currency)} ${card.brand} gift card.`
    );
    
    // Navigate back after a short delay
    setTimeout(() => {
      navigate({ to: '/gift-cards' });
    }, 2000);
  };

  const effectiveRatePerDollar = quote 
    ? Number(quote.effectiveRate) / 100 
    : null;

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

              {/* Rate Locked Indicator */}
              {isAmountValid && quote && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <Lock className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">Rate locked for this quote</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Effective rate: ₦{effectiveRatePerDollar?.toFixed(2)} per $1
                    </p>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {isAmountValid && quoteLoading && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Fetching current rate...</p>
                </div>
              )}

              {/* Error state */}
              {isAmountValid && hasQuoteError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {quoteError instanceof Error 
                      ? quoteError.message 
                      : 'Failed to fetch rate. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Payout Display */}
            {isAmountValid && quote && payout !== null ? (
              <div className="space-y-3 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Payout Calculation</h3>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Gift Card Amount</span>
                  <span className="font-medium">{formatCurrency(parsedAmount, card.currency)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Effective Rate (snapshot)</span>
                  <span className="font-medium">₦{effectiveRatePerDollar?.toFixed(2)} per $1</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Coin Price Index</span>
                  <span className="font-medium">{Number(quote.coinPriceIndex)}</span>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">You'll Receive</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(payout, 'NGN')}
                    </span>
                  </div>
                </div>
              </div>
            ) : isAmountValid && !quoteLoading && !hasQuoteError ? (
              <div className="p-4 border border-border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground text-center">
                  Calculating payout...
                </p>
              </div>
            ) : !isAmountValid ? (
              <div className="p-4 border border-border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground text-center">
                  Enter a valid amount to see payout calculation
                </p>
              </div>
            ) : null}
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
              disabled={!isAmountValid || !quote || payout === null || quoteLoading || hasQuoteError}
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
