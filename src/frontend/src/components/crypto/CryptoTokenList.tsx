import { Card } from '../ui/card';

interface CryptoToken {
  id: string;
  name: string;
  ticker: string;
  icon: string;
  balance: string;
  usdValue: string;
}

interface CryptoTokenListProps {
  tokens: CryptoToken[];
  onTokenClick?: (token: CryptoToken) => void;
}

export default function CryptoTokenList({ tokens, onTokenClick }: CryptoTokenListProps) {
  return (
    <Card className="rounded-3xl border-0 shadow-sm mb-6 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Assets</h3>
        <div className="space-y-1">
          {tokens.map((token) => (
            <button
              key={token.id}
              onClick={() => onTokenClick?.(token)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                <img
                  src={token.icon}
                  alt={token.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/generated/coin-generic.dim_128x128.png';
                  }}
                />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-sm leading-tight">{token.name}</p>
                <p className="text-xs text-muted-foreground">{token.ticker}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">{token.balance}</p>
                <p className="text-xs text-muted-foreground">{token.usdValue}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
