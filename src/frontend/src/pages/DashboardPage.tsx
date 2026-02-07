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
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const {
    isLoading,
    balance,
    currency,
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
      comingSoon: true,
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
      id: 'data', 
      label: 'Data', 
      icon: Grid3x3, 
      route: '/services/data',
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'betting', 
      label: 'Betting', 
      icon: Trophy, 
      route: '/services/betting',
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'bills', 
      label: 'Bills', 
      icon: Receipt, 
      route: '/services/bills',
      color: 'oklch(0.7 0.15 220)'
    },
  ];

  const secondaryShortcuts = [
    { 
      id: 'flights', 
      label: 'Flights', 
      icon: Plane, 
      comingSoon: true,
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'esim', 
      label: 'eSIM', 
      icon: Smartphone, 
      comingSoon: true,
      color: 'oklch(0.7 0.15 220)',
      badge: 'New'
    },
    { 
      id: 'crypto-wallets', 
      label: 'Crypto Wallets', 
      icon: Bitcoin, 
      route: '/services/crypto',
      color: 'oklch(0.75 0.18 60)'
    },
    { 
      id: '2fa', 
      label: '2FA', 
      icon: Shield, 
      comingSoon: true,
      color: 'oklch(0.7 0.15 220)'
    },
    { 
      id: 'referrals', 
      label: 'Referrals', 
      icon: Users, 
      comingSoon: true,
      color: 'oklch(0.65 0.15 150)'
    },
  ];

  const formattedBalance = formatCurrency(Number(balance), currency);
  const maskedBalance = '₦••••••';

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Dark Balance Header */}
      <div 
        className="relative overflow-hidden rounded-b-[2rem] lg:rounded-3xl mb-6"
        style={{
          background: 'linear-gradient(135deg, oklch(0.35 0.08 280) 0%, oklch(0.28 0.1 270) 100%)',
        }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/assets/generated/dashboard-header-bg.dim_1200x600.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative px-6 py-12 lg:py-16">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight">
              {balanceVisible ? formattedBalance : maskedBalance}
            </h1>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
            >
              {balanceVisible ? (
                <Eye className="h-6 w-6 text-white/80" />
              ) : (
                <EyeOff className="h-6 w-6 text-white/80" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="h-1 w-8 rounded-full bg-white/40" />
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <div className="h-1 w-1 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      {/* White Rounded Sheet with Shortcuts */}
      <div className="px-4 lg:px-0">
        <Card className="rounded-3xl shadow-lg border-0 bg-card overflow-hidden">
          <div className="p-6 lg:p-8">
            {/* Primary Shortcuts Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {shortcuts.map((shortcut) => (
                <DashboardShortcutTile
                  key={shortcut.id}
                  label={shortcut.label}
                  icon={shortcut.icon}
                  route={shortcut.route}
                  comingSoon={shortcut.comingSoon}
                  color={shortcut.color}
                  onClick={() => {
                    if (shortcut.route) {
                      navigate({ to: shortcut.route });
                    }
                  }}
                />
              ))}
            </div>

            {/* Secondary Shortcuts Row */}
            <div className="flex items-center justify-center gap-6 lg:gap-8 mb-8 overflow-x-auto pb-2">
              {secondaryShortcuts.map((shortcut) => (
                <DashboardShortcutTile
                  key={shortcut.id}
                  label={shortcut.label}
                  icon={shortcut.icon}
                  route={shortcut.route}
                  comingSoon={shortcut.comingSoon}
                  color={shortcut.color}
                  badge={shortcut.badge}
                  size="large"
                  onClick={() => {
                    if (shortcut.route) {
                      navigate({ to: shortcut.route });
                    }
                  }}
                />
              ))}
            </div>

            {/* Promo Card */}
            <DashboardPromoCard />
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground py-8 mt-8">
        <p>© 2026. Built with ❤️ using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">caffeine.ai</a></p>
      </footer>
    </div>
  );
}
