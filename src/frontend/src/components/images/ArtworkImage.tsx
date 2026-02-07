import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { validateImageUrl, getImageFailureReason } from '../../utils/imageFailureReason';

interface ArtworkImageProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  aspectClassName?: string;
  onClick?: () => void;
}

/**
 * A reusable image component that handles load failures gracefully.
 * Displays a user-friendly error message when images fail to load,
 * while preserving layout and aspect ratio. Supports optional click handler for lightbox functionality.
 */
export default function ArtworkImage({ src, alt, className = '', aspectClassName = 'aspect-square', onClick }: ArtworkImageProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pre-validate the URL
  useEffect(() => {
    const validationError = validateImageUrl(src);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
    } else {
      setError(null);
      setIsLoading(true);
    }
  }, [src]);

  const handleImageError = () => {
    setError(getImageFailureReason(src));
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  // If there's a pre-validation error, show error state immediately
  if (error && !src) {
    return (
      <div
        className={`${aspectClassName} flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 ${className}`}
        role="img"
        aria-label={`${alt} - ${error}`}
      >
        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm text-center font-medium">Image unavailable</p>
        <p className="text-xs text-center mt-1 opacity-75">{error}</p>
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div
          className={`${aspectClassName} flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 ${className}`}
          role="img"
          aria-label={`${alt} - ${error}`}
        >
          <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm text-center font-medium">Image unavailable</p>
          <p className="text-xs text-center mt-1 opacity-75">{error}</p>
        </div>
      ) : (
        <img
          src={src || ''}
          alt={alt}
          className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={onClick ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          } : undefined}
        />
      )}
    </>
  );
}
