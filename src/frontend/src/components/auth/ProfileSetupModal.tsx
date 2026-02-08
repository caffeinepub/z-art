import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from '@tanstack/react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, AlertCircle, Upload, X, User } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useAuthz';
import { useProfileSetup } from './ProfileSetupProvider';
import { fileToDataUrl } from '../../utils/fileToDataUrl';
import { normalizeEmailForBackend } from '../../utils/optionalEmail';
import type { UserProfile } from '../../backend';

interface FormData {
  name: string;
  email: string;
  bio: string;
}

export default function ProfileSetupModal() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  const { isOpen, closeProfileSetup } = useProfileSetup();
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null && isOpen;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      bio: '',
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!showProfileSetup) {
      reset();
      setAvatarPreview(null);
      setAvatarError(null);
      setError(null);
    }
  }, [showProfileSetup, reset]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarPreview(dataUrl);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to load image');
      setAvatarPreview(null);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarError(null);
    // Reset the file input
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = (data: FormData) => {
    setError(null);
    const profileData: UserProfile = {
      name: data.name,
      email: normalizeEmailForBackend(data.email),
      bio: data.bio,
      avatar: avatarPreview || undefined,
    };
    saveProfile(profileData, {
      onSuccess: () => {
        closeProfileSetup();
        // Navigate to home after successful profile creation
        navigate({ to: '/' });
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'Failed to save profile');
      },
    });
  };

  return (
    <Dialog open={showProfileSetup} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Welcome to Z'art!</DialogTitle>
          <DialogDescription>
            Please complete your profile to continue
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Avatar Upload Section */}
          <div className="space-y-2">
            <Label>Profile Picture (Optional)</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Avatar preview" />
                ) : (
                  <AvatarFallback>
                    <User className="h-10 w-10 text-muted-foreground" />
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
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about yourself"
              rows={3}
              disabled={isPending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
