import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Info } from 'lucide-react';

export default function LoginCard() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/assets/generated/app-logo.dim_512x512.png" 
              alt="GiftVault Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">GiftVault</CardTitle>
            <CardDescription className="text-base mt-2">
              Secure gift card management powered by the Internet Computer
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              'Sign in with Internet Identity'
            )}
          </Button>

          <Alert className="bg-muted/50 border-muted">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This app uses <strong>Internet Identity</strong> for secure, decentralized authentication. 
              Your data is stored on-chain on the Internet Computer blockchain.
            </AlertDescription>
          </Alert>

          <div className="text-center text-xs text-muted-foreground pt-2">
            <p>No Firebase, Google Sign-In, or email/password authentication.</p>
            <p className="mt-1">All data is stored on-canister with Internet Identity.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
