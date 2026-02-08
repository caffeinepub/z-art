import { useState, useRef } from 'react';
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
import { minorUnitsToDecimal, parseGBPToMinorUnits } from '../../utils/gbpMoney';
import ArtworkImage from '../images/ArtworkImage';
import ArtworkLightbox from '../images/ArtworkLightbox';
import type { PublicArtwork } from '../../backend';

interface EditArtworkFormProps {
  artwork: PublicArtwork;
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
  const [imagePreview, setImagePreview] = useState<string | null>(artwork.imageUrl);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(artwork.imageUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          imageUrl: imagePreview || artwork.imageUrl,
          price,
        },
        {
          onSuccess: () => {
            onSuccess();
          },
          onError: (err) => {
            // Display backend trap messages in English (e.g., "Unauthorized: Only the original artist can edit this artwork")
            setError(err instanceof Error ? err.message : 'Failed to update artwork');
          },
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid price format');
    }
  };

  const handlePreviewClick = () => {
    setLightboxOpen(true);
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearImage();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Artwork</CardTitle>
          <CardDescription>Update the details of your artwork submission</CardDescription>
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
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (GBP) *</Label>
              <Input
                id="price"
                {...register('price', {
                  required: 'Price is required',
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: 'Please enter a valid price (e.g., 100 or 100.50)',
                  },
                })}
                placeholder="0.00"
                type="text"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Artwork Image</Label>
              {imagePreview && (
                <div className="relative w-full max-w-md mx-auto">
                  <div
                    className="aspect-square overflow-hidden rounded-lg border bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handlePreviewClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePreviewClick();
                      }
                    }}
                  >
                    <ArtworkImage
                      src={imagePreview}
                      alt="Artwork preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {imageFile && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleClearClick}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {imageFile ? 'Replace Image' : 'Change Image'}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                Upload a new image to replace the current one (max 5MB)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ArtworkLightbox
        src={imagePreview || ''}
        alt="Artwork preview"
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
}
