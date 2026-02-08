import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import SiteLayout from './components/layout/SiteLayout';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import ArtworkDetailsPage from './pages/ArtworkDetailsPage';
import EditArtworkPage from './pages/EditArtworkPage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistProfilePage from './pages/ArtistProfilePage';
import SubmitArtworkPage from './pages/SubmitArtworkPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MyProfilePage from './pages/MyProfilePage';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import { ProfileSetupProvider } from './components/auth/ProfileSetupProvider';
import AdminRouteGuard from './components/auth/AdminRouteGuard';

const rootRoute = createRootRoute({
  component: () => (
    <ProfileSetupProvider>
      <SiteLayout>
        <ProfileSetupModal />
        <Outlet />
      </SiteLayout>
    </ProfileSetupProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gallery',
  component: GalleryPage,
});

const artworkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artwork/$artworkId',
  component: ArtworkDetailsPage,
});

const editArtworkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artwork/$artworkId/edit',
  component: EditArtworkPage,
});

const artistsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artists',
  component: ArtistsPage,
});

const artistProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artist/$artistId',
  component: ArtistProfilePage,
});

const submitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/submit',
  component: SubmitArtworkPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: MyProfilePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AdminRouteGuard>
      <AdminDashboardPage />
    </AdminRouteGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  galleryRoute,
  artworkRoute,
  editArtworkRoute,
  artistsRoute,
  artistProfileRoute,
  submitRoute,
  profileRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
