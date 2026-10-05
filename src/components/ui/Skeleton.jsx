export function Skeleton({ width = '100%', height = '16px', borderRadius = '4px', className = '' }) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  )
}

export function SkeletonCard({ lines = 3, titleHeight = '20px', titleWidth = '60%' }) {
  return (
    <div className="skeleton-card">
      <Skeleton width={titleWidth} height={titleHeight} />
      <div className="skeleton-card-lines">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton
            key={i}
            width={i === lines - 1 ? '80%' : '100%'}
            height="14px"
          />
        ))}
      </div>
    </div>
  )
}

export function SkeletonList({ items = 3 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="skeleton-list-item">
          <Skeleton width="40px" height="40px" borderRadius="50%" />
          <div className="skeleton-list-content">
            <Skeleton width="60%" height="16px" />
            <Skeleton width="80%" height="12px" />
          </div>
        </div>
      ))}
    </div>
  )
}
