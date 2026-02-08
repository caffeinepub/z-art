import { useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface MyIdDialogProps {
  children?: React.ReactNode;
}

export default function MyIdDialog({ children }: MyIdDialogProps) {
  const { identity } = useInternetIdentity();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const principal = identity?.getPrincipal().toText();
  const isAuthenticated = !!identity;

  const handleCopy = async () => {
    if (!principal) return;

    try {
      await navigator.clipboard.writeText(principal);
      setCopied(true);
      toast.success('Principal copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy principal');
      console.error('Copy failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Info className="mr-2 h-4 w-4" />
            My ID
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>My Internet Identity</DialogTitle>
          <DialogDescription>
            {isAuthenticated
              ? 'Your unique principal identifier on the Internet Computer.'
              : 'Please log in to view your principal.'}
          </DialogDescription>
        </DialogHeader>
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Principal</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="principal"
                  value={principal || ''}
                  readOnly
                  className="font-mono text-xs overflow-x-auto"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy principal</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This is your unique identifier on the Internet Computer. You can share this with
              administrators to grant you access to specific features.
            </p>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              You must be logged in to view your principal identifier.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
