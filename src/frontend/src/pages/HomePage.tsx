import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowRight, Palette, Users, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: 'url(/assets/generated/zart-hero-bg.dim_1600x900.png)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 text-foreground animate-fade-in">
            Welcome to Z'art
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A curated gallery celebrating exceptional artists and their remarkable works
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/gallery' })}
              className="text-lg"
            >
              Explore Gallery <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: '/submit' })}
              className="text-lg"
            >
              Submit Your Art
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl font-bold text-center mb-12">
            Why Z'art?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-3">Curated Collection</h3>
              <p className="text-muted-foreground">
                Every piece is carefully selected to showcase exceptional artistry and creativity
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-3">Support Artists</h3>
              <p className="text-muted-foreground">
                Connect directly with talented artists and inquire about purchasing their work
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-3">Discover New Talent</h3>
              <p className="text-muted-foreground">
                Explore emerging artists and find unique pieces that speak to you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold mb-6">
            Ready to Explore?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse our collection of stunning artworks or submit your own creations to be featured
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/gallery' })}
            >
              View Gallery
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: '/artists' })}
            >
              Meet the Artists
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

