import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import CreateArtistProfileForm from '../components/artists/CreateArtistProfileForm';

export default function CreateArtistProfilePage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <span>Please log in to create your artist profile.</span>
            <Button onClick={login} disabled={isLoggingIn} size="sm" className="w-fit">
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Create Artist Profile</h1>
          <p className="text-muted-foreground">
            Set up your artist profile to start submitting artwork to Z'art
          </p>
        </div>
        <CreateArtistProfileForm
          onSuccess={() => {
            navigate({ to: '/submit' });
          }}
        />
      </div>
    </div>
  );
}
