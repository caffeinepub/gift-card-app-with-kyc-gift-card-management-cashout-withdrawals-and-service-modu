import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { filterBrands } from '../../config/giftCardBrandCatalog';
import GiftCardBrandRow from './GiftCardBrandRow';

interface SelectGiftCardCategoryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (brandName: string) => void;
}

export default function SelectGiftCardCategoryPicker({
  open,
  onOpenChange,
  onSelect,
}: SelectGiftCardCategoryPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBrands = useMemo(() => {
    return filterBrands(searchQuery);
  }, [searchQuery]);

  const handleSelect = (brandName: string) => {
    onSelect(brandName);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-center text-xl">Select Gift Card Category</SheetTitle>
          <SheetDescription className="sr-only">
            Choose a gift card brand from the list
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Select Gift Card Category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="py-2 space-y-1">
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand) => (
                <GiftCardBrandRow
                  key={brand.name}
                  name={brand.name}
                  iconPath={brand.iconPath}
                  onClick={() => handleSelect(brand.name)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No gift card brands found matching "{searchQuery}"
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
