import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerArtistProfile } from '../hooks/useArtists';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import EditArtistProfileForm from '../components/artists/EditArtistProfileForm';

export default function EditArtistProfilePage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: artistProfile, isLoading: profileLoading, isFetched } = useGetCallerArtistProfile();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <span>Please log in to edit your artist profile.</span>
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

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isFetched && artistProfile === null) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <span>You don't have an artist profile yet. Please create one to start submitting artwork.</span>
            <Button onClick={() => navigate({ to: '/artist/profile/create' })} size="sm" className="w-fit">
              Create Artist Profile
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
          <h1 className="font-display text-4xl font-bold mb-2">Edit Artist Profile</h1>
          <p className="text-muted-foreground">
            Update your artist information and public display name
          </p>
        </div>
        <EditArtistProfileForm />
      </div>
    </div>
  );
}
