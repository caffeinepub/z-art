import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { formatGBP } from '../../utils/gbpMoney';
import SoldArtworkImage from '../artworks/SoldArtworkImage';
import ArtworkLightbox from '../images/ArtworkLightbox';
import type { PublicArtwork } from '../../backend';

interface ArtworkCardProps {
  artwork: PublicArtwork;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleCardClick = () => {
    navigate({ to: '/artwork/$artworkId', params: { artworkId: String(artwork.id) } });
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxOpen(true);
  };

  const artistName = artwork.artist?.publicSiteUsername?.trim() || 'Unknown artist';

  return (
    <>
      <Card
        className="overflow-hidden cursor-pointer artwork-card-hover"
        onClick={handleCardClick}
      >
        <div className="aspect-square overflow-hidden bg-muted" onClick={handleImageClick}>
          <SoldArtworkImage
            src={artwork.imageUrl}
            alt={artwork.title}
            sold={artwork.sold}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            aspectClassName="aspect-square"
            watermarkSize="md"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-display text-xl font-semibold mb-1 line-clamp-1">{artwork.title}</h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{artistName}</p>
          <p className="text-lg font-semibold text-primary">
            {formatGBP(artwork.price)}
          </p>
        </CardContent>
      </Card>

      <ArtworkLightbox
        src={artwork.imageUrl}
        alt={artwork.title}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        sold={artwork.sold}
      />
    </>
  );
}
