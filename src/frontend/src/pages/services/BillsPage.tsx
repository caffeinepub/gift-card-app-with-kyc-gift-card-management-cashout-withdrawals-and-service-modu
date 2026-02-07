import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Receipt } from 'lucide-react';
import { Button } from '../../components/ui/button';
import BillCategoryTile from '../../components/services/BillCategoryTile';
import { Radio, Grid3x3, Zap, Wifi, Tv, Dices } from 'lucide-react';

export default function BillsPage() {
  const navigate = useNavigate();

  const categories = [
    { label: 'Airtime', icon: Radio, path: '/services/airtime' },
    { label: 'Data', icon: Grid3x3, path: '/services/data' },
    { label: 'Electricity', icon: Zap, path: '/services/electricity' },
    { label: 'Wifi | Internet', icon: Wifi, path: '/services/wifi-internet' },
    { label: 'Cable | TV Bills', icon: Tv, path: '/services/cable-tv-bills' },
    { label: 'Betting', icon: Dices, path: '/services/betting' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => window.history.back()}
        className="rounded-full"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Header with centered icon */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Receipt className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Bills Payment</h1>
          <p className="text-muted-foreground mt-1">
            What bills do you want to pay?
          </p>
        </div>
      </div>

      {/* 2-column grid of category tiles */}
      <div className="grid grid-cols-2 gap-4 px-4">
        {categories.map((category) => (
          <BillCategoryTile
            key={category.path}
            label={category.label}
            icon={category.icon}
            onClick={() => navigate({ to: category.path })}
          />
        ))}
      </div>
    </div>
  );
}
