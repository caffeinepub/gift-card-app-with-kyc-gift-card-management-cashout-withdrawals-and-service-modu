import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetGiftCards, useGetUserTags } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Plus, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import GiftCardLabelsChips from '../../components/giftcards/GiftCardLabelsChips';
import GiftCardLabelsFilterBar from '../../components/giftcards/GiftCardLabelsFilterBar';
import { getBrandRateTable } from '../../config/giftCardRatesNGN';

export default function GiftCardsListPage() {
  const navigate = useNavigate();
  const { data: cards = [], isLoading } = useGetGiftCards();
  const { data: userTagsData = [] } = useGetUserTags();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Create a map of giftCardId -> tags[]
  const tagsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    userTagsData.forEach(([giftCardId, tags]) => {
      map.set(giftCardId, tags);
    });
    return map;
  }, [userTagsData]);

  // Extract all unique tags from user tags data
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    userTagsData.forEach(([_, tags]) => {
      tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [userTagsData]);

  // Filter cards by selected tags
  const filteredCards = useMemo(() => {
    if (selectedTags.length === 0) {
      return cards;
    }
    return cards.filter(card => {
      const cardTags = tagsMap.get(card.id) || [];
      return cardTags.some(tag => selectedTags.includes(tag));
    });
  }, [cards, selectedTags, tagsMap]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gift Cards</h1>
          <p className="text-muted-foreground mt-1">
            Manage your gift card inventory
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/gift-cards/add' })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Gift Card
        </Button>
      </div>

      <GiftCardLabelsFilterBar
        availableTags={availableTags}
        selectedTags={selectedTags}
        onSelectedTagsChange={setSelectedTags}
      />

      {filteredCards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {selectedTags.length > 0 ? 'No matching gift cards' : 'No gift cards yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              {selectedTags.length > 0 
                ? 'Try adjusting your label filters'
                : 'Add your first gift card to get started'
              }
            </p>
            {selectedTags.length === 0 && (
              <Button onClick={() => navigate({ to: '/gift-cards/add' })}>
                <Plus className="mr-2 h-4 w-4" />
                Add Gift Card
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => {
            // Safely check if rates are available (guaranteed non-empty by getBrandRateTable)
            const rateTable = getBrandRateTable(card.brand);
            const hasRates = rateTable.tiers.length > 0;
            
            // Get tags for this card from the map
            const cardTags = tagsMap.get(card.id) || [];

            return (
              <Card 
                key={card.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate({ to: `/gift-cards/${card.id}` })}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{card.brand}</CardTitle>
                    <Badge variant={
                      card.status.__kind__ === 'available' ? 'default' :
                      card.status.__kind__ === 'pending' ? 'secondary' :
                      'outline'
                    }>
                      {card.status.__kind__}
                    </Badge>
                  </div>
                  <CardDescription>
                    {formatCurrency(Number(card.amount) / 100, card.currency)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {card.image && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={(card.image as any).getDirectURL()} 
                        alt={card.brand}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between gap-2">
                    <GiftCardLabelsChips tags={cardTags} maxDisplay={2} />
                    {hasRates && (
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        Rates available
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
