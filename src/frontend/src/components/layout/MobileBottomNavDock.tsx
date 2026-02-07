import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, Wallet, Clock, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MobileBottomNavDock() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      route: '/',
    },
    { 
      id: 'wallet', 
      label: 'Wallet', 
      icon: Wallet, 
      route: '/services/crypto',
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: Clock, 
      route: '/history',
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      route: '/settings',
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <nav 
        className="rounded-full shadow-2xl border border-border/50 backdrop-blur-xl overflow-hidden"
        style={{
          background: 'oklch(0.25 0.08 270 / 0.95)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.route;

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate({ to: item.route });
                }}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
                  isActive && 'bg-white/10',
                  'hover:bg-white/5 active:scale-95'
                )}
              >
                <Icon 
                  className={cn(
                    'h-5 w-5',
                    isActive ? 'text-white' : 'text-white/70'
                  )} 
                />
                <span 
                  className={cn(
                    'text-[10px] font-medium',
                    isActive ? 'text-white' : 'text-white/70'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
