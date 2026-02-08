import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePurchaseInquiry } from '../../hooks/usePurchaseInquiry';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useAuthz';
import { useProfileSetup } from '../auth/ProfileSetupProvider';
import type { Artwork } from '../../backend';

interface PurchaseInquiryDialogProps {
  artwork: Artwork;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  buyerName: string;
  buyerEmail: string;
  message: string;
}

export default function PurchaseInquiryDialog({
  artwork,
  open,
  onOpenChange,
}: PurchaseInquiryDialogProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { openProfileSetup } = useProfileSetup();
  const { mutate: submitInquiry, isPending } = usePurchaseInquiry();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    // Final check before submission
    if (!isAuthenticated) {
      setError('Please log in to submit an inquiry');
      return;
    }

    if (!profileLoading && userProfile === null) {
      setError('Please complete your profile before submitting an inquiry');
      return;
    }

    setError(null);
    setSuccess(false);

    submitInquiry(
      {
        artworkId: artwork.id,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        message: data.message,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          reset();
          setTimeout(() => {
            onOpenChange(false);
            setSuccess(false);
          }, 2000);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to submit inquiry');
        },
      }
    );
  };

  const handleLoginClick = async () => {
    try {
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log in');
    }
  };

  const handleProfileSetupClick = () => {
    openProfileSetup();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Purchase Inquiry</DialogTitle>
          <DialogDescription>
            Interested in "{artwork.title}"? Send an inquiry to the artist.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Inquiry Sent!</p>
            <p className="text-sm text-muted-foreground">
              The artist will be in touch with you soon.
            </p>
          </div>
        ) : !isAuthenticated ? (
          <div className="py-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Please log in to submit a purchase inquiry.</span>
                <Button
                  onClick={handleLoginClick}
                  disabled={isLoggingIn}
                  size="sm"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Log In'
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : !profileLoading && userProfile === null ? (
          <div className="py-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Please complete your profile before submitting an inquiry.</span>
                <Button
                  onClick={handleProfileSetupClick}
                  size="sm"
                >
                  Complete Profile
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="buyerName">Your Name *</Label>
              <Input
                id="buyerName"
                {...register('buyerName', { required: 'Name is required' })}
                placeholder="John Doe"
                disabled={isPending || profileLoading}
              />
              {errors.buyerName && (
                <p className="text-sm text-destructive">{errors.buyerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerEmail">Your Email *</Label>
              <Input
                id="buyerEmail"
                type="email"
                {...register('buyerEmail', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                placeholder="john@example.com"
                disabled={isPending || profileLoading}
              />
              {errors.buyerEmail && (
                <p className="text-sm text-destructive">{errors.buyerEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                {...register('message')}
                placeholder="I'm interested in purchasing this artwork..."
                rows={4}
                disabled={isPending || profileLoading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || profileLoading} className="flex-1">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : profileLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Send Inquiry'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
