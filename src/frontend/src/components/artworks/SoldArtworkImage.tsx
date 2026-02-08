import ArtworkImage from '../images/ArtworkImage';
import SoldWatermarkOverlay from './SoldWatermarkOverlay';

interface SoldArtworkImageProps {
  src: string | undefined | null;
  alt: string;
  sold: boolean;
  className?: string;
  aspectClassName?: string;
  onClick?: () => void;
  watermarkSize?: 'sm' | 'md' | 'lg';
}

/**
 * Wrapper component that displays an artwork image with an optional SOLD watermark overlay.
 * The watermark is positioned absolutely within a relative container to avoid layout changes.
 */
export default function SoldArtworkImage({
  src,
  alt,
  sold,
  className = '',
  aspectClassName = 'aspect-square',
  onClick,
  watermarkSize = 'md',
}: SoldArtworkImageProps) {
  return (
    <div className="relative">
      <ArtworkImage
        src={src}
        alt={alt}
        className={className}
        aspectClassName={aspectClassName}
        onClick={onClick}
      />
      {sold && <SoldWatermarkOverlay size={watermarkSize} />}
    </div>
  );
}
