import { useParams, useNavigate } from '@tanstack/react-router';
import { useArtworkById } from '../hooks/useArtworks';
import { useMySubmissions } from '../hooks/useMySubmissions';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import EditArtworkForm from '../components/artworks/EditArtworkForm';

export default function EditArtworkPage() {
  const { artworkId } = useParams({ from: '/artwork/$artworkId/edit' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: artwork, isLoading: artworkLoading } = useArtworkById(BigInt(artworkId));
  const { data: mySubmissions, isLoading: submissionsLoading } = useMySubmissions();

  const isLoading = artworkLoading || submissionsLoading;

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to edit artwork. Use the login button in the header.
          </AlertDescription>
        </Alert>
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/gallery' })}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gallery
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Artwork not found.</AlertDescription>
        </Alert>
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/gallery' })}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gallery
        </Button>
      </div>
    );
  }

  // Check if the current user owns this artwork
  const isOwner = mySubmissions?.some(
    (submission) => submission.artwork.id === artwork.id
  );

  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are not authorized to edit this artwork. Only the original artist can make changes.
          </AlertDescription>
        </Alert>
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/artwork/$artworkId', params: { artworkId } })}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Artwork
        </Button>
      </div>
    );
  }

  const handleSuccess = () => {
    navigate({ to: '/artwork/$artworkId', params: { artworkId } });
  };

  const handleCancel = () => {
    navigate({ to: '/artwork/$artworkId', params: { artworkId } });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/artwork/$artworkId', params: { artworkId } })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Artwork
      </Button>

      <EditArtworkForm
        artwork={artwork}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
