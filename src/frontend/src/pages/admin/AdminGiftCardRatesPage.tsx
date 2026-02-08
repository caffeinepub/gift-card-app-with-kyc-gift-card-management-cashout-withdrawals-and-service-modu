import { useState } from 'react';
import { useGetAllGiftCardRates, useCreateGiftCardRate, useUpdateGiftCardRate, useSetGiftCardRateStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Percent, Plus, Edit, Power, Loader2 } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import AdminRouteGuard from '../../components/admin/AdminRouteGuard';
import { GiftCardRateStatus } from '../../backend';
import type { GiftCardRate } from '../../backend';

export default function AdminGiftCardRatesPage() {
  const { data: rates = [], isLoading } = useGetAllGiftCardRates();
  const createRate = useCreateGiftCardRate();
  const updateRate = useUpdateGiftCardRate();
  const setStatus = useSetGiftCardRateStatus();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<GiftCardRate | null>(null);

  const [newBrandName, setNewBrandName] = useState('');
  const [newRatePercentage, setNewRatePercentage] = useState('');
  const [editRatePercentage, setEditRatePercentage] = useState('');

  const handleCreateRate = async () => {
    if (!newBrandName.trim()) {
      toast.error('Please enter a brand name');
      return;
    }

    const percentage = parseInt(newRatePercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast.error('Please enter a valid percentage (0-100)');
      return;
    }

    try {
      await createRate.mutateAsync({
        brandName: newBrandName.trim(),
        ratePercentage: BigInt(percentage),
      });
      toast.success('Gift card rate created successfully');
      setIsCreateDialogOpen(false);
      setNewBrandName('');
      setNewRatePercentage('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create rate';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleEditRate = async () => {
    if (!editingRate) return;

    const percentage = parseInt(editRatePercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast.error('Please enter a valid percentage (0-100)');
      return;
    }

    try {
      await updateRate.mutateAsync({
        rateId: editingRate.id.toString(),
        ratePercentage: BigInt(percentage),
      });
      toast.success('Rate updated successfully');
      setIsEditDialogOpen(false);
      setEditingRate(null);
      setEditRatePercentage('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update rate';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleToggleStatus = async (rate: GiftCardRate) => {
    const newStatus = rate.status === GiftCardRateStatus.active 
      ? GiftCardRateStatus.inactive 
      : GiftCardRateStatus.active;
    
    try {
      await setStatus.mutateAsync({
        rateId: rate.id.toString(),
        status: newStatus,
      });
      toast.success(`Rate ${newStatus === GiftCardRateStatus.active ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update status';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const openEditDialog = (rate: GiftCardRate) => {
    setEditingRate(rate);
    setEditRatePercentage(rate.ratePercentage.toString());
    setIsEditDialogOpen(true);
  };

  return (
    <AdminRouteGuard>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Percent className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Gift Card Rates</h1>
              <p className="text-muted-foreground mt-1">
                Manage gift card exchange rates by brand
              </p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                    placeholder="e.g., Amazon, iTunes, Steam"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ratePercentage">Rate Percentage</Label>
                  <Input
                    id="ratePercentage"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 85"
                    value={newRatePercentage}
                    onChange={(e) => setNewRatePercentage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the percentage rate (0-100). For example, 85 means 85% of card value.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={createRate.isPending}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateRate} disabled={createRate.isPending}>
                  {createRate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Rate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Rates</CardTitle>
            <CardDescription>
              View and manage all gift card exchange rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : rates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No gift card rates configured yet. Click "Add Rate" to create one.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate) => (
                      <TableRow key={rate.id.toString()}>
                        <TableCell className="font-medium">{rate.brandName}</TableCell>
                        <TableCell>{rate.ratePercentage.toString()}%</TableCell>
                        <TableCell>
                          <Badge variant={rate.status === GiftCardRateStatus.active ? 'default' : 'secondary'}>
                            {rate.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(Number(rate.createdAt) / 1_000_000)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(Number(rate.updatedAt) / 1_000_000)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(rate)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(rate)}
                              disabled={setStatus.isPending}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Gift Card Rate</DialogTitle>
              <DialogDescription>
                Update the exchange rate for {editingRate?.brandName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editRatePercentage">Rate Percentage</Label>
                <Input
                  id="editRatePercentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 85"
                  value={editRatePercentage}
                  onChange={(e) => setEditRatePercentage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the percentage rate (0-100). For example, 85 means 85% of card value.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateRate.isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleEditRate} disabled={updateRate.isPending}>
                {updateRate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Rate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminRouteGuard>
  );
}
