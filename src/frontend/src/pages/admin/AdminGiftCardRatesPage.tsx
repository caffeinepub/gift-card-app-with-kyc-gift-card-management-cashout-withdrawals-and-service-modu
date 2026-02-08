import { useState } from 'react';
import { useGetAllGiftCardRates, useCreateGiftCardRate, useUpdateGiftCardRate, useSetGiftCardRateStatus, useGetCoinPriceIndex } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Plus, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import CoinPriceIndexCard from '../../components/admin/CoinPriceIndexCard';
import { GiftCardRateStatus } from '../../backend';

export default function AdminGiftCardRatesPage() {
  const { data: rates = [], isLoading } = useGetAllGiftCardRates();
  const { data: coinPriceIndex = 100 } = useGetCoinPriceIndex();
  const createRate = useCreateGiftCardRate();
  const updateRate = useUpdateGiftCardRate();
  const setStatus = useSetGiftCardRateStatus();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<any>(null);

  const [brandName, setBrandName] = useState('');
  const [percentage, setPercentage] = useState('');

  const handleCreate = async () => {
    const percentageNum = parseInt(percentage);
    if (!brandName || isNaN(percentageNum) || percentageNum < 0) {
      toast.error('Please enter valid brand name and rate percentage');
      return;
    }

    try {
      await createRate.mutateAsync({
        brandName,
        ratePercentage: percentageNum,
      });
      toast.success('Gift card rate created successfully');
      setCreateDialogOpen(false);
      setBrandName('');
      setPercentage('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create rate');
    }
  };

  const handleEdit = async () => {
    if (!selectedRate) return;

    const percentageNum = parseInt(percentage);
    if (isNaN(percentageNum) || percentageNum < 0) {
      toast.error('Please enter a valid rate percentage');
      return;
    }

    try {
      await updateRate.mutateAsync({
        rateId: selectedRate.id.toString(),
        ratePercentage: percentageNum,
      });
      toast.success('Gift card rate updated successfully');
      setEditDialogOpen(false);
      setSelectedRate(null);
      setPercentage('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update rate');
    }
  };

  const handleToggleStatus = async (rateId: bigint, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? GiftCardRateStatus.inactive : GiftCardRateStatus.active;
    try {
      await setStatus.mutateAsync({
        rateId: rateId.toString(),
        status: newStatus,
      });
      toast.success(`Rate ${newStatus === GiftCardRateStatus.active ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update rate status');
    }
  };

  const openEditDialog = (rate: any) => {
    setSelectedRate(rate);
    setPercentage(rate.ratePercentage.toString());
    setEditDialogOpen(true);
  };

  const calculateEffectiveRate = (ratePercentage: bigint) => {
    return (Number(ratePercentage) * Number(coinPriceIndex)) / 100;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gift Card Rates</h1>
        <p className="text-muted-foreground mt-2">
          Manage exchange rates for gift card brands
        </p>
      </div>

      <CoinPriceIndexCard />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Rates</CardTitle>
              <CardDescription>View and manage gift card exchange rates</CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Gift Card Rate</DialogTitle>
                  <DialogDescription>
                    Add a new exchange rate for a gift card brand
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                      id="brandName"
                      placeholder="e.g., Amazon Gift Card"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Rate Percentage</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      placeholder="e.g., 85"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Base rate percentage (will be multiplied by coin price index)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={createRate.isPending}>
                    {createRate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : rates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No rates configured yet</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Rate
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Stored Rate %</TableHead>
                  <TableHead>Effective Rate %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id.toString()}>
                    <TableCell className="font-medium">{rate.brandName}</TableCell>
                    <TableCell>{rate.ratePercentage.toString()}%</TableCell>
                    <TableCell className="font-semibold">
                      {calculateEffectiveRate(rate.ratePercentage).toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={rate.status === 'active' ? 'default' : 'secondary'}>
                        {rate.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(Number(rate.updatedAt) / 1000000).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(rate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(rate.id, rate.status)}
                        disabled={setStatus.isPending}
                      >
                        {rate.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Gift Card Rate</DialogTitle>
            <DialogDescription>
              Update the exchange rate for {selectedRate?.brandName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editPercentage">Rate Percentage</Label>
              <Input
                id="editPercentage"
                type="number"
                min="0"
                placeholder="e.g., 85"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Base rate percentage (will be multiplied by coin price index)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateRate.isPending}>
              {updateRate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
