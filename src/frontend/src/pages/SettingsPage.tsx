import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Bell, BellOff, CheckCircle2, XCircle, Info, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? null;
  const { enabled, toggle } = useNotificationSettings(principal);
  const { permission, isSupported, requestPermission } = useNotificationPermission();

  const handleToggle = async (checked: boolean) => {
    if (checked && permission === 'default') {
      const result = await requestPermission();
      if (result === 'granted') {
        toggle(true);
      }
    } else {
      toggle(checked);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and notifications
        </p>
      </div>

      {/* Authentication Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Authentication & Data Storage</CardTitle>
          </div>
          <CardDescription>
            How your identity and data are managed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-muted/50 border-muted">
            <Info className="h-4 w-4" />
            <AlertTitle>Internet Identity Authentication</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                This application uses <strong>Internet Identity</strong> for secure, decentralized authentication. 
                Your identity is cryptographically secured and managed by the Internet Computer blockchain.
              </p>
              <p className="text-sm">
                <strong>What this means:</strong>
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>No Firebase or third-party authentication services</li>
                <li>No Google Sign-In or email/password authentication</li>
                <li>All data is stored on-canister (on-chain)</li>
                <li>Your identity is portable across Internet Computer apps</li>
                <li>Enhanced privacy and security through blockchain technology</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-base">
                Enable Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your gift cards and transactions
              </p>
            </div>
            <Switch
              id="notifications"
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={!isSupported || permission === 'denied'}
            />
          </div>

          {/* Browser Permission Status */}
          {isSupported && (
            <div className="pt-4 border-t">
              {permission === 'granted' && (
                <Alert className="bg-success/10 border-success/20">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertTitle className="text-success">Browser Notifications Enabled</AlertTitle>
                  <AlertDescription>
                    You will receive browser notifications when enabled above.
                  </AlertDescription>
                </Alert>
              )}

              {permission === 'denied' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Browser Notifications Blocked</AlertTitle>
                  <AlertDescription>
                    You have blocked notifications for this site. To enable them, please update your browser settings.
                  </AlertDescription>
                </Alert>
              )}

              {permission === 'default' && (
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle>Browser Permission Required</AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p>To receive browser notifications, you need to grant permission.</p>
                    <Button onClick={requestPermission} size="sm">
                      <Bell className="mr-2 h-4 w-4" />
                      Request Permission
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {!isSupported && (
            <Alert>
              <BellOff className="h-4 w-4" />
              <AlertTitle>Notifications Not Supported</AlertTitle>
              <AlertDescription>
                Your browser does not support notifications.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
