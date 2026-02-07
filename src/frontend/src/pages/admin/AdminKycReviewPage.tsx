import { useState } from 'react';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Shield, Search } from 'lucide-react';
import AdminRouteGuard from '../../components/admin/AdminRouteGuard';

function AdminKycReviewContent() {
  const [userPrincipal, setUserPrincipal] = useState('');

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
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">User Principal ID</Label>
              <Input
                id="principal"
                value={userPrincipal}
                onChange={(e) => setUserPrincipal(e.target.value)}
                placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              />
            </div>
            <Button type="submit" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Search User
            </Button>
          </form>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          Full KYC review functionality will be implemented in the next iteration with user search and approval/rejection actions.
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
