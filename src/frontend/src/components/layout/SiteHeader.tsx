import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LoginButton from '../auth/LoginButton';
import { useAuthz } from '../../hooks/useAuthz';

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuthz();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Artists', path: '/artists' },
    { label: 'Submit Artwork', path: '/submit' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/assets/generated/zart-logo.dim_512x192.png"
              alt="Z'art"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                onClick={() => navigate({ to: link.path })}
                className="text-sm font-medium"
              >
                {link.label}
              </Button>
            ))}
            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/admin' })}
                className="text-sm font-medium"
              >
                Admin Dashboard
              </Button>
            )}
          </nav>

          {/* Auth & Mobile Menu */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:block">
              <LoginButton />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border/40">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                onClick={() => {
                  navigate({ to: link.path });
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start text-sm font-medium"
              >
                {link.label}
              </Button>
            ))}
            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => {
                  navigate({ to: '/admin' });
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start text-sm font-medium"
              >
                Admin Dashboard
              </Button>
            )}
            <div className="pt-2">
              <LoginButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

