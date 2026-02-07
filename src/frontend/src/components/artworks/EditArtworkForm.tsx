import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Upload, X } from 'lucide-react';
import { useEditArtwork } from '../../hooks/useEditArtwork';
import { fileToDataUrl } from '../../utils/fileToDataUrl';
import { parseGBPToMinorUnits, minorUnitsToDecimal } from '../../utils/gbpMoney';
import ArtworkImage from '../images/ArtworkImage';
import ArtworkLightbox from '../images/ArtworkLightbox';
import type { Artwork } from '../../backend';

interface EditArtworkFormProps {
  artwork: Artwork;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  description: string;
  price: string;
}

export default function EditArtworkForm({ artwork, onSuccess, onCancel }: EditArtworkFormProps) {
  const { mutate: editArtwork, isPending } = useEditArtwork();
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(artwork.imageUrl);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: artwork.title,
      description: artwork.description,
      price: minorUnitsToDecimal(artwork.price),
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setImageFile(file);
      setImagePreview(dataUrl);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image');
      setImageFile(null);
    }
  };

  const clearNewImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(artwork.imageUrl);
  };

  const onSubmit = async (data: FormData) => {
    setError(null);

    try {
      const price = parseGBPToMinorUnits(data.price);

      editArtwork(
        {
          artworkId: artwork.id,
          title: data.title,
          description: data.description,
          imageUrl: imagePreview,
          price,
        },
        {
          onSuccess: () => {
            onSuccess();
          },
          onError: (err) => {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update artwork';
            if (errorMessage.includes('Unauthorized') || errorMessage.includes('original artist')) {
              setError('You are not authorized to edit this artwork. Only the original artist can make changes.');
            } else {
              setError(errorMessage);
            }
          },
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid price format');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Artwork</CardTitle>
          <CardDescription>
            Update the information about your artwork. You can optionally replace the image.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter artwork title"
                disabled={isPending}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register('description', { required: 'Description is required' })}
                placeholder="Describe your artwork"
                rows={4}
                disabled={isPending}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Artwork Image</Label>
              <div className="relative">
                <ArtworkImage
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border"
                  aspectClassName="h-64"
                  onClick={() => setLightboxOpen(true)}
                />
                {imageFile && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={clearNewImage}
                    disabled={isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label
                  htmlFor="image"
                  className="cursor-pointer text-sm text-muted-foreground hover:text-primary"
                >
                  Click to upload a new image (optional)
                  <br />
                  <span className="text-xs">PNG, JPG, GIF up to 5MB</span>
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isPending}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave unchanged to keep the current image, or upload a new one to replace it
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (GBP) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' },
                })}
                placeholder="0.00"
                disabled={isPending}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Artwork'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ArtworkLightbox
        src={imagePreview}
        alt="Preview"
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
}
