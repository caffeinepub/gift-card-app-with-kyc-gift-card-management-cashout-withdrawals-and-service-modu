import { useGetVerificationStatus } from '../../hooks/useTradingChat';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { ShieldCheck } from 'lucide-react';
import { Principal } from '@icp-sdk/core/principal';

interface VerifiedTraderBadgeProps {
  principal: Principal;
}

export default function VerifiedTraderBadge({ principal }: VerifiedTraderBadgeProps) {
  const { data: isVerified, isLoading } = useGetVerificationStatus(principal);

  if (isLoading) {
    return <Skeleton className="h-5 w-24" />;
  }

  if (!isVerified) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className="bg-chat-verified/10 text-chat-verified border-chat-verified/20 text-xs font-medium"
    >
      <ShieldCheck className="h-3 w-3 mr-1" />
      Verified Trader
    </Badge>
  );
}
