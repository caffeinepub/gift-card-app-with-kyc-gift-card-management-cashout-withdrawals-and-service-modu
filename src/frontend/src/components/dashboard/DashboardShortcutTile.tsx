import { LucideIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface DashboardShortcutTileProps {
  label: string;
  icon: LucideIcon;
  route?: string;
  comingSoon?: boolean;
  color?: string;
  badge?: string;
  size?: 'default' | 'large';
  onClick?: () => void;
}

export default function DashboardShortcutTile({
  label,
  icon: Icon,
  route,
  comingSoon,
  color = 'oklch(0.7 0.15 220)',
  badge,
  size = 'default',
  onClick,
}: DashboardShortcutTileProps) {
  const isClickable = !comingSoon && route;

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={comingSoon}
      className={cn(
        'flex flex-col items-center gap-2 transition-all',
        size === 'large' ? 'min-w-[80px]' : 'w-full',
        isClickable && 'hover:scale-105 active:scale-95',
        comingSoon && 'opacity-60 cursor-not-allowed'
      )}
    >
      <div className="relative">
        <div
          className={cn(
            'rounded-full flex items-center justify-center shadow-sm',
            size === 'large' ? 'h-16 w-16' : 'h-14 w-14'
          )}
          style={{
            backgroundColor: color,
          }}
        >
          <Icon 
            className={cn(
              'text-white',
              size === 'large' ? 'h-7 w-7' : 'h-6 w-6'
            )} 
          />
        </div>
        {badge && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 px-1.5 text-[10px] bg-primary text-primary-foreground"
          >
            {badge}
          </Badge>
        )}
      </div>
      <div className="text-center">
        <p className={cn(
          'font-medium text-foreground leading-tight',
          size === 'large' ? 'text-sm' : 'text-xs'
        )}>
          {label}
        </p>
        {comingSoon && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Coming soon
          </p>
        )}
      </div>
    </button>
  );
}
