import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useArtworkById } from '../hooks/useArtworks';
import { useMySubmissions } from '../hooks/useMySubmissions';
import { useDeleteArtwork } from '../hooks/useDeleteArtwork';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useAuthz';
import { useProfileSetup } from '../components/auth/ProfileSetupProvider';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Loader2, User, Edit, Trash2 } from 'lucide-react';
import PurchaseInquiryDialog from '../components/inquiries/PurchaseInquiryDialog';
import ArtworkImage from '../components/images/ArtworkImage';
import ArtworkLightbox from '../components/images/ArtworkLightbox';
import { formatGBP } from '../utils/gbpMoney';
import { toast } from 'sonner';

export default function ArtworkDetailsPage() {
  const { artworkId } = useParams({ from: '/artwork/$artworkId' });
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: artwork, isLoading } = useArtworkById(BigInt(artworkId));
  const { data: mySubmissions } = useMySubmissions();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { openProfileSetup } = useProfileSetup();
  const deleteArtwork = useDeleteArtwork();
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Check if the current user owns this artwork
  const isOwner = identity && mySubmissions?.some(
    (submission) => submission.artwork.id === artwork?.id
  );

  const handleDelete = async () => {
    if (!artwork) return;

    try {
      await deleteArtwork.mutateAsync(artwork.id);
      toast.success('Artwork deleted successfully');
      navigate({ to: '/gallery' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete artwork');
      setDeleteDialogOpen(false);
    }
  };

  const handleInquiryClick = () => {
    // Check authentication first
    if (!isAuthenticated) {
      toast.error('Please log in to submit a purchase inquiry');
      return;
    }

    // Check profile completion
    if (!profileLoading && userProfile === null) {
      toast.error('Please complete your profile before submitting an inquiry');
      openProfileSetup();
      return;
    }

    // Open inquiry dialog
    setInquiryDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artwork Not Found</h1>
          <Button onClick={() => navigate({ to: '/gallery' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/gallery' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gallery
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
          <ArtworkImage
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full h-full object-cover"
            aspectClassName="aspect-square"
            onClick={() => setLightboxOpen(true)}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">{artwork.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <User className="h-4 w-4" />
              <button
                onClick={() => navigate({ to: '/artist/$artistId', params: { artistId: String(artwork.artist.id) } })}
                className="hover:text-primary transition-colors"
              >
                {artwork.artist.name}
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Description</h2>
            <p className="text-lg leading-relaxed">{artwork.description}</p>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Price</h2>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-primary">{formatGBP(artwork.price)}</p>
              <span className="text-sm text-muted-foreground">GBP</span>
            </div>
          </div>

          <div className="flex gap-3 mt-auto pt-6">
            {isOwner ? (
              <>
                <Button
                  onClick={() => navigate({ to: '/artwork/$artworkId/edit', params: { artworkId: String(artwork.id) } })}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Artwork
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={deleteArtwork.isPending}
                  className="flex-1"
                >
                  {deleteArtwork.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleInquiryClick}
                disabled={isLoggingIn || profileLoading}
                className="w-full"
              >
                {isLoggingIn || profileLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Inquire About Purchase'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {artwork && (
        <>
          <PurchaseInquiryDialog
            artwork={artwork}
            open={inquiryDialogOpen}
            onOpenChange={setInquiryDialogOpen}
          />
          <ArtworkLightbox
            src={artwork.imageUrl}
            alt={artwork.title}
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
          />
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{artwork.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
