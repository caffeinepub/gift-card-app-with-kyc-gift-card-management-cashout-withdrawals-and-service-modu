import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Search, Globe, Calendar, Database } from 'lucide-react';
import { toast } from 'sonner';
import { addLocalTransaction } from '../../state/localTransactions';
import { ESIM_PLANS, EsimPlan } from '../../config/esimPlans';

export default function EsimPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<EsimPlan | null>(null);

  const filteredPlans = ESIM_PLANS.filter(plan =>
    plan.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOrder = (plan: EsimPlan) => {
    const transaction = {
      id: `esim-${Date.now()}`,
      type: 'esim' as const,
      description: `eSIM: ${plan.name}`,
      amount: plan.price,
      currency: 'usd' as const,
      status: 'pending' as const,
      timestamp: BigInt(Date.now() * 1000000),
      metadata: {
        region: plan.region,
        data: plan.data,
        duration: plan.duration,
      },
    };

    addLocalTransaction(transaction);
    toast.success('eSIM order placed successfully', {
      description: 'Your eSIM is pending activation',
    });
    setSelectedPlan(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">eSIM Plans</h1>
          <p className="text-sm text-muted-foreground">
            Stay connected worldwide with digital SIM cards
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by region or plan name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Globe className="h-3 w-3" />
                    {plan.region}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  ${plan.price}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span>{plan.data}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{plan.duration}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
              <Button
                onClick={() => setSelectedPlan(plan)}
                className="w-full"
              >
                Order Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              No plans found matching your search
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPlan && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Confirm Order</CardTitle>
              <CardDescription>
                Review your eSIM plan details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="text-sm font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Region</span>
                  <span className="text-sm font-medium">{selectedPlan.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data</span>
                  <span className="text-sm font-medium">{selectedPlan.data}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">{selectedPlan.duration}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">${selectedPlan.price}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleOrder(selectedPlan)}
                  className="flex-1"
                >
                  Confirm Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
