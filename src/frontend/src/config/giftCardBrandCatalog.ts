export interface GiftCardBrand {
  name: string;
  searchTerms: string;
  iconPath: string;
}

export const GIFT_CARD_BRANDS: GiftCardBrand[] = [
  {
    name: 'Adidas Gift Card',
    searchTerms: 'adidas gift card',
    iconPath: '/assets/generated/brands/adidas.dim_128x128.png',
  },
  {
    name: 'Amazon Gift Card',
    searchTerms: 'amazon gift card',
    iconPath: '/assets/generated/brands/amazon.dim_128x128.png',
  },
  {
    name: 'American Express (AMEX) Gift Card',
    searchTerms: 'american express amex gift card',
    iconPath: '/assets/generated/brands/amex.dim_128x128.png',
  },
  {
    name: 'Apple/iTunes Gift Card',
    searchTerms: 'apple itunes gift card',
    iconPath: '/assets/generated/brands/apple-itunes.dim_128x128.png',
  },
  {
    name: 'Best Buy Gift Card',
    searchTerms: 'best buy gift card',
    iconPath: '/assets/generated/brands/bestbuy.dim_128x128.png',
  },
  {
    name: 'Ebay Gift Card',
    searchTerms: 'ebay gift card',
    iconPath: '/assets/generated/brands/ebay.dim_128x128.png',
  },
  {
    name: 'Footlocker Gift Card',
    searchTerms: 'footlocker gift card',
    iconPath: '/assets/generated/brands/footlocker.dim_128x128.png',
  },
  {
    name: 'GameStop Gift Card',
    searchTerms: 'gamestop gift card',
    iconPath: '/assets/generated/brands/gamestop.dim_128x128.png',
  },
  {
    name: "KOHL'S Gift Card",
    searchTerms: 'kohls kohl gift card',
    iconPath: '/assets/generated/brands/kohls.dim_128x128.png',
  },
  {
    name: "Macy's Gift Card",
    searchTerms: 'macys macy gift card',
    iconPath: '/assets/generated/brands/macys.dim_128x128.png',
  },
  {
    name: 'Mastercard Gift Card',
    searchTerms: 'mastercard gift card',
    iconPath: '/assets/generated/brands/mastercard.dim_128x128.png',
  },
  {
    name: 'NetSpend Visa Gift Card',
    searchTerms: 'netspend visa gift card',
    iconPath: '/assets/generated/brands/netspend-visa.dim_128x128.png',
  },
  {
    name: 'Nike Gift Card',
    searchTerms: 'nike gift card',
    iconPath: '/assets/generated/brands/nike.dim_128x128.png',
  },
  {
    name: 'Nordstrom Gift Card',
    searchTerms: 'nordstrom gift card',
    iconPath: '/assets/generated/brands/nordstrom.dim_128x128.png',
  },
  {
    name: 'Offgamers Gift Card',
    searchTerms: 'offgamers gift card',
    iconPath: '/assets/generated/brands/offgamers.dim_128x128.png',
  },
  {
    name: 'Open/Other Gift Cards Category',
    searchTerms: 'open other gift cards category',
    iconPath: '/assets/generated/brands/open-other.dim_128x128.png',
  },
  {
    name: 'Play Station Gift Card',
    searchTerms: 'play station playstation ps gift card',
    iconPath: '/assets/generated/brands/playstation.dim_128x128.png',
  },
  {
    name: 'Razer Gold Gift Card',
    searchTerms: 'razer gold gift card',
    iconPath: '/assets/generated/brands/razer-gold.dim_128x128.png',
  },
  {
    name: 'Roblox Gift Card',
    searchTerms: 'roblox gift card',
    iconPath: '/assets/generated/brands/roblox.dim_128x128.png',
  },
  {
    name: 'Sephora Gift Card',
    searchTerms: 'sephora gift card',
    iconPath: '/assets/generated/brands/sephora.dim_128x128.png',
  },
  {
    name: 'Steam Gift Card',
    searchTerms: 'steam gift card',
    iconPath: '/assets/generated/brands/steam.dim_128x128.png',
  },
  {
    name: 'Target Gift Card',
    searchTerms: 'target gift card',
    iconPath: '/assets/generated/brands/target.dim_128x128.png',
  },
  {
    name: 'Target Visa Gift Card',
    searchTerms: 'target visa gift card',
    iconPath: '/assets/generated/brands/target-visa.dim_128x128.png',
  },
  {
    name: 'Vanilla Gift Card',
    searchTerms: 'vanilla gift card',
    iconPath: '/assets/generated/brands/vanilla.dim_128x128.png',
  },
];

export const GENERIC_GIFT_CARD_ICON = '/assets/generated/brands/generic-giftcard.dim_128x128.png';

export function filterBrands(searchQuery: string): GiftCardBrand[] {
  if (!searchQuery.trim()) {
    return GIFT_CARD_BRANDS;
  }
  
  const query = searchQuery.toLowerCase().trim();
  return GIFT_CARD_BRANDS.filter(brand => 
    brand.searchTerms.toLowerCase().includes(query)
  );
}
