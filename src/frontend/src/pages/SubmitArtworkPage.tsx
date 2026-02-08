import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import SubmitArtworkForm from '../components/submissions/SubmitArtworkForm';
import SubmissionConfirmation from '../components/submissions/SubmissionConfirmation';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useAuthz';
import { useProfileSetup } from '../components/auth/ProfileSetupProvider';
import { clearDraft } from '../utils/submitArtworkDraft';

export default function SubmitArtworkPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { openProfileSetup } = useProfileSetup();
  const [submissionId, setSubmissionId] = useState<bigint | null>(null);

  const handleSuccess = (id: bigint) => {
    clearDraft();
    setSubmissionId(id);
  };

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Show loading while checking profile
  if (isAuthenticated && profileLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Block submission if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Please log in to submit artwork.</span>
              <Button
                onClick={() => login()}
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
      </div>
    );
  }

  // Block submission if authenticated but no user profile
  if (isAuthenticated && isFetched && userProfile === null) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Please complete your profile before submitting artwork.</span>
              <Button
                onClick={() => openProfileSetup()}
                size="sm"
              >
                Complete Profile
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (submissionId !== null) {
    return <SubmissionConfirmation submissionId={submissionId} />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Submit Artwork</h1>
          <p className="text-lg text-muted-foreground">
            Share your creative work with our community. All submissions are reviewed before being added to the gallery.
          </p>
        </div>

        <SubmitArtworkForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
