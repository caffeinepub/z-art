import { useArtists } from '../hooks/useArtists';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, ExternalLink } from 'lucide-react';

export default function ArtistsPage() {
  const { data: artists, isLoading } = useArtists();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Artists</h1>
        <p className="text-lg text-muted-foreground">
          Meet the talented creators behind our collection
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : artists && artists.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">No artists found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists?.map((artist) => (
            <Card key={Number(artist.id)} className="hover:shadow-gallery transition-shadow">
              <CardHeader>
                <CardTitle className="font-display text-2xl">{artist.name}</CardTitle>
                <CardDescription className="line-clamp-2">{artist.bio}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {artist.website && artist.website.trim() && (
                  <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Visit Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate({ to: '/artist/$artistId', params: { artistId: String(artist.id) } })}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
