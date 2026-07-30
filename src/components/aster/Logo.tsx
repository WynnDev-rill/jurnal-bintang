/** Aster mark — 8-ray asterisk star, matching the app icon. */
export function AsterMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      <g
        transform="translate(24 24)"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1="-17"
            x2="0"
            y2="17"
            transform={`rotate(${i * 45})`}
            opacity={i % 2 === 0 ? 1 : 0.75}
          />
        ))}
      </g>
      <circle cx="24" cy="24" r="3.4" fill="currentColor" />
    </svg>
  );
}

/** Soft aster flower used for avatars & reflection art. */
export function AsterFlower({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="petalGrad" cx="50%" cy="35%">
          <stop offset="0%" stopColor="var(--color-sky-tint)" />
          <stop offset="100%" stopColor="var(--color-primary)" />
        </radialGradient>
      </defs>
      <g transform="translate(24 24)">
        {Array.from({ length: 12 }).map((_, i) => (
          <ellipse
            key={i}
            rx="3.1"
            ry="11.5"
            cy="-9"
            fill="url(#petalGrad)"
            opacity={i % 2 === 0 ? 0.95 : 0.6}
            transform={`rotate(${i * 30})`}
          />
        ))}
        <circle r="3.6" fill="var(--color-sand)" />
      </g>
    </svg>
  );
}

/** Dreamy hero illustration for the Reflection screen. */
export function ReflectionScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 210" className={className} aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-sky-tint)" />
          <stop offset="70%" stopColor="var(--color-card)" />
          <stop offset="100%" stopColor="var(--color-card)" />
        </linearGradient>
        <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-sky-deep)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-sky-deep)" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="petalHero" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-sky-deep)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <rect width="320" height="210" fill="url(#skyGrad)" />

      <g className="animate-drift" opacity="0.55">
        <ellipse cx="62" cy="46" rx="34" ry="11" fill="white" />
        <ellipse cx="88" cy="40" rx="21" ry="9" fill="white" />
        <ellipse cx="252" cy="70" rx="26" ry="8" fill="white" opacity="0.7" />
      </g>

      <path d="M0 150 Q 70 112 158 144 T 320 128 V210 H0 Z" fill="url(#hillFar)" />
      <path d="M0 176 Q 96 142 196 176 T 320 166 V210 H0 Z" fill="url(#hillNear)" />

      <circle cx="176" cy="112" r="62" fill="url(#glow)" />

      <g className="animate-float-slow" transform="translate(176 118)">
        <path
          d="M0 62 C -3 40 -3 22 0 4"
          stroke="var(--color-sky-deep)"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M0 38 C -13 34 -18 25 -21 17 C -10 17 -3 27 0 36"
          fill="var(--color-sky-deep)"
          opacity="0.45"
        />
        {Array.from({ length: 12 }).map((_, i) => (
          <ellipse
            key={i}
            rx="5.2"
            ry="21"
            cy="-17"
            fill="url(#petalHero)"
            opacity={i % 2 === 0 ? 0.9 : 0.55}
            transform={`rotate(${i * 30})`}
          />
        ))}
        <circle r="6" fill="var(--color-sand)" />
        <circle r="6" fill="var(--color-primary)" opacity="0.25" />
      </g>

      {[
        [116, 78, 1],
        [236, 96, 1.4],
        [136, 140, 0.8],
        [222, 148, 1.1],
      ].map(([x, y, s], i) => (
        <g
          key={i}
          className="animate-sparkle"
          style={{ animationDelay: `${i * 0.6}s`, transformOrigin: `${x}px ${y}px` }}
          transform={`translate(${x} ${y}) scale(${s})`}
        >
          <path
            d="M0 -7 Q1.2 -1.2 7 0 Q1.2 1.2 0 7 Q-1.2 1.2 -7 0 Q-1.2 -1.2 0 -7 Z"
            fill="var(--color-primary)"
            opacity="0.75"
          />
        </g>
      ))}
    </svg>
  );
}
