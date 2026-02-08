interface SoldWatermarkOverlayProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A semi-transparent SOLD watermark overlay component.
 * Designed to be positioned absolutely within a relative container.
 */
export default function SoldWatermarkOverlay({ size = 'md' }: SoldWatermarkOverlayProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div
        className={`
          ${sizeClasses[size]}
          bg-destructive/90 text-destructive-foreground
          font-bold tracking-wider uppercase
          rounded shadow-lg
          backdrop-blur-sm
        `}
      >
        SOLD
      </div>
    </div>
  );
}
