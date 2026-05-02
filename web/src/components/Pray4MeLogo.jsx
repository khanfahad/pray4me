export default function Pray4MeLogo({ size = 64, className = '', showBg = true }) {
  const id = 'p4m';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pray4Me logo"
    >
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#0D3B0F" />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C8A951" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#C8A951" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Background circle */}
      {showBg && (
        <>
          <circle cx="50" cy="50" r="50" fill={`url(#${id}-bg)`} />
          <circle cx="50" cy="50" r="50" fill={`url(#${id}-glow)`} />
        </>
      )}

      {/* Crescent moon */}
      <g filter={`url(#${id}-shadow)`}>
        <circle cx="50" cy="26" r="15" fill="#C8A951" />
        <circle cx="56" cy="21" r="12" fill={showBg ? '#0D3B0F' : 'white'} />
      </g>

      {/* Star next to crescent */}
      <g transform="translate(69, 14) scale(0.85)">
        <path
          d="M5 0 L6.1 3.4 L9.8 3.4 L6.8 5.5 L7.9 8.9 L5 6.8 L2.1 8.9 L3.2 5.5 L0.2 3.4 L3.9 3.4 Z"
          fill="#C8A951"
          opacity="0.9"
        />
      </g>

      {/* LEFT HAND — cupped, palm facing up, dua position */}
      <g filter={`url(#${id}-shadow)`}>
        <path
          d="
            M 46 76
            C 44 76 36 75 28 70
            C 20 65 15 56 16 46
            C 17 38 23 33 31 35
            C 36 36 40 40 43 46
            C 45 50 46 56 46 62
            Z
          "
          fill="white"
          opacity="0.93"
        />
        {/* Finger lines hint */}
        <path
          d="M 27 38 C 24 42 22 48 23 54"
          stroke="rgba(200,169,81,0.35)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 33 35 C 31 40 30 47 31 53"
          stroke="rgba(200,169,81,0.3)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* RIGHT HAND — mirror of left */}
      <g filter={`url(#${id}-shadow)`}>
        <path
          d="
            M 54 76
            C 56 76 64 75 72 70
            C 80 65 85 56 84 46
            C 83 38 77 33 69 35
            C 64 36 60 40 57 46
            C 55 50 54 56 54 62
            Z
          "
          fill="white"
          opacity="0.93"
        />
        {/* Finger lines hint */}
        <path
          d="M 73 38 C 76 42 78 48 77 54"
          stroke="rgba(200,169,81,0.35)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 67 35 C 69 40 70 47 69 53"
          stroke="rgba(200,169,81,0.3)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Gold light rays rising from palms */}
      <g opacity="0.5">
        <line x1="50" y1="63" x2="50" y2="56" stroke="#C8A951" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="44" y1="64" x2="42" y2="57" stroke="#C8A951" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="56" y1="64" x2="58" y2="57" stroke="#C8A951" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
