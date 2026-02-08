import { useState } from 'react';
import { useAdminGetUserKycRecords, useAdminUpdateKycStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Shield, Search, Loader2, ExternalLink, FileText, CheckCircle, XCircle, Clock, FileSignature } from 'lucide-react';
import AdminRouteGuard from '../../components/admin/AdminRouteGuard';
import { toast } from 'sonner';
import type { KycStatus } from '../../types/app-types';

function AdminKycReviewContent() {
  const [userPrincipal, setUserPrincipal] = useState('');
  const [searchedPrincipal, setSearchedPrincipal] = useState('');

  const getUserKycRecords = useAdminGetUserKycRecords();
  const updateKycStatus = useAdminUpdateKycStatus();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrincipal.trim()) {
      toast.error('Please enter a user Principal ID');
      return;
    }
    setSearchedPrincipal(userPrincipal.trim());
    try {
      await getUserKycRecords.mutateAsync(userPrincipal.trim());
    } catch (error: any) {
      toast.error(`Failed to fetch KYC records: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateStatus = async (recordId: string, statusKind: 'verified' | 'rejected') => {
    try {
      const newStatus: KycStatus = { __kind__: statusKind };
      await updateKycStatus.mutateAsync({
        recordId,
        status: newStatus,
      });
      toast.success(`KYC ${statusKind} successfully`);
      // Refetch records after update
      if (searchedPrincipal) {
        await getUserKycRecords.mutateAsync(searchedPrincipal);
      }
    } catch (error: any) {
      toast.error(`Failed to update KYC status: ${error.message || 'Unknown error'}`);
      console.error(error);
    }
  };

  const handleViewDocument = (documentUri: string) => {
    window.open(documentUri, '_blank', 'noopener,noreferrer');
  };

  const handleViewSignature = (signatureUri: string) => {
    window.open(signatureUri, '_blank', 'noopener,noreferrer');
  };

  const getStatusIcon = (status: KycStatus) => {
    switch (status.__kind__) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: KycStatus): 'default' | 'secondary' | 'destructive' => {
    switch (status.__kind__) {
      case 'verified':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const kycRecords = getUserKycRecords.data || [];
  const isLoading = getUserKycRecords.isPending;
  const error = getUserKycRecords.error;

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

          {!isLoading && !error && kycRecords.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No KYC records found for this user.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && kycRecords.length > 0 && (
            <div className="space-y-4">
              {kycRecords.map((record: any) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">KYC Record #{record.id}</CardTitle>
                        <CardDescription className="mt-1">
                          Submitted {new Date(Number(record.submittedAt) / 1_000_000).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(record.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(record.status)}
                          {record.status.__kind__}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Document Type</p>
                        <p className="text-sm">{record.documentType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">ID Number</p>
                        <p className="text-sm font-mono">{record.idNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">User Principal</p>
                        <p className="text-sm font-mono break-all">{record.user}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(record.documentUri)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Document
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                      {record.signatureUri && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSignature(record.signatureUri)}
                        >
                          <FileSignature className="mr-2 h-4 w-4" />
                          View Signature
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {record.status.__kind__ === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() => handleUpdateStatus(record.id, 'verified')}
                          disabled={updateKycStatus.isPending}
                        >
                          {updateKycStatus.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleUpdateStatus(record.id, 'rejected')}
                          disabled={updateKycStatus.isPending}
                        >
                          {updateKycStatus.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                          )}
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
