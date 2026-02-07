import { useParams, useNavigate } from '@tanstack/react-router';
import { useArtistById } from '../hooks/useArtists';
import { useArtworks } from '../hooks/useArtworks';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import ArtworkCard from '../components/gallery/ArtworkCard';

export default function ArtistProfilePage() {
  const { artistId } = useParams({ from: '/artist/$artistId' });
  const navigate = useNavigate();
  const { data: artist, isLoading: artistLoading } = useArtistById(BigInt(artistId));
  const { data: allArtworks } = useArtworks();

  // Filter artworks by this artist
  const artistArtworks = allArtworks?.filter(
    (artwork) => Number(artwork.artist.id) === Number(artistId)
  );

  if (artistLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artist not found</h1>
          <Button onClick={() => navigate({ to: '/artists' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Artists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/artists' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Artists
      </Button>

      <div className="max-w-4xl mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{artist.name}</h1>
        <p className="text-lg text-muted-foreground mb-6">{artist.bio}</p>
        {artist.website && artist.website.trim() && (
          <a
            href={artist.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Visit Website <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      <div className="mb-6">
        <h2 className="font-display text-3xl font-bold mb-4">Artworks</h2>
      </div>

      {artistArtworks && artistArtworks.length > 0 ? (
        <div className="gallery-grid">
          {artistArtworks.map((artwork) => (
            <ArtworkCard key={Number(artwork.id)} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No artworks available yet</p>
        </div>
      )}
    </div>
  );
}
