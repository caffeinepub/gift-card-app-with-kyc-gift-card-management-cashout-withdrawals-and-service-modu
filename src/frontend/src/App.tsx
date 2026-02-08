import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import { useProfileSetupSuppression } from './hooks/useProfileSetupSuppression';
import { useEnsureUserRegistered } from './hooks/useEnsureUserRegistered';
import LoginCard from './components/auth/LoginCard';
import AuthInitializingScreen from './components/auth/AuthInitializingScreen';
import AppShell from './components/layout/AppShell';
import ProfileSetupModal from './components/profile/ProfileSetupModal';
import DashboardPage from './pages/DashboardPage';
import KycPage from './pages/KycPage';
import GiftCardsListPage from './pages/giftcards/GiftCardsListPage';
import GiftCardDetailPage from './pages/giftcards/GiftCardDetailPage';
import AddGiftCardPage from './pages/giftcards/AddGiftCardPage';
import SellGiftCardPage from './pages/giftcards/SellGiftCardPage';
import HottestCardsPage from './pages/giftcards/HottestCardsPage';
import WithdrawalsPage from './pages/withdrawals/WithdrawalsPage';
import AdminKycReviewPage from './pages/admin/AdminKycReviewPage';
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage';
import AdminGiftCardRatesPage from './pages/admin/AdminGiftCardRatesPage';
import AirtimePage from './pages/services/AirtimePage';
import BillsPage from './pages/services/BillsPage';
import DataPage from './pages/services/DataPage';
import BettingPage from './pages/services/BettingPage';
import CryptoWalletPage from './pages/services/CryptoWalletPage';
import ElectricityPage from './pages/services/ElectricityPage';
import WifiInternetPage from './pages/services/WifiInternetPage';
import CableTvBillsPage from './pages/services/CableTvBillsPage';
import EsimPage from './pages/services/EsimPage';
import RateAlertsPage from './pages/RateAlertsPage';
import RateCalendarPage from './pages/RateCalendarPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from './components/ui/button';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';

function Layout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { 
    isRegistering, 
    isRegistered, 
    registrationError, 
    retryRegistration 
  } = useEnsureUserRegistered();
  
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const principalString = identity?.getPrincipal().toString() || null;
  
  const { isSuppressed, suppress } = useProfileSetupSuppression(principalString);

  // Show initializing screen while Internet Identity is loading
  if (isInitializing) {
    return <AuthInitializingScreen />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginCard />;
  }

  // Show registration loading state
  if (isRegistering) {
    return (
      <div className="min-h-screen bg-[oklch(0.35_0.08_280)] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <Loader2 className="h-12 w-12 animate-spin text-[oklch(0.75_0.12_220)] mx-auto" />
          <p className="text-lg text-[oklch(0.85_0.05_280)] font-medium">
            Setting up your account...
          </p>
          <p className="text-sm text-[oklch(0.75_0.05_280)]">
            Please wait while we register your account with the backend.
          </p>
        </div>
      </div>
    );
  }

  // Show registration error with retry only if registration truly failed
  // and the user is not yet registered
  if (registrationError && !isRegistered) {
    const errorMessage = registrationError instanceof Error 
      ? registrationError.message 
      : 'Unknown error occurred during registration';

    return (
      <div className="min-h-screen bg-[oklch(0.35_0.08_280)] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive" className="bg-background">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Registration Failed</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>
                We couldn't complete your account registration. This is required to access the application.
              </p>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {errorMessage}
              </p>
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => retryRegistration()}
            className="w-full h-12 rounded-full text-base font-medium bg-[oklch(0.75_0.12_220)] hover:bg-[oklch(0.70_0.12_220)] text-[oklch(0.40_0.08_280)]"
          >
            Retry Registration
          </Button>
        </div>
      </div>
    );
  }
  
  // Show profile setup modal only if:
  // 1. User is authenticated and registered
  // 2. Profile query has completed
  // 3. No profile exists (userProfile === null)
  // 4. User hasn't dismissed it for this principal
  const showProfileSetup = 
    isAuthenticated && 
    isRegistered &&
    !profileLoading && 
    isFetched && 
    userProfile === null && 
    !isSuppressed;

  const handleProfileSetupClose = (open: boolean) => {
    if (!open) {
      suppress();
    }
  };

  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <ProfileSetupModal 
        open={showProfileSetup} 
        onOpenChange={handleProfileSetupClose}
      />
    </>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const kycRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kyc',
  component: KycPage,
});

const giftCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gift-cards',
  component: GiftCardsListPage,
});

const addGiftCardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gift-cards/add',
  component: AddGiftCardPage,
});

const hottestCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gift-cards/hottest',
  component: HottestCardsPage,
});

const giftCardDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gift-cards/$id',
  component: GiftCardDetailPage,
});

const sellGiftCardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gift-cards/$id/sell',
  component: SellGiftCardPage,
});

const withdrawalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/withdrawals',
  component: WithdrawalsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
});

const rateAlertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rate-alerts',
  component: RateAlertsPage,
});

const rateCalendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rate-calendar',
  component: RateCalendarPage,
});

const adminKycRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/kyc',
  component: AdminKycReviewPage,
});

const adminWithdrawalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/withdrawals',
  component: AdminWithdrawalsPage,
});

const adminGiftCardRatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/gift-card-rates',
  component: AdminGiftCardRatesPage,
});

const airtimeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/airtime',
  component: AirtimePage,
});

const billsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/bills',
  component: BillsPage,
});

const dataRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/data',
  component: DataPage,
});

const bettingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/betting',
  component: BettingPage,
});

const cryptoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/crypto',
  component: CryptoWalletPage,
});

const electricityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/electricity',
  component: ElectricityPage,
});

const wifiInternetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/wifi-internet',
  component: WifiInternetPage,
});

const cableTvBillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/cable-tv-bills',
  component: CableTvBillsPage,
});

const esimRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/esim',
  component: EsimPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  kycRoute,
  giftCardsRoute,
  addGiftCardRoute,
  hottestCardsRoute,
  giftCardDetailRoute,
  sellGiftCardRoute,
  withdrawalsRoute,
  settingsRoute,
  historyRoute,
  rateAlertsRoute,
  rateCalendarRoute,
  adminKycRoute,
  adminWithdrawalsRoute,
  adminGiftCardRatesRoute,
  airtimeRoute,
  billsRoute,
  dataRoute,
  bettingRoute,
  cryptoRoute,
  electricityRoute,
  wifiInternetRoute,
  cableTvBillsRoute,
  esimRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
