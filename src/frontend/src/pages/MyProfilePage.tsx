import { useForm } from 'react-hook-form';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useAuthz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, AlertCircle, CheckCircle2, Upload, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fileToDataUrl } from '../utils/fileToDataUrl';
import type { UserProfile } from '../backend';

interface FormData {
  name: string;
  email: string;
  bio: string;
}

export default function MyProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending, isSuccess } = useSaveCallerUserProfile();
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  const isAuthenticated = !!identity;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      bio: '',
    },
  });

  // Reset form and avatar when profile data loads
  useEffect(() => {
    if (userProfile) {
      reset({
        name: userProfile.name,
        email: userProfile.email,
        bio: userProfile.bio,
      });
      setAvatarPreview(userProfile.avatar || null);
      setAvatarChanged(false);
    }
  }, [userProfile, reset]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarPreview(dataUrl);
      setAvatarChanged(true);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to load image');
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarChanged(true);
    setAvatarError(null);
    // Reset the file input
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = (data: FormData) => {
    setError(null);
    const profileData: UserProfile = {
      ...data,
      avatar: avatarPreview || undefined,
    };
    saveProfile(profileData, {
      onSuccess: () => {
        reset(data); // Reset form with new values to clear isDirty
        setAvatarChanged(false);
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'Failed to save profile');
      },
    });
  };

  // Check if there are any changes (form or avatar)
  const hasChanges = isDirty || avatarChanged;

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-display text-2xl">My Profile</CardTitle>
            <CardDescription>Please log in to view and edit your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to be logged in to access your profile. Please use the login button in the header.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if profile doesn't exist yet
  if (isFetched && !userProfile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-display text-2xl">My Profile</CardTitle>
            <CardDescription>Your profile is being set up</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please complete the profile setup modal to create your profile.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-display text-2xl">My Profile</CardTitle>
          <CardDescription>View and update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isSuccess && !hasChanges && (
              <Alert className="border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Profile updated successfully!</AlertDescription>
              </Alert>
            )}

            {/* Avatar Section */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Profile avatar" />
                  ) : (
                    <AvatarFallback>
                      <User className="h-12 w-12 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {avatarPreview ? 'Change' : 'Upload'}
                    </Button>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAvatar}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max 5MB, JPG, PNG, or GIF
                  </p>
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              {avatarError && (
                <p className="text-sm text-destructive">{avatarError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Tell us about yourself"
                rows={4}
              />
              <p className="text-sm text-muted-foreground">Optional</p>
            </div>

            <Button type="submit" disabled={isPending || !hasChanges} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
