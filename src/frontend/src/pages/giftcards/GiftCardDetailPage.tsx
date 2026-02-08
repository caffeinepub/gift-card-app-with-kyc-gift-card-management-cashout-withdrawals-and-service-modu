import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetGiftCard, useUpdateGiftCardStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ArrowLeft, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import GiftCardRateTable from '../../components/giftcards/GiftCardRateTable';
import { getBrandRateTable } from '../../config/giftCardRatesNGN';

export default function GiftCardDetailPage() {
  const { id } = useParams({ from: '/gift-cards/$id' });
  const navigate = useNavigate();
  const { data: card, isLoading } = useGetGiftCard(id);
  const updateStatus = useUpdateGiftCardStatus();

  const handleStatusChange = async (newStatus: 'available' | 'archived') => {
    const statusObj = { __kind__: newStatus } as const;
    try {
      await updateStatus.mutateAsync({
        cardId: id,
        status: statusObj,
      });
      toast.success(`Card marked as ${newStatus}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update status');
    }
  };

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

  const rateTable = getBrandRateTable(card.brand);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/gift-cards' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gift Cards
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{card.brand}</CardTitle>
              <CardDescription>Gift Card Details</CardDescription>
            </div>
            <Badge
              variant={
                card.status.__kind__ === 'available'
                  ? 'default'
                  : card.status.__kind__ === 'sold'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {card.status.__kind__}
            </Badge>
          </div>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-xl font-bold">
                  {formatCurrency(Number(card.amount) / 100, card.currency)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Added</p>
                <p className="text-lg font-medium">
                  {formatDate(Number(card.createdAt) / 1_000_000)}
                </p>
              </div>
            </div>
          </div>

          {card.notes && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Notes</p>
              <p className="text-sm text-muted-foreground">{card.notes}</p>
            </div>
          )}

          {card.status.__kind__ === 'available' && (
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => navigate({ to: `/gift-cards/${id}/sell` })}
              >
                Sell This Card
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('archived')}
                disabled={updateStatus.isPending}
              >
                Archive
              </Button>
            </div>
          )}

          {card.status.__kind__ === 'archived' && (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleStatusChange('available')}
              disabled={updateStatus.isPending}
            >
              Mark as Available
            </Button>
          )}

          {card.status.__kind__ === 'sold' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This card has been sold and cannot be modified.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <GiftCardRateTable brandName={card.brand} rateTable={rateTable} />
    </div>
  );
}
