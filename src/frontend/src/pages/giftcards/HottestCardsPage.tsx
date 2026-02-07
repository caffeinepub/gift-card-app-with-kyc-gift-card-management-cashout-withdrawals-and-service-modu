import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetGiftCards } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Flame, Plus, CreditCard, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { rankGiftCardsByRate } from './hottestCardsRanking';

export default function HottestCardsPage() {
  const navigate = useNavigate();
  const { data: cards = [], isLoading } = useGetGiftCards();

  // Rank cards by best available rate
  const rankedCards = useMemo(() => {
    return rankGiftCardsByRate(cards);
  }, [cards]);

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
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold">Hottest Cards</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Gift cards ranked by best Nigeria (NGN) rates
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/gift-cards/add' })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Gift Card
        </Button>
      </div>

      {rankedCards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No gift cards yet
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Add your first gift card to see it ranked here
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate({ to: '/gift-cards/add' })}>
                <Plus className="mr-2 h-4 w-4" />
                Add Gift Card
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/gift-cards' })}>
                View All Cards
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rankedCards.map((rankedCard, index) => {
            const { card, bestRate, rateLabel } = rankedCard;
            
            return (
              <Card 
                key={card.id}
                className="cursor-pointer hover:shadow-lg transition-shadow relative"
                onClick={() => navigate({ to: `/gift-cards/${card.id}` })}
              >
                {/* Rank badge for top 3 */}
                {index < 3 && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge 
                      variant="default"
                      className={
                        index === 0 
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950'
                          : index === 1
                          ? 'bg-gray-400 hover:bg-gray-500 text-gray-950'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg pr-12">{card.brand}</CardTitle>
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
                        src={card.image.getDirectURL()}
                        alt={`${card.brand} gift card`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Rate display */}
                  <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                    bestRate !== null 
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted border-border'
                  }`}>
                    <TrendingUp className={`h-4 w-4 flex-shrink-0 ${
                      bestRate !== null ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        bestRate !== null ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {rateLabel}
                      </div>
                      {bestRate !== null && (
                        <div className="text-xs text-muted-foreground">
                          Best available tier
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground py-8 mt-8">
        <p>© 2026. Built with ❤️ using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">caffeine.ai</a></p>
      </footer>
    </div>
  );
}
