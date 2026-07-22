// Glossy 3D support-shield icon (metallic rim + green gradient face + white
// headset), drawn as inline SVG so it stays crisp at any size.
export default function SupportShield({ className = "w-16 h-auto" }) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Support shield"
    >
      <defs>
        {/* Silver metallic rim */}
        <linearGradient id="ss-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfbfb" />
          <stop offset="0.45" stopColor="#d0d0d0" />
          <stop offset="0.75" stopColor="#a7a7a7" />
          <stop offset="1" stopColor="#7f7f7f" />
        </linearGradient>
        {/* Green face */}
        <linearGradient id="ss-green" x1="0.25" y1="0.05" x2="0.75" y2="1">
          <stop offset="0" stopColor="#41ad55" />
          <stop offset="0.5" stopColor="#218a39" />
          <stop offset="1" stopColor="#115f27" />
        </linearGradient>
        {/* Top gloss */}
        <linearGradient id="ss-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="ss-shadow" x="-25%" y="-20%" width="150%" height="150%">
          <feDropShadow
            dx="0"
            dy="2.5"
            stdDeviation="2.5"
            floodColor="#0b3d1a"
            floodOpacity="0.35"
          />
        </filter>
      </defs>

      {/* Outer metallic rim */}
      <path
        filter="url(#ss-shadow)"
        fill="url(#ss-rim)"
        d="M50 4 L16 15 Q11 16.5 11 22 L11 58 Q11 86 50 116 Q89 86 89 58 L89 22 Q89 16.5 84 15 Z"
      />
      {/* Thin inner shadow line between rim and face */}
      <path
        fill="#6f6f6f"
        d="M50 8.5 L19 18.3 Q15.3 19.2 15.3 23.8 L15.3 57 Q15.3 83 50 111 Q84.7 83 84.7 57 L84.7 23.8 Q84.7 19.2 81 18.3 Z"
      />
      {/* Green face */}
      <path
        fill="url(#ss-green)"
        d="M50 10.5 L20.7 19.8 Q17 20.7 17 25 L17 57 Q17 82 50 108.5 Q83 82 83 57 L83 25 Q83 20.7 79.3 19.8 Z"
      />
      {/* Glossy top highlight */}
      <path
        fill="url(#ss-gloss)"
        d="M50 10.5 L20.7 19.8 Q17 20.7 17 25 L17 53 Q31 41 50 41 Q69 41 83 53 L83 25 Q83 20.7 79.3 19.8 Z"
      />

      {/* Headset */}
      <g fill="#ffffff">
        {/* headband */}
        <path
          d="M34 58 a16 15 0 0 1 32 0"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* ear cups */}
        <rect x="29.5" y="55" width="9" height="18" rx="4.5" />
        <rect x="61.5" y="55" width="9" height="18" rx="4.5" />
        {/* speaker dots */}
        <circle cx="43.5" cy="64" r="2.3" />
        <circle cx="50" cy="64" r="2.3" />
        <circle cx="56.5" cy="64" r="2.3" />
        {/* mic boom */}
        <path
          d="M34 71 q0 12 13.5 12"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* mic tip */}
        <rect x="45" y="79.5" width="11" height="6.6" rx="3.3" />
      </g>
    </svg>
  );
}
