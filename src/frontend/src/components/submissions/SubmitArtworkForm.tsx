import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Upload, X, RefreshCw, Trash2 } from 'lucide-react';
import { useSubmitArtwork } from '../../hooks/useSubmitArtwork';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useAuthz';
import { useGetCallerArtistProfile } from '../../hooks/useArtists';
import { fileToDataUrl } from '../../utils/fileToDataUrl';
import { parseGBPToMinorUnits } from '../../utils/gbpMoney';
import { loadDraft, saveDraft, clearDraft } from '../../utils/submitArtworkDraft';
import ArtworkImage from '../images/ArtworkImage';
import CreateArtistProfileForm from '../artists/CreateArtistProfileForm';

interface SubmitArtworkFormProps {
  onSuccess: (submissionId: bigint) => void;
}

interface FormData {
  title: string;
  description: string;
  price: string;
}

export default function SubmitArtworkForm({ onSuccess }: SubmitArtworkFormProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: userProfileLoading, isFetched: userProfileFetched } = useGetCallerUserProfile();
  const { data: artistProfile, isLoading: artistProfileLoading, isFetched: artistProfileFetched } = useGetCallerArtistProfile();
  const { mutate: submitArtwork, isPending } = useSubmitArtwork();
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showArtistProfileForm, setShowArtistProfileForm] = useState(false);
  const [artistProfileCreated, setArtistProfileCreated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      price: '',
    },
  });

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      reset({
        title: draft.title,
        description: draft.description,
        price: draft.price,
      });
      setImagePreview(draft.imagePreview);
    }
  }, [reset]);

  // Watch form values and save draft
  const formValues = watch();
  useEffect(() => {
    saveDraft({
      title: formValues.title || '',
      description: formValues.description || '',
      price: formValues.price || '',
      imagePreview,
    });
  }, [formValues.title, formValues.description, formValues.price, imagePreview]);

  // Auto-exit artist profile form when profile becomes available
  useEffect(() => {
    if (artistProfileFetched && artistProfile !== null && showArtistProfileForm) {
      setShowArtistProfileForm(false);
      setArtistProfileCreated(true);
    }
  }, [artistProfile, artistProfileFetched, showArtistProfileForm]);

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
      setImagePreview(null);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const replaceImage = () => {
    fileInputRef.current?.click();
  };

  const handleDiscardDraft = () => {
    clearDraft();
    reset({
      title: '',
      description: '',
      price: '',
    });
    clearImage();
    setError(null);
  };

  const onSubmit = async (data: FormData) => {
    setError(null);

    if (!identity) {
      setError('Please log in to submit artwork');
      return;
    }

    if (!userProfile) {
      setError('Please complete your user profile first');
      return;
    }

    if (!artistProfile) {
      setError('Please create an artist profile first');
      return;
    }

    if (!imageFile && !imagePreview) {
      setError('Please select an image file');
      return;
    }

    try {
      const price = parseGBPToMinorUnits(data.price);

      submitArtwork(
        {
          title: data.title,
          description: data.description,
          imageUrl: imagePreview!,
          price,
        },
        {
          onSuccess: (result) => {
            onSuccess(result.submissionId);
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : 'Failed to submit artwork');
          },
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid price format');
    }
  };

  if (!identity) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in to submit artwork. Use the login button in the header.
        </AlertDescription>
      </Alert>
    );
  }

  // Wait for user profile check
  if (userProfileLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Block if no user profile
  if (userProfileFetched && userProfile === null) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please complete your user profile before submitting artwork. The profile setup will appear automatically.
        </AlertDescription>
      </Alert>
    );
  }

  // Wait for artist profile check
  if (artistProfileLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show artist profile creation if needed
  const needsArtistProfile = artistProfileFetched && artistProfile === null && !artistProfileCreated;

  if (needsArtistProfile && !showArtistProfileForm) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-3">
          <span>You need to create an artist profile before submitting artwork.</span>
          <Button onClick={() => setShowArtistProfileForm(true)} size="sm" className="w-fit">
            Create Artist Profile
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (showArtistProfileForm) {
    return (
      <CreateArtistProfileForm
        onSuccess={() => {
          // The useEffect will handle closing the form when profile is detected
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artwork Details</CardTitle>
        <CardDescription>
          Fill in the information about your artwork. All fields are required.
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
            <Label htmlFor="image">Artwork Image *</Label>
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
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
                    onClick={replaceImage}
                    disabled={isPending}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Replace Image
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearImage}
                    disabled={isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
                <p className="text-sm text-muted-foreground">
                  Max 5MB, JPG, PNG, or GIF
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
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Review'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDiscardDraft}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Discard Draft
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
