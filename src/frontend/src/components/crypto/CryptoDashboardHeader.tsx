import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Card } from '../ui/card';

interface CryptoDashboardHeaderProps {
  balance: string;
}

export default function CryptoDashboardHeader({ balance }: CryptoDashboardHeaderProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);

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
