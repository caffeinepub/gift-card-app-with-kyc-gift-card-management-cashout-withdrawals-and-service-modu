import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useGetCoinPriceIndex, useSetCoinPriceIndex } from '../../hooks/useQueries';
import { toast } from 'sonner';

export default function CoinPriceIndexCard() {
  const { data: currentIndex, isLoading } = useGetCoinPriceIndex();
  const setCoinIndex = useSetCoinPriceIndex();

  const [inputValue, setInputValue] = useState('');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | 'same' | null>(null);

  useEffect(() => {
    if (currentIndex !== undefined) {
      setInputValue(currentIndex.toString());
    }
  }, [currentIndex]);

  const handleSave = async () => {
    const newValue = parseInt(inputValue);
    
    if (isNaN(newValue) || newValue < 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    try {
      // Store current value as previous before updating
      if (currentIndex !== undefined) {
        setPreviousValue(currentIndex);
        
        // Determine direction
        if (newValue > currentIndex) {
          setDirection('up');
        } else if (newValue < currentIndex) {
          setDirection('down');
        } else {
          setDirection('same');
        }
      }

      await setCoinIndex.mutateAsync(newValue);
      toast.success('Coin price index updated successfully');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update coin price index';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const renderDirectionIndicator = () => {
    if (!direction || previousValue === null) return null;

    if (direction === 'up') {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">Up from {previousValue.toString()}</span>
        </div>
      );
    }

    if (direction === 'down') {
      return (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <TrendingDown className="h-4 w-4" />
          <span className="text-sm font-medium">Down from {previousValue.toString()}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span className="text-sm font-medium">No change</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coin Price Index</CardTitle>
        <CardDescription>
          Adjust the global coin price index to dynamically update all gift card rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-10 w-full bg-muted animate-pulse rounded" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="coinPriceIndex">Current Index Value</Label>
              <div className="flex gap-2">
                <Input
                  id="coinPriceIndex"
                  type="number"
                  min="0"
                  placeholder="100"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSave} 
                  disabled={setCoinIndex.isPending}
                >
                  {setCoinIndex.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Base value is 100. Values above 100 increase rates, below 100 decrease rates.
              </p>
            </div>

            {renderDirectionIndicator()}

            {currentIndex !== undefined && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Index:</span>
                  <Badge variant="outline" className="font-mono">
                    {currentIndex.toString()}
                  </Badge>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
