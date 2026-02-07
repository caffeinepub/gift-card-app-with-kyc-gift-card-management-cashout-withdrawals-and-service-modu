import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetGiftCard, useUpdateGiftCardStatus, useGetGiftCardTags, useSetGiftCardTags } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, DollarSign, Calendar, User } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import { GiftCardStatus } from '../../types/app-types';
import { useState } from 'react';
import GiftCardLabelsEditor from '../../components/giftcards/GiftCardLabelsEditor';
import { getBrandRateTable } from '../../config/giftCardRatesNGN';
import GiftCardRateTable from '../../components/giftcards/GiftCardRateTable';

export default function GiftCardDetailPage() {
  const { id } = useParams({ from: '/gift-cards/$id' });
  const navigate = useNavigate();
  const { data: card, isLoading } = useGetGiftCard(id);
  const { data: currentTags = [], isLoading: tagsLoading } = useGetGiftCardTags(id);
  const updateStatus = useUpdateGiftCardStatus();
  const setTags = useSetGiftCardTags();
  const [newStatus, setNewStatus] = useState<string>('');

  const handleStatusUpdate = async () => {
    if (!newStatus || !card) return;

    try {
      const statusObj: GiftCardStatus = 
        newStatus === 'available' ? { __kind__: 'available' } :
        newStatus === 'pending' ? { __kind__: 'pending' } :
        newStatus === 'sold' ? { __kind__: 'sold' } :
        { __kind__: 'archived' };

      await updateStatus.mutateAsync({
        cardId: card.id,
        newStatus: statusObj,
      });
      toast.success('Status updated successfully');
      setNewStatus('');
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const handleSaveTags = async (tags: string[]) => {
    try {
      await setTags.mutateAsync({
        giftCardId: id,
        tags,
      });
      toast.success('Labels saved successfully');
    } catch (error) {
      toast.error('Failed to save labels');
      console.error(error);
    }
  };

  if (isLoading || tagsLoading) {
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

  // Get rate table for this brand (guaranteed non-empty by getBrandRateTable)
  const rateTable = getBrandRateTable(card.brand);
  const hasRates = rateTable.tiers.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/gift-cards' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gift Cards
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{card.brand}</CardTitle>
                <CardDescription className="mt-2">
                  Gift Card Details
                </CardDescription>
              </div>
              <Badge variant={
                card.status.__kind__ === 'available' ? 'default' :
                card.status.__kind__ === 'pending' ? 'secondary' :
                'outline'
              }>
                {card.status.__kind__}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {card.image && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img 
                  src={(card.image as any).getDirectURL()} 
                  alt={card.brand}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(Number(card.amount) / 100, card.currency)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Added</p>
                  <p className="text-sm font-medium">
                    {formatDate(Number(card.createdAt))}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded By</p>
                  <p className="text-sm font-medium font-mono">
                    {card.uploadedBy.toString().slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>

            {card.status.__kind__ === 'available' && (
              <Button 
                className="w-full"
                onClick={() => navigate({ to: `/gift-cards/${card.id}/sell` })}
              >
                Sell This Card
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Status</CardTitle>
              <CardDescription>
                Update the status of this gift card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleStatusUpdate}
                disabled={!newStatus || updateStatus.isPending}
                className="w-full"
              >
                {updateStatus.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </CardContent>
          </Card>

          <GiftCardLabelsEditor
            currentTags={currentTags}
            onSave={handleSaveTags}
            isSaving={setTags.isPending}
          />
        </div>
      </div>

      {/* Rate Table Section */}
      {hasRates ? (
        <GiftCardRateTable brandName={card.brand} rateTable={rateTable} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Rate Table</CardTitle>
            <CardDescription>
              Nigeria (NGN) rates for {card.brand}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Rate information is currently unavailable for this gift card brand.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
