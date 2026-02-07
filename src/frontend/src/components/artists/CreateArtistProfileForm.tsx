import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCreateArtistProfile } from '../../hooks/useArtists';

interface CreateArtistProfileFormProps {
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  bio: string;
  website: string;
}

export default function CreateArtistProfileForm({ onSuccess }: CreateArtistProfileFormProps) {
  const { mutate: createProfile, isPending } = useCreateArtistProfile();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    setError(null);
    setSuccess(false);

    createProfile(
      {
        name: data.name.trim(),
        bio: data.bio.trim(),
        website: data.website.trim(),
      },
      {
        onSuccess: () => {
          setSuccess(true);
          if (onSuccess) {
            setTimeout(() => {
              onSuccess();
            }, 1000);
          }
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to create artist profile');
        },
      }
    );
  };

  if (success) {
    return (
      <Alert className="border-primary bg-primary/5">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertDescription>
          Artist profile created successfully! You can now submit artwork.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Artist Profile</CardTitle>
        <CardDescription>
          Set up your artist profile to start submitting artwork to Z'art.
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
            <Label htmlFor="name">Artist Name *</Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Artist name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Name must be less than 100 characters' },
              })}
              placeholder="Enter your artist name"
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              {...register('bio', {
                required: 'Bio is required',
                minLength: { value: 10, message: 'Bio must be at least 10 characters' },
                maxLength: { value: 500, message: 'Bio must be less than 500 characters' },
              })}
              placeholder="Tell us about yourself and your art"
              rows={4}
              disabled={isPending}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {errors.bio ? '' : 'Minimum 10 characters'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register('website', {
                validate: (value) => {
                  const trimmed = value.trim();
                  if (!trimmed) return true;
                  return /^https?:\/\/.+\..+/.test(trimmed) || 'Please enter a valid URL (e.g., https://example.com)';
                },
              })}
              placeholder="https://yourwebsite.com"
              disabled={isPending}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Your portfolio or social media profile (optional)
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Artist Profile'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
