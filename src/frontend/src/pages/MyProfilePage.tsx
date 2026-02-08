import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, AlertCircle, Upload, X, User, Save } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useAuthz';
import { useProfileSetup } from '../components/auth/ProfileSetupProvider';
import { fileToDataUrl } from '../utils/fileToDataUrl';
import { normalizeEmailForBackend, normalizeEmailForDisplay } from '../utils/optionalEmail';
import type { UserProfile } from '../backend';

interface FormData {
  name: string;
  email: string;
  bio: string;
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  const { openProfileSetup } = useProfileSetup();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      bio: '',
    },
  });

  // Load profile data into form when available
  useEffect(() => {
    if (userProfile) {
      reset({
        name: userProfile.name,
        email: normalizeEmailForDisplay(userProfile.email),
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
    setAvatarError(null);
    setAvatarChanged(true);
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = (data: FormData) => {
    setError(null);
    setSuccess(false);
    const profileData: UserProfile = {
      name: data.name,
      email: normalizeEmailForBackend(data.email),
      bio: data.bio,
      avatar: avatarPreview || undefined,
    };
    saveProfile(profileData, {
      onSuccess: () => {
        setSuccess(true);
        setAvatarChanged(false);
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'Failed to save profile');
      },
    });
  };

  const hasChanges = isDirty || avatarChanged;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Please log in to view your profile.</span>
              <Button
                onClick={() => login()}
                disabled={isLoggingIn}
                size="sm"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isFetched && userProfile === null) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>You haven't created a profile yet. Please complete your profile to continue.</span>
              <Button
                onClick={() => openProfileSetup()}
                size="sm"
              >
                Complete Profile
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">My Profile</h1>
          <p className="text-lg text-muted-foreground">
            Manage your personal information
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-primary bg-primary/10">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                Profile updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Avatar Upload Section */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Avatar preview" />
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
                    disabled={isPending}
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
                      disabled={isPending}
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
                disabled={isPending}
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
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              placeholder="your@email.com"
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground">Optional</p>
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
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground">Optional</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/' })}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !hasChanges}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
