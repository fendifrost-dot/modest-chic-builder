interface OptimizedImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width: number;
  height: number;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  className?: string;
}

const OptimizedImage = ({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  loading = 'lazy',
  fetchPriority,
  className,
}: OptimizedImageProps) => (
  <img
    src={src}
    srcSet={srcSet}
    sizes={sizes}
    alt={alt}
    width={width}
    height={height}
    loading={loading}
    decoding="async"
    fetchPriority={fetchPriority}
    className={className}
  />
);

export default OptimizedImage;
