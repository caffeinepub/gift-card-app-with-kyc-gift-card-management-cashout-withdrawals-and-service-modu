import { useState } from 'react';
import { useGetWithdrawalRequests, useRequestWithdrawal, useGetPayoutMethods, useAddPayoutMethod } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Wallet, Plus, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import type { WithdrawalRequest } from '../../types/app-types';
import { Currency } from '../../types/app-types';

export default function WithdrawalsPage() {
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useGetWithdrawalRequests();
  const { data: payoutMethods = [], isLoading: methodsLoading } = useGetPayoutMethods();
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

    if (!amount || !selectedMethod) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const currencyObj: Currency = 
        currency === 'usd' ? { __kind__: 'usd', usd: null } :
        currency === 'kes' ? { __kind__: 'kes', kes: null } :
        currency === 'ngn' ? { __kind__: 'ngn', ngn: null } :
        currency === 'inr' ? { __kind__: 'inr', inr: null } :
        { __kind__: 'custom', custom: currency };

      await requestWithdrawal.mutateAsync({
        amount: BigInt(Math.floor(parseFloat(amount) * 100)),
        currency: currencyObj,
        payoutMethodId: selectedMethod,
      });

      toast.success('Withdrawal request submitted');
      setAmount('');
      setSelectedMethod('');
    } catch (error) {
      toast.error('Failed to submit withdrawal request');
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
    } catch (error) {
      toast.error('Failed to add payout method');
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
                Submit a new withdrawal request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100.00"
                      disabled={requestWithdrawal.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD</SelectItem>
                        <SelectItem value="kes">KES</SelectItem>
                        <SelectItem value="ngn">NGN</SelectItem>
                        <SelectItem value="inr">INR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Payout Method</Label>
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
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={requestWithdrawal.isPending || payoutMethods.length === 0}
                >
                  {requestWithdrawal.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>

                {payoutMethods.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please add a payout method first
                  </p>
                )}
              </form>
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
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                    disabled={addPayoutMethod.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Enter account holder name"
                    disabled={addPayoutMethod.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    disabled={addPayoutMethod.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={addPayoutMethod.isPending}
                >
                  {addPayoutMethod.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Method
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {methodsLoading ? (
            <Skeleton className="h-48" />
          ) : payoutMethods.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Payout Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payoutMethods.map((method) => (
                    <div
                      key={method.id}
                      className="p-4 border border-border rounded-lg"
                    >
                      <p className="font-semibold">{method.bankName}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.accountName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {method.accountNumber}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {withdrawalsLoading ? (
            <Skeleton className="h-96" />
          ) : withdrawals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No withdrawal history
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>
                  View all your withdrawal requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => {
                    const statusStr = getStatusString(withdrawal);
                    
                    return (
                      <div
                        key={withdrawal.id}
                        className="p-4 border border-border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-lg">
                              {formatCurrency(Number(withdrawal.amount) / 100, withdrawal.currency)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(Number(withdrawal.createdAt))}
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(statusStr)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(statusStr)}
                              {statusStr}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
