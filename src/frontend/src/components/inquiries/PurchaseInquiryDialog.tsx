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
  const { mutate: submitInquiry, isPending } = usePurchaseInquiry();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
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
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
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

