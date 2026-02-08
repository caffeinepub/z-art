import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useGetCallerArtistProfile, useUpdateArtistProfile } from '../../hooks/useArtists';

interface FormData {
  publicSiteUsername: string;
  profileName: string;
  bio: string;
  website: string;
}

export default function EditArtistProfileForm() {
  const { data: artistProfile, isLoading: profileLoading } = useGetCallerArtistProfile();
  const { mutate: updateProfile, isPending } = useUpdateArtistProfile();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  // Load existing profile data
  useEffect(() => {
    if (artistProfile) {
      reset({
        publicSiteUsername: artistProfile.publicSiteUsername,
        profileName: artistProfile.profileName,
        bio: artistProfile.bio,
        website: artistProfile.website,
      });
    }
  }, [artistProfile, reset]);

  const onSubmit = (data: FormData) => {
    setError(null);
    setSuccess(false);

    updateProfile(
      {
        profileName: data.profileName.trim(),
        publicSiteUsername: data.publicSiteUsername.trim(),
        bio: data.bio.trim(),
        website: data.website.trim(),
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to update artist profile');
        },
      }
    );
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!artistProfile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No artist profile found. Please create one first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Artist Profile</CardTitle>
        <CardDescription>
          Update your artist profile information. Changes will be reflected across the gallery.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {success && (
            <Alert className="border-primary bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                Artist profile updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="publicSiteUsername">Username (public display name) *</Label>
            <Input
              id="publicSiteUsername"
              {...register('publicSiteUsername', {
                required: 'Username is required',
                minLength: { value: 2, message: 'Username must be at least 2 characters' },
                maxLength: { value: 50, message: 'Username must be less than 50 characters' },
                pattern: {
                  value: /^[a-zA-Z0-9_-]+$/,
                  message: 'Username can only contain letters, numbers, underscores, and hyphens',
                },
              })}
              placeholder="e.g., janedoe"
              disabled={isPending}
            />
            {errors.publicSiteUsername && (
              <p className="text-sm text-destructive">{errors.publicSiteUsername.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This will be displayed publicly in the gallery
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileName">Profile name (internal) *</Label>
            <Input
              id="profileName"
              {...register('profileName', {
                required: 'Profile name is required',
                minLength: { value: 2, message: 'Profile name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Profile name must be less than 100 characters' },
              })}
              placeholder="Enter your full name"
              disabled={isPending}
            />
            {errors.profileName && (
              <p className="text-sm text-destructive">{errors.profileName.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              For internal use only, not displayed publicly
            </p>
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
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
