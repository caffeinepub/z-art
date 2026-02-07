import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useArtworkById } from '../hooks/useArtworks';
import { useMySubmissions } from '../hooks/useMySubmissions';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, User, Edit } from 'lucide-react';
import PurchaseInquiryDialog from '../components/inquiries/PurchaseInquiryDialog';
import ArtworkImage from '../components/images/ArtworkImage';
import ArtworkLightbox from '../components/images/ArtworkLightbox';
import { formatGBP } from '../utils/gbpMoney';

export default function ArtworkDetailsPage() {
  const { artworkId } = useParams({ from: '/artwork/$artworkId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: artwork, isLoading } = useArtworkById(BigInt(artworkId));
  const { data: mySubmissions } = useMySubmissions();
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Check if the current user owns this artwork
  const isOwner = identity && mySubmissions?.some(
    (submission) => submission.artwork.id === artwork?.id
  );

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
              <Button
                onClick={() => navigate({ to: '/artwork/$artworkId/edit', params: { artworkId: String(artwork.id) } })}
                className="flex-1"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Artwork
              </Button>
            ) : (
              <Button onClick={() => setInquiryDialogOpen(true)} className="flex-1">
                Inquire to Purchase
              </Button>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}
