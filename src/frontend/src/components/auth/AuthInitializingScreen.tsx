import { Loader2 } from 'lucide-react';

/**
 * Loading screen shown while Internet Identity is initializing.
 * Prevents flashing the logged-out UI before auth state is known.
 */
export default function AuthInitializingScreen() {
  return (
    <div className="min-h-screen bg-[oklch(0.35_0.08_280)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-[oklch(0.75_0.12_220)] mx-auto" />
        <p className="text-lg text-[oklch(0.85_0.05_280)] font-medium">
          Initializing authentication...
        </p>
      </div>
    </div>
  );
}
