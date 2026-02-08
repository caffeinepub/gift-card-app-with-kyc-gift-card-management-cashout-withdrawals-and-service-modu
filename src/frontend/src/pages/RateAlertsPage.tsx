import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { ArrowLeft, Bell, BellOff, Trash2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getRateAlerts, createRateAlert, toggleRateAlert, deleteRateAlert, RateAlert } from '../state/rateAlertsStorage';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import { useNotificationSettings } from '../hooks/useNotificationSettings';

const ASSETS = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'USDT', label: 'Tether (USDT)' },
  { value: 'BNB', label: 'Binance Coin (BNB)' },
];

const BRANDS = [
  { value: 'Amazon', label: 'Amazon' },
  { value: 'Apple iTunes', label: 'Apple iTunes' },
  { value: 'Steam', label: 'Steam' },
  { value: 'Google Play', label: 'Google Play' },
];

export default function RateAlertsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() || null;
  
  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [assetOrBrand, setAssetOrBrand] = useState('');
  const [threshold, setThreshold] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [type, setType] = useState<'crypto' | 'giftcard'>('crypto');

  const { isSupported, permission, requestPermission } = useNotificationPermission();
  const { enabled: notificationsEnabled } = useNotificationSettings(principal);

  useEffect(() => {
    if (principal) {
      setAlerts(getRateAlerts(principal));
    }
  }, [principal]);

  const handleCreate = () => {
    if (!principal) {
      toast.error('You must be logged in to create alerts');
      return;
    }

    if (!assetOrBrand || !threshold) {
      toast.error('Please fill in all fields');
      return;
    }

    const thresholdNum = parseFloat(threshold);
    if (isNaN(thresholdNum) || thresholdNum <= 0) {
      toast.error('Please enter a valid threshold');
      return;
    }

    const newAlert = createRateAlert(principal, {
      assetOrBrand,
      threshold: thresholdNum,
      direction,
      type,
    });

    setAlerts(getRateAlerts(principal));
    setAssetOrBrand('');
    setThreshold('');
    toast.success('Rate alert created successfully');
  };

  const handleToggle = (alertId: string) => {
    if (!principal) return;
    toggleRateAlert(principal, alertId);
    setAlerts(getRateAlerts(principal));
  };

  const handleDelete = (alertId: string) => {
    if (!principal) return;
    deleteRateAlert(principal, alertId);
    setAlerts(getRateAlerts(principal));
    toast.success('Alert deleted');
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      toast.success('Browser notifications enabled');
    } else if (result === 'denied') {
      toast.error('Browser notifications blocked. You can still receive in-app alerts.');
    }
  };

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
          <h1 className="text-2xl font-bold">Rate Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Get notified when rates reach your target
          </p>
        </div>
      </div>

      {!isSupported && (
        <Alert>
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Browser Notifications Not Supported</AlertTitle>
          <AlertDescription>
            Your browser doesn't support notifications, but you'll still receive in-app alerts.
          </AlertDescription>
        </Alert>
      )}

      {isSupported && permission === 'default' && (
        <Alert>
          <Bell className="h-5 w-5" />
          <AlertTitle>Enable Browser Notifications</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Allow browser notifications to receive alerts even when the app is in the background.</span>
            <Button variant="outline" size="sm" onClick={handleRequestPermission}>
              Enable
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isSupported && permission === 'denied' && (
        <Alert>
          <BellOff className="h-5 w-5" />
          <AlertTitle>Browser Notifications Blocked</AlertTitle>
          <AlertDescription>
            You've blocked browser notifications. You'll still receive in-app alerts. To enable browser notifications, update your browser settings.
          </AlertDescription>
        </Alert>
      )}

      {!notificationsEnabled && (
        <Alert>
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>In-App Notifications Disabled</AlertTitle>
          <AlertDescription>
            In-app notifications are currently disabled. Enable them in Settings to receive alerts.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Alert</CardTitle>
          <CardDescription>
            Set a target rate and get notified when it's reached
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Alert Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'crypto' | 'giftcard')}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crypto">Crypto Asset</SelectItem>
                <SelectItem value="giftcard">Gift Card Brand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset">{type === 'crypto' ? 'Asset' : 'Brand'}</Label>
            <Select value={assetOrBrand} onValueChange={setAssetOrBrand}>
              <SelectTrigger id="asset">
                <SelectValue placeholder={`Select ${type === 'crypto' ? 'asset' : 'brand'}`} />
              </SelectTrigger>
              <SelectContent>
                {(type === 'crypto' ? ASSETS : BRANDS).map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Target Rate (USD)</Label>
            <Input
              id="threshold"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select value={direction} onValueChange={(v) => setDirection(v as 'above' | 'below')}>
              <SelectTrigger id="direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Above Target</SelectItem>
                <SelectItem value="below">Below Target</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCreate} className="w-full">
            Create Alert
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No alerts configured yet
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {alert.direction === 'above' ? (
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <div>
                      <p className="font-medium">
                        {alert.assetOrBrand} {alert.direction === 'above' ? '>' : '<'} ${alert.threshold.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {alert.type === 'crypto' ? 'Crypto' : 'Gift Card'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.enabled}
                      onCheckedChange={() => handleToggle(alert.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
