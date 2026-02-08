import { useState } from 'react';
import { Eye, EyeOff, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useMarketRateIndex } from '../../hooks/useMarketRate';

interface CryptoDashboardHeaderProps {
  balance: string;
}

export default function CryptoDashboardHeader({ balance }: CryptoDashboardHeaderProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const { data: marketRate, isLoading: marketRateLoading, isError } = useMarketRateIndex();

  // Determine trend indicator (simplified - comparing to baseline of 100)
  const getTrendIcon = () => {
    if (!marketRate) return null;
    if (marketRate > 100) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (marketRate < 100) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-white/60" />;
  };

  return (
    <Card className="relative overflow-hidden rounded-3xl border-0 shadow-lg mb-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url(/assets/generated/crypto-wallet-header-bg.dim_1200x600.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, oklch(0.4 0.15 260) 0%, oklch(0.3 0.18 240) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative px-6 py-10">
        {/* Market Rate Star Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
            {marketRateLoading ? (
              <Skeleton className="h-4 w-16 bg-white/20" />
            ) : isError ? (
              <span className="text-xs text-white/70">Rate unavailable</span>
            ) : (
              <>
                <span className="text-sm font-semibold text-white">
                  {marketRate?.toFixed(2) || '—'}
                </span>
                {getTrendIcon()}
              </>
            )}
          </div>
        </div>

        {/* Balance Section */}
        <p className="text-sm text-white/70 mb-2 font-medium">Total Balance</p>
        <div className="flex items-center gap-3">
          <h2 className="text-4xl font-bold text-white tracking-tight">
            {balanceVisible ? balance : '••••••'}
          </h2>
          <button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
          >
            {balanceVisible ? (
              <Eye className="h-5 w-5 text-white/80" />
            ) : (
              <EyeOff className="h-5 w-5 text-white/80" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}
