import { useState } from 'react';
import { useCreateUserProfile } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileSetupModal({ open, onOpenChange }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const createProfile = useCreateUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      const now = BigInt(Date.now() * 1000000);
      await createProfile.mutateAsync({
        id: `user-${Date.now()}`,
        email: null,
        name: name.trim(),
        username: name.trim().toLowerCase().replace(/\s+/g, ''),
        avatar: {
          url: null,
          publicId: null,
          imgData: null,
          auto: true,
          style: null,
        },
        country: 'US',
        wallets: null,
        isPremium: false,
        createdAt: now,
        updatedAt1: null,
      });
      toast.success('Profile created successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create profile');
      console.error(error);
    }
  };

  const handleNotNow = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleNotNow}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogHeader>
          <DialogTitle>Welcome to GiftVault</DialogTitle>
          <DialogDescription>
            Let's set up your profile to get started
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={createProfile.isPending}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleNotNow}
              disabled={createProfile.isPending}
            >
              Not now
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createProfile.isPending}
            >
              {createProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
