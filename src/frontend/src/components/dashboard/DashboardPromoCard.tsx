import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

export default function DashboardPromoCard() {
  const dots = [0, 1, 2, 3, 4];
  const activeDot = 0;

  return (
    <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
      <div className="p-6 flex items-center gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-2">
            Stay connected globally
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Get your eSIM and enjoy smooth, instant connect anywhere.
          </p>
        </div>
        <div className="flex-shrink-0 w-24 h-24 relative">
          <img
            src="/assets/generated/dashboard-promo-illustration.dim_600x400.png"
            alt="Promo illustration"
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to a simple gradient circle if image fails
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.style.background = 'linear-gradient(135deg, oklch(0.7 0.15 220) 0%, oklch(0.6 0.2 200) 100%)';
                parent.style.borderRadius = '50%';
              }
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 pb-4">
        {dots.map((dot) => (
          <div
            key={dot}
            className={cn(
              'h-1.5 rounded-full transition-all',
              dot === activeDot 
                ? 'w-6 bg-foreground' 
                : 'w-1.5 bg-muted-foreground/30'
            )}
          />
        ))}
      </div>
    </Card>
  );
}
