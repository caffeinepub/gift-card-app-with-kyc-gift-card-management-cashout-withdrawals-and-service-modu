import { useState } from 'react';
import { useAdminGetPendingWithdrawals, useAdminUpdateWithdrawalStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Wallet, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import AdminRouteGuard from '../../components/admin/AdminRouteGuard';

export default function AdminWithdrawalsPage() {
  const { data: pendingWithdrawals = [], isLoading } = useAdminGetPendingWithdrawals();
  const updateStatus = useAdminUpdateWithdrawalStatus();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await updateStatus.mutateAsync({
        requestId,
        newStatus: 'paid',
      });
      toast.success('Withdrawal approved');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to approve withdrawal';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await updateStatus.mutateAsync({
        requestId,
        newStatus: 'rejected',
      });
      toast.success('Withdrawal rejected');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to reject withdrawal';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatAmount = (amount: bigint): string => {
    return `$${(Number(amount) / 100).toFixed(2)}`;
  };

  return (
    <AdminRouteGuard>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Withdrawal Management</h1>
            <p className="text-muted-foreground mt-1">
              Review and process pending withdrawal requests
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Withdrawals</CardTitle>
            <CardDescription>
              Approve or reject withdrawal requests from users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : pendingWithdrawals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No pending withdrawal requests.
              </p>
            ) : (
              <div className="space-y-4">
                {pendingWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-lg">
                          {formatAmount(withdrawal.amount)}
                        </p>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>User: {withdrawal.user.toString().slice(0, 20)}...</p>
                        <p>Payout Method ID: {withdrawal.payoutMethodId}</p>
                        <p>Requested: {formatDate(Number(withdrawal.createdAt) / 1_000_000)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(withdrawal.id)}
                        disabled={processingId === withdrawal.id}
                      >
                        {processingId === withdrawal.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(withdrawal.id)}
                        disabled={processingId === withdrawal.id}
                      >
                        {processingId === withdrawal.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminRouteGuard>
  );
}
