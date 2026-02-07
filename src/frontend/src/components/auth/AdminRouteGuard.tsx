import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAuthz } from '../../hooks/useAuthz';

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { isAdmin, isLoading: authzLoading } = useAuthz();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  // Show loading state
  if (loginStatus === 'initializing' || authzLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - prompt to login
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription className="mt-2">
              You need to be logged in to access the admin dashboard.
            </AlertDescription>
          </Alert>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => navigate({ to: '/' })} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            <Button onClick={login} className="flex-1">
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription className="mt-2">
              You don't have permission to access the admin dashboard.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/' })}
            className="w-full mt-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated and admin - show content
  return <>{children}</>;
}

