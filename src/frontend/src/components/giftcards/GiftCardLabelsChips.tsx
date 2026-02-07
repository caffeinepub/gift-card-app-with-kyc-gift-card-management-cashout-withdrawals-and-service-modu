import { Badge } from '../ui/badge';

interface GiftCardLabelsChipsProps {
  tags: string[];
  maxDisplay?: number;
}

export default function GiftCardLabelsChips({ tags, maxDisplay = 3 }: GiftCardLabelsChipsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map((tag) => (
        <Badge key={tag} variant="outline" className="text-xs">
          {tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
