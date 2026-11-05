import { orientationGuide, type Orientation } from "../types";

export function SiteSketch({
  compact = false,
  width = 7.5,
  depth = 15,
  orientation = "East",
}: {
  compact?: boolean;
  width?: number;
  depth?: number;
  orientation?: Orientation;
}) {
  const guide = orientationGuide(orientation);
  const area = width * depth;
  const opposite: Record<string, string> = { N: "S", S: "N", E: "W", W: "E" };
  return (
    <svg
      viewBox="0 0 700 860"
      className={`site-sketch ${compact ? "is-compact" : ""}`}
      role="img"
      aria-label={`Hand-drawn land map showing a ${width.toFixed(1)} metre by ${depth.toFixed(1)} metre ${orientation.toLowerCase()}-facing plot with a total area of ${area.toFixed(1)} square metres`}
    >
      <defs>
        <filter id="sketch-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="2" seed="8" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="sketch-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f2ecdf" />
          <stop offset="55%" stopColor="#ece4d4" />
          <stop offset="100%" stopColor="#e6ddcb" />
        </linearGradient>
        <pattern id="notebook-lines" width="8" height="34" patternUnits="userSpaceOnUse">
          <path d="M0 33.5h700" stroke="#a9b3aa" strokeWidth=".55" opacity=".38" />
          <path d="M0 17h700" stroke="#b7c0b7" strokeWidth=".3" opacity=".18" />
        </pattern>
        <pattern id="notebook-grid" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M34 0v34M0 34h34" stroke="#b8b2a4" strokeWidth=".4" opacity=".25" />
        </pattern>
      </defs>

      <rect width="700" height="860" rx="10" fill="url(#sketch-paper)" />
      <rect width="700" height="860" rx="10" fill="url(#notebook-grid)" opacity=".62" />
      <rect x="0" y="104" width="700" height="610" fill="url(#notebook-lines)" />
      <rect x="589" y="0" width="1.3" height="860" fill="#c98672" opacity=".35" />
      <rect x="0" y="0" width="700" height="860" fill="#8a7c66" opacity=".035" />

      {/* faint page edge / scan artifacts */}
      <path d="M12 63c112-16 577-15 677 3" stroke="#fff" strokeWidth="6" opacity=".28" fill="none" />
      <path d="M5 747c126 12 549 16 690 0" stroke="#5d5447" strokeWidth=".7" opacity=".12" fill="none" />
      <ellipse cx="570" cy="170" rx="68" ry="38" fill="#b9a98f" opacity=".05" />

      <g transform="translate(132 82)">
        <path
          d="M3 3h379l1 574H3Z"
          fill="none"
          stroke="#2d5d51"
          strokeWidth="2.8"
          filter="url(#sketch-rough)"
          opacity=".92"
        />
        <path d="M8 9h371M6 571h372" stroke="#2d5d51" strokeWidth="1" opacity=".3" fill="none" />
        <circle cx="2" cy="2" r="3.2" fill="#2d5d51" />
        <circle cx="383" cy="1" r="3.2" fill="#2d5d51" />
        <circle cx="2" cy="579" r="3.2" fill="#2d5d51" />
        <circle cx="383" cy="579" r="3.2" fill="#2d5d51" />
      </g>

      {/* measurements */}
      <g fontFamily="Fraunces Variable, Georgia, serif" fill="#2b5b51">
        <text x="260" y="53" fontSize="29" fontStyle="italic" transform="rotate(-1 260 53)">
          {width.toFixed(1)} mtrs
        </text>
        <text x="592" y="394" fontSize="28" fontStyle="italic" transform="rotate(90 592 394)">
          {depth.toFixed(1)} mtrs
        </text>
        <text x="264" y="723" fontSize="29" fontStyle="italic">
          {width.toFixed(1)} mtrs
        </text>
        <text x="55" y="385" fontSize="27" fontStyle="italic" transform="rotate(-90 55 385)">
          {depth.toFixed(1)} mtrs
        </text>
        <text x="65" y="294" fontSize="14" fontStyle="italic" transform="rotate(-90 65 294)" opacity=".7">
          {Math.round(area * 10.7639)} sft
        </text>
      </g>

      {/* dimension ticks */}
      <g stroke="#2d5d51" strokeWidth="1.2" opacity=".55">
        <path d="M132 71v18M515 71v18M119 400h18M611 400h18M132 674v18M515 674v18" />
      </g>

      {/* central area note */}
      <g fontFamily="Fraunces Variable, Georgia, serif" fill="#28594f">
        <text x="336" y="361" fontSize="31" fontStyle="italic" textAnchor="middle" opacity=".93">
          Total Area =
        </text>
        <text x="336" y="410" fontSize="37" fontStyle="italic" textAnchor="middle">
          {area.toFixed(1)} Sq.meters
        </text>
        <path
          d="M180 438c93-15 208-18 323-8"
          stroke="#2d5d51"
          strokeWidth="1.7"
          fill="none"
          opacity=".5"
          filter="url(#sketch-rough)"
        />
      </g>

      <g fontFamily="Manrope Variable, sans-serif" fill="#3d6a5d" opacity=".58">
        <text x="162" y="487" fontSize="9.5" letterSpacing="2.4">CLEAR SETBACKS</text>
        <text x="162" y="503" fontSize="9.5" letterSpacing="2.4">{orientation.toUpperCase()} ENTRY</text>
      </g>

      {/* compass */}
      <g transform="translate(565 665)" fill="none" stroke="#2b5b51" strokeWidth="1.3">
        <path d="M63 38v-81M63 38v33" />
        <path d="M33 38h-24M93 38h24" />
        <path d="M63 0l-6 12M63 0l6 12" />
        <path d="M63 71l-5-11M63 71l5-11" fill="#2b5b51" />
        <path d="M0 38l10-5M0 38l10 5M126 38l-10-5M126 38l-10 5" />
      </g>
      <g fontFamily="Fraunces Variable, Georgia, serif" fill="#2b5b51" fontSize="19" fontStyle="italic">
        <text x="576" y="619">{guide.compass}</text>
        <text x="576" y="762">{opposite[guide.compass]}</text>
        <text x="510" y="680">{guide.compassLeft}</text>
        <text x="643" y="680">{opposite[guide.compassLeft]}</text>
      </g>

      {/* date panel */}
      <g transform="translate(512 500)">
        <text x="46" y="36" fontFamily="Fraunces Variable, Georgia, serif" fontSize="48" fill="#34584e" textAnchor="middle">
          11
        </text>
        <path d="M5 48h84" stroke="#2d5d51" strokeWidth="1.6" opacity=".6" />
        <text x="47" y="70" fontFamily="Fraunces Variable, Georgia, serif" fontSize="17" fill="#406a5e" textAnchor="middle">
          Sunday
        </text>
        <text x="47" y="87" fontFamily="Manrope Variable, sans-serif" fontSize="7.5" letterSpacing="1.5" fill="#799084" textAnchor="middle">
          011 · 354
        </text>
      </g>

      {/* side scribbles */}
      <g stroke="#2d5d51" strokeWidth="1.1" opacity=".3" fill="none">
        <path d="M143 166c7 2 10 8 9 14M145 197c7 2 11 9 10 15M142 230c8 1 11 8 10 14M146 260c7 3 9 9 8 15M143 294c7 1 11 7 10 14M145 328c8 2 10 8 9 14M142 362c7 2 10 8 9 14M145 396c7 1 10 8 9 14M143 430c7 2 10 9 9 14M146 462c7 2 10 8 9 14M142 495c8 1 11 8 10 14M145 528c7 3 9 9 8 15M143 560c7 1 10 8 9 14" />
      </g>

      {/* bottom notebook doodle */}
      <g transform="translate(133 750)" fill="none" stroke="#305e52" strokeWidth="1.2" opacity=".4">
        <path d="M2 24c52-13 91-6 135-13 31-5 42 12 69 2 26-10 38 2 63-3" />
        <path d="M5 35c64-12 101-4 146-11 31-5 45 9 71 1 25-8 33 4 57-1" />
        <path d="M12 47c51-7 78-8 113-3 22 3 34-7 62-6 33 1 50-7 76-1" />
      </g>
      <g fontFamily="Fraunces Variable, Georgia, serif" fontStyle="italic" fill="#34584e" fontSize="18" opacity=".7">
        <text x="278" y="815">site notes / 11 jan</text>
      </g>

      {/* verification stamp */}
      <g transform="translate(399 134) rotate(-4)">
        <rect width="138" height="48" rx="4" fill="none" stroke="#b06c54" strokeWidth="1.2" opacity=".72" />
        <text x="69" y="20" textAnchor="middle" fontFamily="Manrope Variable, sans-serif" fontSize="8" letterSpacing="2" fill="#a45f48">
          MEASUREMENT CHECK
        </text>
        <text x="69" y="35" textAnchor="middle" fontFamily="Fraunces Variable, Georgia, serif" fontStyle="italic" fontSize="15" fill="#a45f48">
          112.5 m² · found
        </text>
      </g>
    </svg>
  );
}
