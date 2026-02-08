import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetWithdrawalRequests, useRequestWithdrawal, useGetPayoutMethods, useAddPayoutMethod, useIsCallerKycVerified } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Wallet, Plus, Loader2, Clock, CheckCircle, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import type { WithdrawalRequest } from '../../types/app-types';
import { Currency } from '../../types/app-types';
import NigerianBankSelect from '../../components/payout/NigerianBankSelect';

export default function WithdrawalsPage() {
  const navigate = useNavigate();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useGetWithdrawalRequests();
  const { data: payoutMethods = [], isLoading: methodsLoading } = useGetPayoutMethods();
  const { data: isKycVerified = false, isLoading: kycLoading } = useIsCallerKycVerified();
  const requestWithdrawal = useRequestWithdrawal();
  const addPayoutMethod = useAddPayoutMethod();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<string>('usd');
  const [selectedMethod, setSelectedMethod] = useState('');

  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Defensive check - should not be reachable if UI is properly gated
    if (!isKycVerified) {
      toast.error('KYC verification required before withdrawals');
      return;
    }

    if (!amount || !selectedMethod) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await requestWithdrawal.mutateAsync({
        amount: BigInt(Math.floor(parseFloat(amount) * 100)),
        payoutMethodId: selectedMethod,
      });

      toast.success('Withdrawal request submitted');
      setAmount('');
      setSelectedMethod('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to submit withdrawal request';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleAddPayoutMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankName || !accountName || !accountNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addPayoutMethod.mutateAsync({
        bankName,
        accountName,
        accountNumber,
      });

      toast.success('Payout method added');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add payout method';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const getStatusString = (withdrawal: WithdrawalRequest): string => {
    const status = withdrawal.status as any;
    if (typeof status === 'object' && status !== null && '__kind__' in status) {
      return status.__kind__;
    }
    return String(status);
  };

  const getStatusIcon = (statusStr: string) => {
    switch (statusStr) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (statusStr: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (statusStr) {
      case 'pending':
        return 'secondary';
      case 'paid':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatAmount = (amount: bigint): string => {
    return `$${(Number(amount) / 100).toFixed(2)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Wallet className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Withdrawals</h1>
          <p className="text-muted-foreground mt-1">
            Request withdrawals and manage payout methods
          </p>
        </div>
      </div>

      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="methods">Payout Methods</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>
                Submit a new withdrawal request to your bank account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {kycLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !isKycVerified ? (
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>KYC Verification Required</AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p>
                      You must complete KYC verification before you can request withdrawals.
                      This helps us ensure the security of your account and comply with financial regulations.
                    </p>
                    <Button
                      onClick={() => navigate({ to: '/kyc' })}
                      className="w-full sm:w-auto"
                    >
                      Complete KYC Verification
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD - US Dollar</SelectItem>
                        <SelectItem value="ngn">NGN - Nigerian Naira</SelectItem>
                        <SelectItem value="kes">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method">Payout Method</Label>
                    {methodsLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : payoutMethods.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No payout methods available. Add one in the Payout Methods tab.
                      </p>
                    ) : (
                      <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                        <SelectTrigger id="method">
                          <SelectValue placeholder="Select payout method" />
                        </SelectTrigger>
                        <SelectContent>
                          {payoutMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.bankName} - {method.accountNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={requestWithdrawal.isPending || payoutMethods.length === 0}
                  >
                    {requestWithdrawal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Payout Method</CardTitle>
              <CardDescription>
                Add a new bank account for withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPayoutMethod} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <NigerianBankSelect
                    value={bankName}
                    onValueChange={setBankName}
                    disabled={addPayoutMethod.isPending}
                    placeholder="Select your bank"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={addPayoutMethod.isPending}
                >
                  {addPayoutMethod.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payout Method
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Payout Methods</CardTitle>
              <CardDescription>
                Manage your saved bank accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {methodsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : payoutMethods.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No payout methods yet. Add one above to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {payoutMethods.map((method) => (
                    <div
                      key={method.id}
                      className="border rounded-lg p-4 space-y-1"
                    >
                      <p className="font-medium">{method.bankName}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.accountName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {method.accountNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDate(Number(method.createdAt) / 1_000_000)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
              {withdrawalsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : withdrawals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No withdrawal requests yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((withdrawal) => {
                    const statusStr = getStatusString(withdrawal);
                    return (
                      <div
                        key={withdrawal.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-lg">
                            {formatAmount(withdrawal.amount)}
                          </p>
                          <Badge variant={getStatusVariant(statusStr)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(statusStr)}
                              {statusStr}
                            </span>
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Payout Method ID: {withdrawal.payoutMethodId}</p>
                          <p>Requested: {formatDate(Number(withdrawal.createdAt) / 1_000_000)}</p>
                          {withdrawal.processedAt && (
                            <p>Processed: {formatDate(Number(withdrawal.processedAt) / 1_000_000)}</p>
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
