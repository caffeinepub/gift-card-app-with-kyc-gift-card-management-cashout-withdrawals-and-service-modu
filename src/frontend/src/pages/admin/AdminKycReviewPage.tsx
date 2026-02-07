import { useState } from 'react';
import { useAdminGetUserKycRecords, useAdminUpdateKycStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Shield, Search, Loader2, Info } from 'lucide-react';
import AdminRouteGuard from '../../components/admin/AdminRouteGuard';
import { toast } from 'sonner';
import type { KycStatus } from '../../types/app-types';

function AdminKycReviewContent() {
  const [userPrincipal, setUserPrincipal] = useState('');
  const [searchedPrincipal, setSearchedPrincipal] = useState('');

  const { data: kycRecords, isLoading, error } = useAdminGetUserKycRecords(searchedPrincipal);
  const updateKycStatus = useAdminUpdateKycStatus();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrincipal.trim()) {
      toast.error('Please enter a user Principal ID');
      return;
    }
    setSearchedPrincipal(userPrincipal.trim());
  };

  const handleUpdateStatus = async (idNumber: string, statusKind: 'verified' | 'rejected') => {
    try {
      const newStatus: KycStatus = { __kind__: statusKind };
      await updateKycStatus.mutateAsync({
        userPrincipal: searchedPrincipal,
        idNumber,
        newStatus,
      });
      toast.success(`KYC ${statusKind} successfully`);
    } catch (error: any) {
      if (error.message === 'Backend method not implemented') {
        toast.error('KYC management is not yet implemented in the backend');
      } else {
        toast.error(`Failed to update KYC status`);
      }
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">KYC Review</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve user KYC submissions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search User</CardTitle>
          <CardDescription>
            Enter a user's Principal ID to review their KYC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">User Principal ID</Label>
              <Input
                id="principal"
                value={userPrincipal}
                onChange={(e) => setUserPrincipal(e.target.value)}
                placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search User
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchedPrincipal && (
        <>
          {isLoading && (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Loading KYC records...</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load KYC records. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && kycRecords && kycRecords.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No KYC records found for this user.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && kycRecords && kycRecords.length > 0 && (
            <div className="space-y-4">
              {kycRecords.map((record) => (
                <Card key={record.idNumber}>
                  <CardHeader>
                    <CardTitle className="text-lg">KYC Record</CardTitle>
                    <CardDescription>
                      Document Type: {record.documentType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>ID Number</Label>
                      <p className="text-sm font-mono mt-1">{record.idNumber}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <p className="text-sm mt-1 capitalize">{record.status.__kind__}</p>
                    </div>
                    {record.status.__kind__ === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateStatus(record.idNumber, 'verified')}
                          disabled={updateKycStatus.isPending}
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(record.idNumber, 'rejected')}
                          disabled={updateKycStatus.isPending}
                          variant="destructive"
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Alert className="bg-muted/50 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> KYC management functionality is currently not implemented in the backend. 
          This interface is ready for when the backend KYC methods are added.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default function AdminKycReviewPage() {
  return (
    <AdminRouteGuard>
      <AdminKycReviewContent />
    </AdminRouteGuard>
  );
}
