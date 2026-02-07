import { useAdminGetPendingWithdrawals, useAdminUpdateWithdrawalStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import AdminRouteGuard from '../../components/admin/AdminRouteGuard';
import { Variant_paid_rejected, type WithdrawalRequest } from '../../types/app-types';

function AdminWithdrawalsContent() {
  const { data: withdrawals = [], isLoading } = useAdminGetPendingWithdrawals();
  const updateStatus = useAdminUpdateWithdrawalStatus();

  const handleApprove = async (withdrawalId: string) => {
    try {
      await updateStatus.mutateAsync({
        withdrawalId,
        newStatus: 'paid' as Variant_paid_rejected,
      });
      toast.success('Withdrawal approved');
    } catch (error) {
      toast.error('Failed to approve withdrawal');
      console.error(error);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    try {
      await updateStatus.mutateAsync({
        withdrawalId,
        newStatus: 'rejected' as Variant_paid_rejected,
      });
      toast.success('Withdrawal rejected');
    } catch (error) {
      toast.error('Failed to reject withdrawal');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const getStatusString = (withdrawal: WithdrawalRequest): string => {
    const status = withdrawal.status as any;
    if (typeof status === 'object' && status !== null && '__kind__' in status) {
      return status.__kind__;
    }
    return String(status);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Withdrawal Management</h1>
          <p className="text-muted-foreground mt-1">
            Review and process pending withdrawals
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Withdrawals</CardTitle>
          <CardDescription>
            {withdrawals.length} withdrawal{withdrawals.length !== 1 ? 's' : ''} awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No pending withdrawals
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => {
                const statusStr = getStatusString(withdrawal);
                
                return (
                  <div key={withdrawal.id} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-lg">
                          {formatCurrency(Number(withdrawal.amount) / 100, withdrawal.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          User: {withdrawal.user.toString().slice(0, 12)}...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Requested: {formatDate(Number(withdrawal.createdAt))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Method ID: {withdrawal.payoutMethodId}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {statusStr}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => handleApprove(withdrawal.id)}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(withdrawal.id)}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminWithdrawalsPage() {
  return (
    <AdminRouteGuard>
      <AdminWithdrawalsContent />
    </AdminRouteGuard>
  );
}
