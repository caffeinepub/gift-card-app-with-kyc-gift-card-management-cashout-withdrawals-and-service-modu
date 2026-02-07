import { Info } from 'lucide-react';
import { MatchedTier, formatNGNRate } from '../../config/giftCardRatesNGN';

interface NGNRateInlineSummaryProps {
  matchedTier: MatchedTier | null;
  showUnavailable?: boolean;
}

export default function NGNRateInlineSummary({ matchedTier, showUnavailable }: NGNRateInlineSummaryProps) {
  if (!matchedTier && !showUnavailable) {
    return null;
  }

  if (!matchedTier && showUnavailable) {
    return (
      <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <Info className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
        <div className="text-sm text-destructive">
          Rate unavailable for this amount. Please check the rate table below for available tiers.
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
      <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-0.5">
        <div className="text-sm font-medium text-foreground">
          Nigeria Rate: <span className="font-semibold text-foreground">{formatNGNRate(matchedTier!.ratePerDollar)}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Tier: {matchedTier!.label}
        </div>
      </div>
    </div>
  );
}
