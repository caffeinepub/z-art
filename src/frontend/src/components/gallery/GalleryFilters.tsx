import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface GalleryFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: 'price-asc' | 'price-desc' | 'recent';
  onSortChange: (sort: 'price-asc' | 'price-desc' | 'recent') => void;
}

export default function GalleryFilters({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: GalleryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
      <div className="flex-1">
        <Label htmlFor="category" className="mb-2 block text-sm font-medium">
          Category
        </Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="painting">Painting</SelectItem>
            <SelectItem value="sculpture">Sculpture</SelectItem>
            <SelectItem value="photography">Photography</SelectItem>
            <SelectItem value="digital">Digital Art</SelectItem>
            <SelectItem value="mixed">Mixed Media</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label htmlFor="sort" className="mb-2 block text-sm font-medium">
          Sort By
        </Label>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as any)}>
          <SelectTrigger id="sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

