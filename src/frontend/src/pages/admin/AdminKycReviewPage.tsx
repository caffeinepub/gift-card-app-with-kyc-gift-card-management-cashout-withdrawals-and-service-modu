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

  const handleUpdateStatus = async (recordId: string, statusKind: 'verified' | 'rejected') => {
    try {
      const newStatus: KycStatus = { __kind__: statusKind };
      await updateKycStatus.mutateAsync({
        userPrincipal: searchedPrincipal,
        recordId,
        newStatus,
      });
      toast.success(`KYC ${statusKind} successfully`);
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
              {kycRecords.map((record: any) => (
                <Card key={record.recordId || record.idNumber}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {record.documentType}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          ID: {record.idNumber}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(record.status)} className="flex items-center gap-1">
                        {getStatusIcon(record.status)}
                        {record.status.__kind__.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Document Type</Label>
                        <p className="text-sm font-medium mt-1">{record.documentType}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">ID Number</Label>
                        <p className="text-sm font-mono mt-1">{record.idNumber}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDocument(record.documentUri)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Document
                      </Button>

                      {record.signatureUri && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleViewSignature(record.signatureUri)}
                        >
                          <FileSignature className="mr-2 h-4 w-4" />
                          View Signature
                        </Button>
                      )}
                    </div>

                    {record.status.__kind__ === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleUpdateStatus(record.recordId, 'verified')}
                          disabled={updateKycStatus.isPending}
                          className="flex-1"
                        >
                          {updateKycStatus.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(record.recordId, 'rejected')}
                          disabled={updateKycStatus.isPending}
                          variant="destructive"
                          className="flex-1"
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

                    {record.status.__kind__ !== 'pending' && (
                      <Alert className="bg-muted/50">
                        <AlertDescription className="text-sm">
                          This KYC record has already been processed and cannot be modified.
                        </AlertDescription>
                      </Alert>
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
