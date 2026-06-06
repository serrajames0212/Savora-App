import React from 'react';

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '20px',
  borderRadius,
  className = '',
}) => {
  return (
    <>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div
        className={className}
        style={{
          width,
          height,
          borderRadius: borderRadius ?? 'var(--radius-sm)',
          background: `linear-gradient(
            90deg,
            var(--color-bg-elevated) 25%,
            var(--color-accent-glow) 50%,
            var(--color-bg-elevated) 75%
          )`,
          backgroundSize: '200% 100%',
          animation: 'skeletonShimmer 1.8s ease-in-out infinite',
        }}
      />
    </>
  );
};

export default SkeletonLoader;
