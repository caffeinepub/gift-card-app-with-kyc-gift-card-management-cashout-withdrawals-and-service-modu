import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetWithdrawals, useCreateWithdrawal, useGetPayoutMethods, useIsCallerKycVerified } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Loader2, AlertCircle, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/utils';
import { getWithdrawalTimingStatus } from '../../utils/withdrawalProcessingWindow';

export default function WithdrawalsPage() {
  const navigate = useNavigate();
  const { data: withdrawals, isLoading: withdrawalsLoading } = useGetWithdrawals();
  const { data: payoutMethods, isLoading: methodsLoading } = useGetPayoutMethods();
  const { data: isKycVerified, isLoading: kycLoading } = useIsCallerKycVerified();
  const createWithdrawal = useCreateWithdrawal();

  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethodId || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await createWithdrawal.mutateAsync({
        payoutMethodId: selectedMethodId,
        amount: BigInt(Math.floor(amountNum * 100)),
      });

      toast.success('Withdrawal request submitted successfully');
      setSelectedMethodId('');
      setAmount('');
    } catch (error: any) {
      console.error('Withdrawal request error:', error);
      toast.error(error.message || 'Failed to submit withdrawal request');
    }
  };

  if (withdrawalsLoading || methodsLoading || kycLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Withdrawals</h1>
          <p className="text-sm text-muted-foreground">
            Request and manage your withdrawals
          </p>
        </div>
      </div>

      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="request">Request Withdrawal</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          {!isKycVerified && (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>KYC Verification Required</AlertTitle>
              <AlertDescription>
                You must complete KYC verification before you can request withdrawals.
                <Button
                  variant="link"
                  className="p-0 h-auto ml-1 text-destructive underline"
                  onClick={() => navigate({ to: '/kyc' })}
                >
                  Complete KYC now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>New Withdrawal Request</CardTitle>
              <CardDescription>
                Typical processing time: 5–20 minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payoutMethod">Payout Method</Label>
                  <Select
                    value={selectedMethodId}
                    onValueChange={setSelectedMethodId}
                    disabled={!isKycVerified}
                  >
                    <SelectTrigger id="payoutMethod">
                      <SelectValue placeholder="Select a payout method" />
                    </SelectTrigger>
                    <SelectContent>
                      {payoutMethods?.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.bankName} - {method.accountNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {payoutMethods?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No payout methods available. Add one first.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100.00"
                    disabled={!isKycVerified}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createWithdrawal.isPending || !isKycVerified}
                >
                  {createWithdrawal.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>
                View all your withdrawal requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!withdrawals || withdrawals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No withdrawal requests yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => {
                    const isPending = withdrawal.status.__kind__ === 'pending';
                    const isPaid = withdrawal.status.__kind__ === 'paid';
                    const isRejected = withdrawal.status.__kind__ === 'rejected';
                    
                    const statusInfo = isPending 
                      ? getWithdrawalTimingStatus(withdrawal.createdAt)
                      : null;

                    return (
                      <div
                        key={withdrawal.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">
                              {formatCurrency(Number(withdrawal.amount) / 100, 'usd')}
                            </p>
                            {isPending && (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                            {isPaid && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                            {isRejected && (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Payout Method ID: {withdrawal.payoutMethodId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Requested: {new Date(Number(withdrawal.createdAt) / 1_000_000).toLocaleString()}
                          </p>
                          {statusInfo && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {statusInfo.label}
                            </p>
                          )}
                        </div>
                        <div>
                          {isPending && (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                              Pending
                            </span>
                          )}
                          {isPaid && (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Paid
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
