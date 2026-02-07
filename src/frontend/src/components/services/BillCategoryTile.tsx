import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/card';

interface BillCategoryTileProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

export default function BillCategoryTile({ label, icon: Icon, onClick }: BillCategoryTileProps) {
  return (
    <Card
      className="p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent/50 transition-colors min-h-[140px]"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <span className="text-sm font-medium text-center leading-tight">
        {label}
      </span>
    </Card>
  );
}
