import { useState, useEffect, useRef } from 'react';
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
    reset,
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
            setError(err instanceof Error ? err.message : 'Failed to update artwork');
          },
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid price format');
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
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
          <CardDescription>
            Update the details of your artwork. All fields are required.
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
              <Label htmlFor="price">Price (GBP) *</Label>
              <Input
                id="price"
                {...register('price', { required: 'Price is required' })}
                placeholder="e.g., 150.00"
                disabled={isPending}
              />
              <p className="text-sm text-muted-foreground">
                Enter the price in pounds (e.g., 150.00 for £150)
              </p>
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Artwork Image</Label>
              {imagePreview ? (
                <div className="space-y-3">
                  <div 
                    className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer"
                    onClick={handlePreviewClick}
                  >
                    <ArtworkImage
                      src={imagePreview}
                      alt="Artwork preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isPending}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change Image
                    </Button>
                    {imageFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearClick}
                        disabled={isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Revert to Original
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                  >
                    Select Image
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isPending}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {imagePreview && (
        <ArtworkLightbox
          src={imagePreview}
          alt="Artwork preview"
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}
    </>
  );
}
