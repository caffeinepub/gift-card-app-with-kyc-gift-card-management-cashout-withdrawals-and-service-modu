import { Send, Download, ShoppingCart, Repeat, Landmark } from 'lucide-react';

interface CryptoQuickActionsProps {
  onSendClick: () => void;
  onReceiveClick: () => void;
  onBuyClick: () => void;
  onSwapClick: () => void;
  onSendToBankClick: () => void;
}

export default function CryptoQuickActions({
  onSendClick,
  onReceiveClick,
  onBuyClick,
  onSwapClick,
  onSendToBankClick,
}: CryptoQuickActionsProps) {
  const actions = [
    {
      label: 'Send',
      icon: Send,
      onClick: onSendClick,
      bgColor: 'bg-blue-500',
    },
    {
      label: 'Receive',
      icon: Download,
      onClick: onReceiveClick,
      bgColor: 'bg-green-500',
    },
    {
      label: 'Buy',
      icon: ShoppingCart,
      onClick: onBuyClick,
      bgColor: 'bg-purple-500',
    },
    {
      label: 'Swap',
      icon: Repeat,
      onClick: onSwapClick,
      bgColor: 'bg-orange-500',
    },
    {
      label: 'Send to bank',
      icon: Landmark,
      onClick: onSendToBankClick,
      bgColor: 'bg-indigo-500',
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="flex flex-col items-center gap-2 min-w-[70px]"
        >
          <div className={`${action.bgColor} rounded-full p-4 text-white shadow-lg hover:scale-105 transition-transform`}>
            <action.icon className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium text-foreground whitespace-nowrap">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
