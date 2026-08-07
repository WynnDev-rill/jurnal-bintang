/** Aster mark — 8-ray asterisk star, matching the app icon. */
export function AsterMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      <g transform="translate(24 24)" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
        {Array.from({ length: 4 }).map((_, i) => (
          <line key={i} x1="0" y1="-17" x2="0" y2="17" transform={`rotate(${i * 45})`} opacity={i % 2 === 0 ? 1 : 0.75} />
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
          <ellipse key={i} rx="3.1" ry="11.5" cy="-9" fill="url(#petalGrad)" opacity={i % 2 === 0 ? 0.95 : 0.6} transform={`rotate(${i * 30})`} />
        ))}
        <circle r="3.6" fill="var(--color-sand)" />
      </g>
    </svg>
  );
}

/** Dreamy hero illustration for the Reflection screen. */
export function ReflectionScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-sky-tint)" />
          <stop offset="72%" stopColor="var(--color-card)" />
          <stop offset="100%" stopColor="var(--color-card)" />
        </linearGradient>
        <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-sky-deep)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-sky-deep)" stopOpacity="0.07" />
        </linearGradient>
        <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.24" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="petalHero" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-sky-deep)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <rect width="320" height="180" fill="url(#skyGrad)" />

      <g opacity="0.58">
        <g className="animate-drift">
          <ellipse cx="55" cy="40" rx="33" ry="10" fill="white" />
          <ellipse cx="82" cy="35" rx="20" ry="8" fill="white" />
          <ellipse cx="252" cy="58" rx="26" ry="8" fill="white" opacity="0.72" />
        </g>
      </g>

      <path d="M0 125 Q 70 88 158 122 T 320 108 V180 H0 Z" fill="url(#hillFar)" />
      <path d="M0 150 Q 96 119 196 151 T 320 140 V180 H0 Z" fill="url(#hillNear)" />
      <circle cx="176" cy="95" r="58" fill="url(#glow)" />

      {/* Keep the static SVG translation on the outer group. CSS animation transforms
          the inner group only, so the flower can no longer jump to the SVG origin. */}
      <g transform="translate(176 100)">
        <g className="animate-float-slow">
          <path d="M0 60 C -3 39 -3 22 0 4" stroke="var(--color-sky-deep)" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.7" />
          <path d="M0 38 C -13 34 -18 25 -21 17 C -10 17 -3 27 0 36" fill="var(--color-sky-deep)" opacity="0.45" />
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse key={i} rx="5.2" ry="20" cy="-17" fill="url(#petalHero)" opacity={i % 2 === 0 ? 0.9 : 0.55} transform={`rotate(${i * 30})`} />
          ))}
          <circle r="6" fill="var(--color-sand)" />
          <circle r="6" fill="var(--color-primary)" opacity="0.22" />
        </g>
      </g>

      {[
        [116, 66, 1],
        [236, 84, 1.35],
        [136, 122, 0.8],
        [222, 132, 1.05],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <g className="animate-sparkle" style={{ animationDelay: `${i * 0.6}s` }}>
            <path d="M0 -7 Q1.2 -1.2 7 0 Q1.2 1.2 0 7 Q-1.2 1.2 -7 0 Q-1.2 -1.2 0 -7 Z" fill="var(--color-primary)" opacity="0.75" />
          </g>
        </g>
      ))}
    </svg>
  );
}
