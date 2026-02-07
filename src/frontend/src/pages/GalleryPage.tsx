import { useState } from 'react';
import { useArtworks } from '../hooks/useArtworks';
import ArtworkCard from '../components/gallery/ArtworkCard';
import GalleryFilters from '../components/gallery/GalleryFilters';
import { Loader2 } from 'lucide-react';

export default function GalleryPage() {
  const { data: artworks, isLoading } = useArtworks();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'recent'>('recent');

  // Filter and sort artworks
  const filteredAndSortedArtworks = artworks
    ? artworks
        .filter((artwork) => {
          if (selectedCategory === 'all') return true;
          // Since backend doesn't have categories yet, we'll show all for now
          return true;
        })
        .sort((a, b) => {
          if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
          if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
          return Number(b.createdAt) - Number(a.createdAt);
        })
    : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Gallery</h1>
        <p className="text-lg text-muted-foreground">
          Explore our curated collection of exceptional artworks
        </p>
      </div>

      <GalleryFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAndSortedArtworks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">No artworks found</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredAndSortedArtworks.map((artwork) => (
            <ArtworkCard key={Number(artwork.id)} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  );
}
