import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import { useProfileSetupSuppression } from './hooks/useProfileSetupSuppression';
import LoginCard from './components/auth/LoginCard';
import AppShell from './components/layout/AppShell';
import ProfileSetupModal from './components/profile/ProfileSetupModal';
import DashboardPage from './pages/DashboardPage';
import KycPage from './pages/KycPage';
import GiftCardsListPage from './pages/giftcards/GiftCardsListPage';
import GiftCardDetailPage from './pages/giftcards/GiftCardDetailPage';
import AddGiftCardPage from './pages/giftcards/AddGiftCardPage';
import SellGiftCardPage from './pages/giftcards/SellGiftCardPage';
import WithdrawalsPage from './pages/withdrawals/WithdrawalsPage';
import AdminKycReviewPage from './pages/admin/AdminKycReviewPage';
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage';
import AirtimePage from './pages/services/AirtimePage';
import BillsPage from './pages/services/BillsPage';
import DataPage from './pages/services/DataPage';
import BettingPage from './pages/services/BettingPage';
import CryptoWalletPage from './pages/services/CryptoWalletPage';
import ElectricityPage from './pages/services/ElectricityPage';
import WifiInternetPage from './pages/services/WifiInternetPage';
import CableTvBillsPage from './pages/services/CableTvBillsPage';

function Layout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const principalString = identity?.getPrincipal().toString() || null;
  
  const { isSuppressed, suppress } = useProfileSetupSuppression(principalString);
  
  // Show profile setup modal only if:
  // 1. User is authenticated
  // 2. Profile query has completed
  // 3. No profile exists (userProfile === null)
  // 4. User hasn't dismissed it for this principal
  const showProfileSetup = 
    isAuthenticated && 
    !profileLoading && 
    isFetched && 
    userProfile === null && 
    !isSuppressed;

  const handleProfileSetupClose = (open: boolean) => {
    if (!open) {
      suppress();
    }
  };

  if (!isAuthenticated) {
    return <LoginCard />;
  }

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

const routeTree = rootRoute.addChildren([
  indexRoute,
  kycRoute,
  giftCardsRoute,
  addGiftCardRoute,
  giftCardDetailRoute,
  sellGiftCardRoute,
  withdrawalsRoute,
  adminKycRoute,
  adminWithdrawalsRoute,
  airtimeRoute,
  billsRoute,
  dataRoute,
  bettingRoute,
  cryptoRoute,
  electricityRoute,
  wifiInternetRoute,
  cableTvBillsRoute,
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
