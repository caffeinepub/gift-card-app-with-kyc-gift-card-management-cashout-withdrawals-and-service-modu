import { useState } from 'react';
import { useGetChatEscrows, useCreateEscrow, useFundEscrow, useReleaseEscrow, useCancelEscrow } from '../../hooks/useTradingChat';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Shield, Plus, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { extractBackendErrorMessage } from '../../utils/backendErrorMessage';
import { Principal } from '@icp-sdk/core/principal';
import type { ChatId } from '../../backend';

interface EscrowPanelProps {
  chatId: ChatId;
  partnerPrincipal: Principal;
}

export default function EscrowPanel({ chatId, partnerPrincipal }: EscrowPanelProps) {
  const { identity } = useInternetIdentity();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'fund' | 'release' | 'cancel'; escrowId: bigint } | null>(null);

  const { data: escrows = [], isLoading } = useGetChatEscrows(chatId);
  const createEscrowMutation = useCreateEscrow();
  const fundEscrowMutation = useFundEscrow();
  const releaseEscrowMutation = useReleaseEscrow();
  const cancelEscrowMutation = useCancelEscrow();

  const currentUserPrincipal = identity?.getPrincipal().toString();

  const handleCreateEscrow = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await createEscrowMutation.mutateAsync({
        chatId,
        amount: BigInt(Math.floor(amountNum * 100)),
        seller: partnerPrincipal,
      });
      toast.success('Escrow created successfully');
      setAmount('');
      setShowCreateForm(false);
    } catch (error) {
      const message = extractBackendErrorMessage(error, 'Failed to create escrow');
      toast.error(message);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === 'fund') {
        await fundEscrowMutation.mutateAsync(confirmAction.escrowId);
        toast.success('Escrow funded successfully');
      } else if (confirmAction.type === 'release') {
        await releaseEscrowMutation.mutateAsync(confirmAction.escrowId);
        toast.success('Escrow released successfully');
      } else if (confirmAction.type === 'cancel') {
        await cancelEscrowMutation.mutateAsync(confirmAction.escrowId);
        toast.success('Escrow cancelled successfully');
      }
    } catch (error) {
      const message = extractBackendErrorMessage(error, `Failed to ${confirmAction.type} escrow`);
      toast.error(message);
    } finally {
      setConfirmAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'created':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Created</Badge>;
      case 'funded':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Funded</Badge>;
      case 'released':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">Released</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="border-chat-escrow/20 bg-chat-escrow/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-chat-escrow" />
              <CardTitle>Escrow Protection</CardTitle>
            </div>
            {!showCreateForm && (
              <Button
                size="sm"
                onClick={() => setShowCreateForm(true)}
                className="bg-chat-escrow hover:bg-chat-escrow/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Escrow
              </Button>
            )}
          </div>
          <CardDescription>
            Secure your transaction with escrow protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create Form */}
          {showCreateForm && (
            <div className="p-4 border rounded-lg bg-background space-y-3">
              <div className="space-y-2">
                <Label htmlFor="escrow-amount">Amount (USD)</Label>
                <Input
                  id="escrow-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  You will be the buyer, and your partner will be the seller
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateEscrow}
                  disabled={createEscrowMutation.isPending || !amount}
                  className="bg-chat-escrow hover:bg-chat-escrow/90"
                >
                  {createEscrowMutation.isPending ? 'Creating...' : 'Create Escrow'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setAmount('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Escrows List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : escrows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No escrows created yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {escrows.map((escrow) => {
                const isBuyer = escrow.buyer.toString() === currentUserPrincipal;
                const isSeller = escrow.seller.toString() === currentUserPrincipal;
                const amountUSD = Number(escrow.amount) / 100;
                const status = escrow.status.__kind__;

                const canFund = isBuyer && status === 'created';
                const canRelease = isBuyer && status === 'funded';
                const canCancel = (isBuyer || isSeller) && status === 'created';

                return (
                  <div key={escrow.escrowId.toString()} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">${amountUSD.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isBuyer ? 'You are the buyer' : 'You are the seller'}
                        </p>
                      </div>
                      {getStatusBadge(status)}
                    </div>

                    {/* Action Buttons */}
                    {(canFund || canRelease || canCancel) && (
                      <div className="flex gap-2 flex-wrap">
                        {canFund && (
                          <Button
                            size="sm"
                            onClick={() => setConfirmAction({ type: 'fund', escrowId: escrow.escrowId })}
                            disabled={fundEscrowMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Fund Escrow
                          </Button>
                        )}
                        {canRelease && (
                          <Button
                            size="sm"
                            onClick={() => setConfirmAction({ type: 'release', escrowId: escrow.escrowId })}
                            disabled={releaseEscrowMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Release to Seller
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmAction({ type: 'cancel', escrowId: escrow.escrowId })}
                            disabled={cancelEscrowMutation.isPending}
                            className="border-red-500/20 text-red-600 hover:bg-red-500/10"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm {confirmAction?.type === 'fund' ? 'Fund' : confirmAction?.type === 'release' ? 'Release' : 'Cancel'} Escrow
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'fund' && 'This will mark the escrow as funded. Make sure you have transferred the funds.'}
              {confirmAction?.type === 'release' && 'This will release the funds to the seller. This action cannot be undone.'}
              {confirmAction?.type === 'cancel' && 'This will cancel the escrow. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
