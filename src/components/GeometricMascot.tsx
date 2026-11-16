import type { MascotMood } from '../types/learning';

interface GeometricMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GeometricMascot({
  mood = 'greeting',
  size = 'md',
  className = '',
}: GeometricMascotProps) {
  const dimensions =
    size === 'sm' ? 'w-14 h-14' : size === 'lg' ? 'w-28 h-28' : 'w-20 h-20';

  const bodyColor =
    mood === 'encouraging'
      ? '#0284C7'
      : mood === 'celebrating' || mood === 'happy'
        ? '#059669'
        : '#0D9488';

  const wingColor =
    mood === 'encouraging'
      ? '#0369A1'
      : mood === 'celebrating' || mood === 'happy'
        ? '#047857'
        : '#0F766E';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${dimensions} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Subtle ground shadow */}
        <ellipse cx="60" cy="110" rx="34" ry="5" fill="#E2E8F0" />

        {/* Geometric ear/crest triangles */}
        <polygon points="30,34 42,14 52,30" fill={wingColor} />
        <polygon points="90,34 78,14 68,30" fill={wingColor} />

        {/* Left & right geometric wings */}
        {mood === 'celebrating' ? (
          <>
            <polygon points="22,62 6,34 26,44" fill={wingColor} />
            <polygon points="98,62 114,34 94,44" fill={wingColor} />
          </>
        ) : mood === 'greeting' ? (
          <>
            <polygon points="24,62 12,78 28,82" fill={wingColor} />
            <polygon points="96,56 112,38 92,46" fill={wingColor} />
          </>
        ) : (
          <>
            <polygon points="24,58 14,76 28,82" fill={wingColor} />
            <polygon points="96,58 106,76 92,82" fill={wingColor} />
          </>
        )}

        {/* Main rounded octagon-like geometric body */}
        <rect x="24" y="24" width="72" height="76" rx="28" fill={bodyColor} />

        {/* Calm off-white chest diamond */}
        <polygon points="60,64 82,82 60,96 38,82" fill="#F8FAFC" opacity="0.92" />
        <polygon points="60,70 72,82 60,90 48,82" fill="#E2E8F0" opacity="0.7" />

        {/* Geometric eye mask */}
        <rect x="31" y="37" width="25" height="22" rx="11" fill="#FFFFFF" />
        <rect x="64" y="37" width="25" height="22" rx="11" fill="#FFFFFF" />

        {/* Expressive eyes based on mood */}
        {mood === 'happy' || mood === 'celebrating' ? (
          <>
            <path
              d="M38 49 Q43.5 42 49 49"
              stroke="#0F172A"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M71 49 Q76.5 42 82 49"
              stroke="#0F172A"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : mood === 'thinking' ? (
          <>
            <circle cx="46" cy="46" r="4.5" fill="#0F172A" />
            <circle cx="79" cy="46" r="4.5" fill="#0F172A" />
            <line x1="37" y1="35" x2="50" y2="35" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="44" cy="48" r="5" fill="#0F172A" />
            <circle cx="76" cy="48" r="5" fill="#0F172A" />
            <circle cx="45.8" cy="46" r="1.8" fill="#FFFFFF" />
            <circle cx="77.8" cy="46" r="1.8" fill="#FFFFFF" />
          </>
        )}

        {/* Geometric amber beak */}
        <polygon points="54,54 66,54 60,64" fill="#F59E0B" />

        {/* Listening sound arcs when audio is playing */}
        {mood === 'listening' && (
          <>
            <path
              d="M102 42 Q110 50 102 58"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M108 36 Q118 50 108 64"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}

        {/* Geometric feet */}
        <rect x="42" y="98" width="12" height="7" rx="3.5" fill="#D97706" />
        <rect x="66" y="98" width="12" height="7" rx="3.5" fill="#D97706" />
      </svg>
    </div>
  );
}
