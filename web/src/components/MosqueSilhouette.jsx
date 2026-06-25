export default function MosqueSilhouette({ className = '', color = 'rgba(255,255,255,0.06)' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax slice"
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 'auto', pointerEvents: 'none' }}
    >
      {/* Central dome */}
      <ellipse cx="400" cy="140" rx="80" ry="70" fill={color} />
      <rect x="320" y="140" width="160" height="60" fill={color} />
      {/* Crescent on dome */}
      <circle cx="400" cy="78" r="8" fill={color} opacity="0.8" />
      <circle cx="403" cy="76" r="6" fill="transparent" stroke={color} strokeWidth="0" />

      {/* Left minaret */}
      <rect x="180" y="60" width="18" height="140" fill={color} />
      <ellipse cx="189" cy="60" rx="14" ry="20" fill={color} />
      <circle cx="189" cy="44" r="5" fill={color} opacity="0.7" />
      {/* Left minaret balcony */}
      <rect x="175" y="100" width="28" height="4" rx="2" fill={color} />

      {/* Right minaret */}
      <rect x="602" y="60" width="18" height="140" fill={color} />
      <ellipse cx="611" cy="60" rx="14" ry="20" fill={color} />
      <circle cx="611" cy="44" r="5" fill={color} opacity="0.7" />
      {/* Right minaret balcony */}
      <rect x="597" y="100" width="28" height="4" rx="2" fill={color} />

      {/* Left small dome */}
      <ellipse cx="270" cy="155" rx="45" ry="35" fill={color} />
      <rect x="225" y="155" width="90" height="45" fill={color} />

      {/* Right small dome */}
      <ellipse cx="530" cy="155" rx="45" ry="35" fill={color} />
      <rect x="485" y="155" width="90" height="45" fill={color} />

      {/* Base wall */}
      <rect x="160" y="170" width="480" height="30" fill={color} />

      {/* Arches */}
      <path d="M 340 200 Q 360 170 380 200" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M 390 200 Q 410 170 430 200" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M 440 200 Q 460 170 480 200" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />

      {/* Far left/right buildings */}
      <rect x="100" y="150" width="60" height="50" fill={color} opacity="0.5" />
      <rect x="640" y="150" width="60" height="50" fill={color} opacity="0.5" />

      {/* Ground line */}
      <rect x="0" y="195" width="800" height="5" fill={color} />
    </svg>
  );
}
