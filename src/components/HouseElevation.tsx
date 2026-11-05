import { useId } from "react";
import { FACADES, type Project } from "../types";

export function HouseElevation({
  project,
  showLabels = false,
  className = "",
}: {
  project: Project;
  showLabels?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const facade = FACADES[project.settings.facade];
  const floors = Math.min(3, project.settings.floors);
  const band = floors === 3 ? 70 : 86;
  const baseline = 386;
  const roofY = baseline - floors * band;
  const groundTop = baseline - band;
  const firstTop = baseline - 2 * band;
  const secondTop = floors === 3 ? baseline - 3 * band : firstTop;
  const wall = facade.wall;
  const accent = facade.accent;
  const trim = facade.trim;
  const glass = "#41504a";
  const warm = "#e7c691";

  const windowRow = (top: number, index: number) => (
    <g key={top}>
      <rect x={188 + index * 2} y={top + 22} width={58} height={42} rx={1.5} fill={glass} opacity=".95" />
      <rect x={188 + index * 2} y={top + 22} width={58} height={42} fill={`url(#${uid}-glass)`} opacity=".55" />
      <path d={`M${217 + index * 2} ${top + 22}v42`} stroke={trim} strokeWidth="1.3" opacity=".55" />
      <rect x={252 + index * 2} y={top + 22} width={1.4} height={42} fill={trim} opacity=".35" />
      <rect x={279 + index * 2} y={top + 22} width={42} height={42} rx={1.5} fill={glass} opacity=".88" />
      <rect x={279 + index * 2} y={top + 22} width={42} height={42} fill={`url(#${uid}-glass)`} opacity=".45" />
      <rect x={298 + index * 2} y={top + 22} width={1.3} height={42} fill={trim} opacity=".4" />
      <rect x={185 + index * 2} y={top + 66} width={62} height={3} fill={trim} opacity=".25" />
      <rect x={276 + index * 2} y={top + 66} width={48} height={3} fill={trim} opacity=".25" />
    </g>
  );

  return (
    <svg
      viewBox="0 0 640 480"
      className={className}
      role="img"
      aria-label={`Architectural illustration of ${project.name}, ${project.settings.floors === 1 ? "ground floor" : `G+${project.settings.floors - 1}`} home`}
    >
      <defs>
        <linearGradient id={`${uid}-arch`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity=".14" />
          <stop offset="100%" stopColor="var(--sage)" stopOpacity=".06" />
        </linearGradient>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={wall} />
          <stop offset="100%" stopColor={`color-mix(in srgb, ${wall} 84%, ${accent})`} />
        </linearGradient>
        <linearGradient id={`${uid}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={`color-mix(in srgb, ${wall} 74%, #3e352d)`} />
          <stop offset="100%" stopColor={`color-mix(in srgb, ${wall} 58%, #26211c)`} />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#dcebe2" stopOpacity=".9" />
          <stop offset="38%" stopColor="#617a70" stopOpacity=".45" />
          <stop offset="100%" stopColor="#1d2824" stopOpacity=".9" />
        </linearGradient>
        <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5c4434" />
          <stop offset="50%" stopColor="#7b5b44" />
          <stop offset="100%" stopColor="#53402f" />
        </linearGradient>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cdbfae" />
          <stop offset="100%" stopColor="#b7a893" />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      {/* atmosphere */}
      <path
        d="M138 438V272C138 136 502 136 502 272V438Z"
        fill={`url(#${uid}-arch)`}
        stroke="var(--line)"
        strokeWidth="1"
      />
      <circle cx="474" cy="126" r="27" fill="var(--accent)" opacity=".18" />
      <circle cx="474" cy="126" r="17" fill="var(--accent)" opacity=".22" />
      <path d="M430 102c8-4 16-4 24 0M456 92c7-3 13-3 19 0" stroke="var(--muted)" strokeWidth="1.1" fill="none" opacity=".35" strokeLinecap="round" />

      {/* distant landscape */}
      <path d="M74 386h492" stroke="var(--line-strong)" strokeWidth="1" />
      <ellipse cx="319" cy="410" rx="192" ry="16" fill={trim} opacity=".16" filter={`url(#${uid}-soft)`} />
      <path d="M0 415c80-14 153-10 229 4 92 17 207 16 411-8v69H0Z" fill="var(--sage)" opacity=".06" />

      {/* tree */}
      <g>
        <path d="M106 389c2-44 1-91 5-136" stroke="#6b5a48" strokeWidth="4.2" fill="none" strokeLinecap="round" />
        <path d="M110 292c-22-8-32-22-38-38M110 308c21-12 33-27 42-45M110 330c-17-7-28-17-35-29" stroke="#6b5a48" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="85" cy="245" r="26" fill="#526548" opacity=".92" />
        <circle cx="120" cy="236" r="33" fill="#65785a" opacity=".9" />
        <circle cx="149" cy="255" r="23" fill="#778a68" opacity=".8" />
        <circle cx="101" cy="273" r="24" fill="#5b7052" opacity=".9" />
        <circle cx="140" cy="283" r="19" fill="#6c7f5e" opacity=".8" />
      </g>

      {/* rear mass / side return */}
      <path d="M466 280v106h31V293Z" fill={trim} opacity=".9" />
      <rect x="163" y={baseline - 8} width="306" height="10" fill={`url(#${uid}-floor)`} />

      {/* main volume */}
      <rect x="160" y={roofY} width="306" height={baseline - roofY} fill={`url(#${uid}-wall)`} />
      <rect x="160" y={roofY} width="306" height={baseline - roofY} fill={`url(#${uid}-glass)`} opacity=".03" />

      {/* floor divisions */}
      {Array.from({ length: floors }).map((_, i) => {
        const top = baseline - (i + 1) * band;
        return (
          <g key={i}>
            <rect x="160" y={top} width="306" height="5" fill={`url(#${uid}-floor)`} opacity=".9" />
            <rect x="160" y={top + 5} width="306" height="2" fill={trim} opacity=".08" />
          </g>
        );
      })}

      {/* roof parapet */}
      <rect x="155" y={roofY - 5} width="316" height="9" rx="1.5" fill={trim} opacity=".94" />
      <rect x="155" y={roofY - 5} width="316" height="2" fill="#fff" opacity=".14" />
      <rect x="160" y={roofY + 1} width="306" height="4" fill={accent} opacity=".13" />

      {/* upper floor windows */}
      {windowRow(firstTop, 0)}
      {floors === 3 && windowRow(secondTop, 1)}

      {/* first floor balcony */}
      {project.settings.balcony && (
        <g>
          <rect x="321" y={firstTop + 22} width="118" height="46" fill="#24302b" opacity=".88" />
          <rect x="321" y={firstTop + 22} width="118" height="46" fill={`url(#${uid}-glass)`} opacity=".5" />
          <rect x="380" y={firstTop + 22} width="1.4" height="46" fill={trim} opacity=".5" />
          <rect x="315" y={firstTop + 63} width="128" height="5" fill={trim} opacity=".9" />
          <rect x="315" y={firstTop + 63} width="128" height="2" fill="#fff" opacity=".12" />
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={322 + i * 13.5} y={firstTop + 42} width="1.3" height="24" fill={trim} opacity=".7" />
          ))}
          <rect x="318" y={firstTop + 40} width="121" height="2.5" fill={trim} opacity=".8" />
          <g transform={`translate(305 ${firstTop + 32})`}>
            <rect x="0" y="16" width="21" height="16" rx="2" fill={accent} opacity=".72" />
            <path d="M4 16C4 8 18 8 18 16" fill="#5c7054" />
          </g>
        </g>
      )}

      {/* ground floor garage */}
      {project.settings.garage ? (
        <g>
          <rect x="177" y={groundTop + 20} width="107" height={baseline - groundTop - 26} rx="2" fill={`url(#${uid}-wood)`} />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="182" y={groundTop + 26 + i * 8.1} width="97" height="2.2" fill="#2e241c" opacity=".5" />
          ))}
          <rect x="172" y={groundTop + 16} width="117" height="4" fill={trim} opacity=".55" />
          <circle cx="201" cy={groundTop + 54} r="3" fill="#cbb58f" opacity=".8" />
        </g>
      ) : (
        <g>
          <rect x="177" y={groundTop + 20} width="107" height={baseline - groundTop - 26} fill="var(--sage)" opacity=".12" />
          <path d="M188 350h30M188 366h44M188 382h24" stroke={trim} strokeWidth="1.3" opacity=".25" />
          <circle cx="240" cy="360" r="13" fill="#61765a" opacity=".85" />
        </g>
      )}

      {/* entry door */}
      <g>
        <path
          d={`M304 ${baseline}V${groundTop + 43}c0-11 8-18 17-18s17 7 17 18V${baseline}`}
          fill="#24302b"
        />
        <path
          d={`M307 ${baseline}V${groundTop + 45}c0-8 6-14 14-14s14 6 14 14V${baseline}`}
          fill={`url(#${uid}-glass)`}
          opacity=".75"
        />
        <rect x="303" y={groundTop + 39} width="37" height="3" fill={trim} opacity=".8" />
        <circle cx="329" cy={groundTop + 73} r="1.8" fill={warm} />
      </g>

      {/* ground window */}
      <g>
        <rect x="354" y={groundTop + 48} width="60" height="44" fill={glass} />
        <rect x="354" y={groundTop + 48} width="60" height="44" fill={`url(#${uid}-glass)`} opacity=".6" />
        <rect x="383" y={groundTop + 48} width="1.5" height="44" fill={trim} opacity=".65" />
        <rect x="349" y={groundTop + 92} width="70" height="3" fill={trim} opacity=".2" />
        <rect x="354" y={groundTop + 45} width="60" height="3" fill={trim} opacity=".7" />
      </g>

      {/* landscape forecourt */}
      <rect x="154" y={baseline + 7} width="318" height="11" fill={`url(#${uid}-floor)`} opacity=".55" />
      <rect x="154" y={baseline + 18} width="318" height="2" fill={trim} opacity=".22" />
      <path d="M177 382c8-8 20-12 32-8M430 380c10-7 24-8 33-2" stroke="var(--sage)" strokeWidth="1.4" opacity=".5" fill="none" strokeLinecap="round" />
      <g transform="translate(128 382)">
        <ellipse cx="18" cy="9" rx="23" ry="8" fill={trim} opacity=".25" />
        <path d="M4 6h27l-4 13H8Z" fill={accent} opacity=".75" />
        <path d="M15 6c-8-12 4-23 13-23-1 12-5 19-13 23Z" fill="#688061" />
        <path d="M10 6c-9-4-13-13-9-22 9 4 14 12 12 22Z" fill="#546a4d" />
      </g>
      <g transform="translate(473 386)">
        <rect x="0" y="4" width="22" height="16" rx="2" fill={accent} opacity=".65" />
        <path d="M6 4C6-5 17-5 17 4" fill="#5b7054" />
      </g>

      {/* roof room */}
      {project.settings.roofRoom && (
        <g>
          <rect x="352" y={roofY - 68} width="92" height="64" fill={`url(#${uid}-wall)`} />
          <path d={`M444 ${roofY - 68}l21 12v58l-21-6Z`} fill={`url(#${uid}-side)`} />
          <rect x="348" y={roofY - 72} width="100" height="6" fill={trim} opacity=".92" />
          <rect x="366" y={roofY - 49} width="33" height="28" fill={glass} />
          <rect x="366" y={roofY - 49} width="33" height="28" fill={`url(#${uid}-glass)`} opacity=".6" />
          <rect x="382" y={roofY - 49} width="1.3" height="28" fill={trim} opacity=".55" />
          <path d={`M414 ${roofY - 4}V${roofY - 35}c0-10 7-15 14-15s14 5 14 15V${roofY - 4}`} fill="#2c3732" />
          <rect x="350" y={roofY - 4} width="96" height="4" fill={trim} opacity=".25" />
          <g transform={`translate(452 ${roofY - 12})`}>
            <rect x="0" y="0" width="20" height="2.5" fill={trim} opacity=".5" />
            <rect x="9" y="-13" width="2" height="14" fill={trim} opacity=".6" />
            <rect x="5" y="-16" width="10" height="4" rx="1" fill={accent} opacity=".55" />
          </g>
        </g>
      )}

      {/* roof pergola / solar */}
      {project.settings.roofRoom ? (
        <g>
          <rect x="180" y={roofY - 4} width="150" height="3" fill={trim} opacity=".25" />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={186 + i * 17} y={roofY - 37} width="2" height="34" fill={trim} opacity=".7" />
          ))}
          <rect x="180" y={roofY - 41} width="150" height="4" fill={trim} opacity=".8" />
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={i} x={186 + i * 29} y={roofY - 34} width="1.4" height="30" fill={trim} opacity=".35" />
          ))}
          <circle cx="200" cy={roofY - 14} r="7" fill="#697e5e" />
          <rect x="218" y={roofY - 14} width="13" height="10" fill={accent} opacity=".6" />
        </g>
      ) : (
        <g>
          <rect x="180" y={roofY - 14} width="148" height="10" fill="#263932" opacity=".85" />
          {Array.from({ length: 4 }).map((_, i) => (
            <rect key={i} x={183 + i * 37} y={roofY - 14} width="34" height="3" fill={accent} opacity=".4" />
          ))}
        </g>
      )}

      {project.settings.solar && (
        <g transform={`translate(378 ${roofY - 102})`}>
          <rect x="0" y="0" width="45" height="25" rx="1.2" fill="#293f3d" transform="skewX(-16)" />
          {Array.from({ length: 3 }).map((_, i) => (
            <line key={i} x1={9 + i * 11} y1="1" x2={1 + i * 11} y2="24" stroke="#78938b" strokeWidth=".8" opacity=".45" />
          ))}
          <rect x="12" y="23" width="2" height="9" fill={trim} opacity=".6" />
          <rect x="39" y="23" width="2" height="9" fill={trim} opacity=".6" />
        </g>
      )}

      {showLabels && (
        <g fontFamily="Manrope Variable, sans-serif">
          <text x="44" y="94" fill="var(--faint)" fontSize="9.5" letterSpacing="2.2">
            {`G+${Math.max(0, floors - 1)} · ROOF ROOM`}
          </text>
          <line x1="44" y1="106" x2="138" y2="106" stroke="var(--line-strong)" strokeWidth="1" />
          <text x="44" y="122" fill="var(--muted)" fontSize="8.5" letterSpacing="1.1">
            {project.orientation.toUpperCase()} LIGHT · {project.plot.width.toFixed(1)} M FRONTAGE
          </text>
        </g>
      )}
    </svg>
  );
}
