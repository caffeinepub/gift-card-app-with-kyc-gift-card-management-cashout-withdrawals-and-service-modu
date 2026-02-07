import { ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import MobileBottomNavDock from './MobileBottomNavDock';
import { 
  LayoutDashboard, 
  CreditCard, 
  FileCheck, 
  Wallet, 
  Menu,
  LogOut,
  Phone,
  FileText,
  Wifi,
  Trophy,
  Bitcoin,
  Shield,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { clear, identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();

  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/gift-cards', label: 'Gift Cards', icon: CreditCard },
    { path: '/kyc', label: 'KYC Verification', icon: FileCheck },
    { path: '/withdrawals', label: 'Withdrawals', icon: Wallet },
  ];

  const serviceItems = [
    { path: '/services/airtime', label: 'Airtime', icon: Phone },
    { path: '/services/bills', label: 'Bills', icon: FileText },
    { path: '/services/data', label: 'Data', icon: Wifi },
    { path: '/services/betting', label: 'Betting', icon: Trophy },
    { path: '/services/crypto', label: 'Crypto Wallet', icon: Bitcoin },
  ];

  const adminItems = isAdmin ? [
    { path: '/admin/kyc', label: 'KYC Review', icon: Shield },
    { path: '/admin/withdrawals', label: 'Withdrawals', icon: Wallet },
  ] : [];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/app-logo.dim_512x512.png" 
            alt="GiftVault" 
            className="h-10 w-10"
          />
          <div>
            <h2 className="font-bold text-lg">GiftVault</h2>
            <p className="text-xs text-muted-foreground">Gift Card Manager</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main
            </h3>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate({ to: item.path })}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Services
            </h3>
            <nav className="space-y-1">
              {serviceItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate({ to: item.path })}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {adminItems.length > 0 && (
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </h3>
              <nav className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate({ to: item.path })}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium truncate">{profile?.name || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">
            {identity?.getPrincipal().toString().slice(0, 12)}...
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/generated/app-logo.dim_512x512.png" 
              alt="GiftVault" 
              className="h-8 w-8"
            />
            <span className="font-bold text-lg">GiftVault</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border bg-card fixed inset-y-0 z-30">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="container max-w-7xl mx-auto p-4 lg:p-8 pb-28 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock */}
      <MobileBottomNavDock />
    </div>
  );
}
