export function AsterFlower({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <g transform="translate(24 24)">
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse
            key={i}
            rx="4.6"
            ry="11"
            cy="-9"
            fill="currentColor"
            opacity={0.85}
            transform={`rotate(${i * 45})`}
          />
        ))}
        <circle r="5" fill="var(--color-sand)" />
      </g>
    </svg>
  );
}

export function ReflectionScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-sky-tint)" />
          <stop offset="100%" stopColor="var(--color-card)" />
        </linearGradient>
        <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-sky-deep)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-leaf)" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#sky)" />
      <circle cx="248" cy="48" r="22" fill="var(--color-sand)" opacity="0.9" />
      <g className="animate-float-slow" opacity="0.5">
        <ellipse cx="70" cy="52" rx="30" ry="12" fill="white" />
        <ellipse cx="95" cy="46" rx="20" ry="10" fill="white" />
      </g>
      <path d="M0 150 Q 80 108 170 146 T 320 132 V200 H0 Z" fill="url(#hill)" />
      <path d="M0 172 Q 110 140 210 172 T 320 164 V200 H0 Z" fill="var(--color-leaf)" opacity="0.45" />
      <g className="animate-float-slow" transform="translate(160 128)">
        <path d="M0 44 C -2 26 -2 16 0 2" stroke="var(--color-leaf)" strokeWidth="3" fill="none" />
        <path d="M0 28 C -12 24 -16 16 -18 10 C -8 10 -2 18 0 26" fill="var(--color-leaf)" opacity="0.8" />
        <g className="text-primary">
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse
              key={i}
              rx="3.6"
              ry="10"
              cy="-9"
              fill="var(--color-petal)"
              transform={`rotate(${i * 40})`}
            />
          ))}
        </g>
        <circle r="4.2" fill="var(--color-sand)" />
      </g>
    </svg>
  );
}
