import { useState } from 'react';
import { GENERIC_GIFT_CARD_ICON } from '../../config/giftCardBrandCatalog';

interface GiftCardBrandRowProps {
  name: string;
  iconPath: string;
  onClick: () => void;
}

export default function GiftCardBrandRow({ name, iconPath, onClick }: GiftCardBrandRowProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors rounded-lg text-left"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        <img
          src={imageError ? GENERIC_GIFT_CARD_ICON : iconPath}
          alt={name}
          className="w-8 h-8 object-contain"
          onError={() => setImageError(true)}
        />
      </div>
      <span className="flex-1 text-base font-medium">{name}</span>
    </button>
  );
}
