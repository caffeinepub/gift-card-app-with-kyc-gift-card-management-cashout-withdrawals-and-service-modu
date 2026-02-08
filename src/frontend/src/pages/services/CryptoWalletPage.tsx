import { useState } from 'react';
import CryptoDashboardHeader from '../../components/crypto/CryptoDashboardHeader';
import CryptoQuickActions from '../../components/crypto/CryptoQuickActions';
import CryptoTokenList from '../../components/crypto/CryptoTokenList';
import CryptoActivitySection from '../../components/crypto/CryptoActivitySection';
import SendCryptoSheet from '../../components/crypto/sheets/SendCryptoSheet';
import ReceiveCryptoSheet from '../../components/crypto/sheets/ReceiveCryptoSheet';
import BuyCryptoSheet from '../../components/crypto/sheets/BuyCryptoSheet';
import SwapCryptoSheet from '../../components/crypto/sheets/SwapCryptoSheet';
import SendToBankSheet from '../../components/crypto/sheets/SendToBankSheet';

// Mock data for tokens
const mockTokens = [
  {
    id: 'btc',
    name: 'Bitcoin',
    ticker: 'BTC',
    balance: '0.0234',
    usdValue: '$2,340.50',
    icon: '/assets/generated/coin-btc.dim_128x128.png',
  },
  {
    id: 'eth',
    name: 'Ethereum',
    ticker: 'ETH',
    balance: '1.5678',
    usdValue: '$4,567.89',
    icon: '/assets/generated/coin-eth.dim_128x128.png',
  },
  {
    id: 'usdt',
    name: 'Tether',
    ticker: 'USDT',
    balance: '1000.00',
    usdValue: '$1,000.00',
    icon: '/assets/generated/coin-usdt.dim_128x128.png',
  },
  {
    id: 'bnb',
    name: 'BNB',
    ticker: 'BNB',
    balance: '5.2345',
    usdValue: '$1,567.89',
    icon: '/assets/generated/coin-bnb.dim_128x128.png',
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    ticker: 'USDC',
    balance: '500.00',
    usdValue: '$500.00',
    icon: '/assets/generated/coin-usdc.dim_128x128.png',
  },
];

// Assets for sheets (with symbol and balance)
const mockAssets = mockTokens.map(token => ({
  symbol: token.ticker,
  name: token.name,
  balance: token.balance,
}));

export default function CryptoWalletPage() {
  const [sendSheetOpen, setSendSheetOpen] = useState(false);
  const [receiveSheetOpen, setReceiveSheetOpen] = useState(false);
  const [buySheetOpen, setBuySheetOpen] = useState(false);
  const [swapSheetOpen, setSwapSheetOpen] = useState(false);
  const [sendToBankSheetOpen, setSendToBankSheetOpen] = useState(false);

  // Calculate total balance from mock tokens
  const totalBalance = mockTokens.reduce((sum, token) => {
    const value = parseFloat(token.usdValue.replace(/[$,]/g, ''));
    return sum + value;
  }, 0);

  const formattedBalance = `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-background pb-safe">
      <CryptoDashboardHeader balance={formattedBalance} />

      <div className="px-4 space-y-6 -mt-8">
        <CryptoQuickActions
          onSendClick={() => setSendSheetOpen(true)}
          onReceiveClick={() => setReceiveSheetOpen(true)}
          onBuyClick={() => setBuySheetOpen(true)}
          onSwapClick={() => setSwapSheetOpen(true)}
          onSendToBankClick={() => setSendToBankSheetOpen(true)}
        />

        <CryptoTokenList tokens={mockTokens} />

        <CryptoActivitySection />
      </div>

      <SendCryptoSheet open={sendSheetOpen} onOpenChange={setSendSheetOpen} assets={mockAssets} />
      <ReceiveCryptoSheet open={receiveSheetOpen} onOpenChange={setReceiveSheetOpen} assets={mockAssets} />
      <BuyCryptoSheet open={buySheetOpen} onOpenChange={setBuySheetOpen} assets={mockAssets} />
      <SwapCryptoSheet open={swapSheetOpen} onOpenChange={setSwapSheetOpen} assets={mockAssets} />
      <SendToBankSheet open={sendToBankSheetOpen} onOpenChange={setSendToBankSheetOpen} />
    </div>
  );
}
