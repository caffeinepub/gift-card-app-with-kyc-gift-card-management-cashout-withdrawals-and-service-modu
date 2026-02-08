import { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useNavigate } from '@tanstack/react-router';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import DashboardShortcutTile from '../components/dashboard/DashboardShortcutTile';
import DashboardPromoCard from '../components/dashboard/DashboardPromoCard';
import { 
  CreditCard, 
  Flame,
  Bell,
  Calculator,
  Wifi,
  Grid3x3,
  Plane,
  Smartphone,
  Receipt,
  Trophy,
  Bitcoin,
  Shield,
  Users,
  MessageSquare,
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const {
    isLoading,
    totalBalance,
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  const shortcuts = [
    { 
      id: 'gift-cards', 
      label: 'Gift Cards', 
      icon: CreditCard, 
      route: '/gift-cards',
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'hottest-cards', 
      label: 'Hottest Cards', 
      icon: Flame, 
      route: '/gift-cards/hottest',
      color: 'oklch(0.65 0.2 30)'
    },
    { 
      id: 'rate-alerts', 
      label: 'Rate Alerts', 
      icon: Bell, 
      route: '/rate-alerts',
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'rates-calculator', 
      label: 'Rates Calculator', 
      icon: Calculator, 
      comingSoon: true,
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'airtime', 
      label: 'Airtime', 
      icon: Wifi, 
      route: '/services/airtime',
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'bills', 
      label: 'Bills Payment', 
      icon: Receipt, 
      route: '/services/bills',
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'esim', 
      label: 'eSIM', 
      icon: Smartphone, 
      route: '/services/esim',
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'trading-chat', 
      label: 'Trading Chat', 
      icon: MessageSquare, 
      route: '/trading-chat',
      color: 'oklch(0.65 0.18 160)',
      badge: 'New'
    },
  ];

  const secondaryShortcuts = [
    { 
      id: 'crypto', 
      label: 'Crypto', 
      icon: Bitcoin, 
      route: '/services/crypto',
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'kyc', 
      label: 'KYC', 
      icon: Shield, 
      route: '/kyc',
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'referrals', 
      label: 'Referrals', 
      icon: Users, 
      comingSoon: true,
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'leaderboard', 
      label: 'Leaderboard', 
      icon: Trophy, 
      comingSoon: true,
      color: 'oklch(0.7 0.15 220)'
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Balance Header */}
      <div 
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, oklch(0.45 0.15 280) 0%, oklch(0.35 0.12 280) 100%)',
        }}
      >
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(/assets/generated/dashboard-header-bg.dim_1200x600.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative p-8 lg:p-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[oklch(0.85_0.05_280)] text-sm font-medium mb-2">
                Total Balance
              </p>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl lg:text-5xl font-bold text-white">
                  {balanceVisible ? formatCurrency(totalBalance, 'usd') : '••••••'}
                </h1>
                <button
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
                >
                  {balanceVisible ? (
                    <EyeOff className="h-5 w-5 text-[oklch(0.85_0.05_280)]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[oklch(0.85_0.05_280)]" />
                  )}
                </button>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white border-0 backdrop-blur-sm"
            >
              Premium
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Shortcuts Grid */}
      <Card className="rounded-3xl bg-white dark:bg-card border-0 shadow-sm p-6 lg:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {shortcuts.map((shortcut) => (
            <DashboardShortcutTile
              key={shortcut.id}
              label={shortcut.label}
              icon={shortcut.icon}
              onClick={() => shortcut.route && navigate({ to: shortcut.route })}
              comingSoon={shortcut.comingSoon}
              color={shortcut.color}
              badge={shortcut.badge}
            />
          ))}
        </div>
      </Card>

      {/* Secondary Shortcuts Row */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {secondaryShortcuts.map((shortcut) => (
          <DashboardShortcutTile
            key={shortcut.id}
            label={shortcut.label}
            icon={shortcut.icon}
            onClick={() => shortcut.route && navigate({ to: shortcut.route })}
            comingSoon={shortcut.comingSoon}
            size="large"
            color={shortcut.color}
          />
        ))}
      </div>

      {/* Promo Card */}
      <DashboardPromoCard />
    </div>
  );
}
