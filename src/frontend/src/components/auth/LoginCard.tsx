import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Loader2, Eye, EyeOff, Info, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';

export default function LoginCard() {
  const { login, loginStatus, loginError } = useInternetIdentity();
  const [showPassword, setShowPassword] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [customLoginError, setCustomLoginError] = useState<string | null>(null);

  const isLoggingIn = loginStatus === 'logging-in';
  const hasError = loginStatus === 'loginError';

  const handleContinue = async () => {
    setCustomLoginError(null);
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      setCustomLoginError(error.message || 'Failed to connect to Internet Identity. Please try again.');
    }
  };

  const handleSignUpClick = async () => {
    // Sign up also triggers Internet Identity login
    // Internet Identity handles account creation in its own UI
    setCustomLoginError(null);
    try {
      await login();
    } catch (error: any) {
      console.error('Sign up error:', error);
      setCustomLoginError(error.message || 'Failed to connect to Internet Identity. Please try again.');
    }
  };

  const handleForgotPasswordClick = () => {
    setShowInfoDialog(true);
  };

  const displayError = customLoginError || (hasError && loginError?.message);

  return (
    <>
      <div className="min-h-screen bg-[oklch(0.35_0.08_280)] flex flex-col">
        {/* Dark header area */}
        <div className="flex-1 min-h-[20vh]" />
        
        {/* White rounded sheet */}
        <div className="bg-background rounded-t-[2.5rem] px-6 pt-8 pb-12 flex-[2] shadow-2xl">
          <div className="max-w-md mx-auto space-y-6">
            {/* Title */}
            <h1 className="text-4xl font-bold text-foreground">Log in</h1>
            
            {/* Sign up row */}
            <div className="flex items-center gap-2 text-base">
              <span className="text-muted-foreground">Don't have an account?</span>
              <button
                onClick={handleSignUpClick}
                disabled={isLoggingIn}
                className="text-[oklch(0.65_0.15_220)] hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign up
              </button>
            </div>

            {/* Internet Identity info banner */}
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-muted">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                This app uses <strong>Internet Identity</strong> for secure authentication. 
                Click Continue or Sign up to proceed.
              </p>
            </div>

            {/* Error Alert */}
            {displayError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {displayError}
                </AlertDescription>
              </Alert>
            )}

            {/* Email input (non-functional, for visual consistency) */}
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                disabled
                className="h-14 rounded-2xl bg-muted/30 border-0 text-base placeholder:text-muted-foreground/60"
              />

              {/* Password input with visibility toggle */}
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  disabled
                  className="h-14 rounded-2xl bg-muted/30 border-0 text-base placeholder:text-muted-foreground/60 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Note about non-functional fields */}
            <p className="text-xs text-muted-foreground">
              Email and password fields are for display only. Authentication is handled by Internet Identity.
            </p>

            {/* Forgot password link */}
            <button
              onClick={handleForgotPasswordClick}
              className="text-[oklch(0.65_0.15_220)] hover:underline text-sm font-medium"
            >
              Forgot Password?
            </button>

            {/* Continue button */}
            <Button
              onClick={handleContinue}
              disabled={isLoggingIn}
              className="w-full h-14 rounded-full text-base font-medium bg-[oklch(0.75_0.12_220)] hover:bg-[oklch(0.70_0.12_220)] text-[oklch(0.40_0.08_280)] disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Continue'
              )}
            </Button>

            {/* Retry button for errors */}
            {displayError && !isLoggingIn && (
              <Button
                onClick={handleContinue}
                variant="outline"
                className="w-full h-12 rounded-full text-base font-medium"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Dialog for Forgot Password */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Account Recovery</DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                This application uses <strong>Internet Identity</strong> for secure, decentralized authentication.
              </p>
              <p>
                To recover your account or reset your credentials, visit Internet Identity directly. 
                Internet Identity provides secure recovery options for your account.
              </p>
              <p className="text-xs text-muted-foreground">
                Visit{' '}
                <a
                  href="https://identity.ic0.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  identity.ic0.app
                </a>
                {' '}to manage your Internet Identity account and recovery options.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowInfoDialog(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
