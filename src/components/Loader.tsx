interface LoaderProps {
  variant?: 'spinner' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
}

function Loader({ variant = 'spinner', size = 'md' }: LoaderProps) {
  const sizeClasses = {
    sm: variant === 'spinner' ? 'w-8 h-8' : 'w-10 h-10',
    md: variant === 'spinner' ? 'w-12 h-12' : 'w-14 h-14',
    lg: variant === 'spinner' ? 'w-16 h-16' : 'w-20 h-20',
  };

  const className = variant === 'spinner' ? 'spinner' : 'loader-pulse';

  return (
    <div className={`${className} ${sizeClasses[size]}`} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Loader;
