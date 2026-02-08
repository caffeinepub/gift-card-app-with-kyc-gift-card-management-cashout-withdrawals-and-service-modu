export interface EsimPlan {
  id: string;
  name: string;
  region: string;
  data: string;
  duration: string;
  price: number;
  description: string;
}

export const ESIM_PLANS: EsimPlan[] = [
  {
    id: 'global-1gb-7d',
    name: 'Global Starter',
    region: 'Global (130+ countries)',
    data: '1GB',
    duration: '7 days',
    price: 9.99,
    description: 'Perfect for short trips with light data usage',
  },
  {
    id: 'global-3gb-30d',
    name: 'Global Standard',
    region: 'Global (130+ countries)',
    data: '3GB',
    duration: '30 days',
    price: 24.99,
    description: 'Ideal for regular travelers',
  },
  {
    id: 'global-10gb-30d',
    name: 'Global Premium',
    region: 'Global (130+ countries)',
    data: '10GB',
    duration: '30 days',
    price: 49.99,
    description: 'Best for heavy data users',
  },
  {
    id: 'europe-5gb-30d',
    name: 'Europe Explorer',
    region: 'Europe (40+ countries)',
    data: '5GB',
    duration: '30 days',
    price: 19.99,
    description: 'Coverage across all major European destinations',
  },
  {
    id: 'asia-5gb-30d',
    name: 'Asia Connect',
    region: 'Asia (20+ countries)',
    data: '5GB',
    duration: '30 days',
    price: 22.99,
    description: 'Stay connected across Asia',
  },
  {
    id: 'usa-10gb-30d',
    name: 'USA Unlimited',
    region: 'United States',
    data: '10GB',
    duration: '30 days',
    price: 29.99,
    description: 'High-speed data across the USA',
  },
  {
    id: 'africa-3gb-30d',
    name: 'Africa Roamer',
    region: 'Africa (15+ countries)',
    data: '3GB',
    duration: '30 days',
    price: 27.99,
    description: 'Reliable connectivity across Africa',
  },
  {
    id: 'latam-5gb-30d',
    name: 'Latin America',
    region: 'Latin America (20+ countries)',
    data: '5GB',
    duration: '30 days',
    price: 24.99,
    description: 'Coverage from Mexico to Argentina',
  },
];
