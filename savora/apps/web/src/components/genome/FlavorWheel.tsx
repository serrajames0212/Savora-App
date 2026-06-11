import React from 'react';
import { motion } from 'framer-motion';

export interface FlavorScores {
  saltScore: number;
  sweetScore: number;
  bitterScore: number;
  acidityScore: number;
  heatScore: number;
  aromaticSpiceScore: number;
  umamiScore: number;
  fatRichnessScore: number;
  smokeCharScore: number;
  fermentationScore: number;
  mineralCleanScore: number;
  aromaticIntensityScore: number;
}

interface FlavorWheelProps {
  scores: Record<string, number> | FlavorScores;
  size?: 'sm' | 'lg';
}

// 11 dimensions, clockwise from top
const SEGMENTS: { key: string; label: string }[] = [
  { key: 'aromaticIntensityScore', label: 'Aromatic' },
  { key: 'saltScore', label: 'Salt' },
  { key: 'sweetScore', label: 'Sweetness' },
  { key: 'bitterScore', label: 'Bitterness' },
  { key: 'acidityScore', label: 'Acidity' },
  { key: 'heatScore', label: 'Heat' },
  { key: 'umamiScore', label: 'Umami' },
  { key: 'fatRichnessScore', label: 'Richness' },
  { key: 'smokeCharScore', label: 'Smoke' },
  { key: 'fermentationScore', label: 'Ferment' },
  { key: 'mineralCleanScore', label: 'Mineral' },
];

const SEGMENT_COUNT = SEGMENTS.length;
const SEGMENT_SWEEP = 360 / SEGMENT_COUNT;
const GAP = 2;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  a1: number,
  a2: number
) {
  const p1 = polar(cx, cy, outerR, a1);
  const p2 = polar(cx, cy, outerR, a2);
  const p3 = polar(cx, cy, innerR, a2);
  const p4 = polar(cx, cy, innerR, a1);
  const largeArc = a2 - a1 > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`;
}

export const FlavorWheel: React.FC<FlavorWheelProps> = ({ scores, size = 'lg' }) => {
  const isLg = size === 'lg';
  const viewBoxSize = isLg ? 400 : 200;
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2;
  const innerRadius = isLg ? 48 : 24;
  const maxRadius = isLg ? 140 : 70;
  const labelRadius = maxRadius + 14;

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={viewBoxSize}
      height={viewBoxSize}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Reference ring at max radius */}
      <circle
        cx={cx}
        cy={cy}
        r={maxRadius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={1}
      />

      {SEGMENTS.map((segment, i) => {
        const startAngle = i * SEGMENT_SWEEP + GAP / 2;
        const endAngle = (i + 1) * SEGMENT_SWEEP - GAP / 2;
        const raw = (scores as Record<string, number>)[segment.key] ?? 0;
        const score = Math.max(0, Math.min(100, raw));
        const outerR = innerRadius + (score / 100) * (maxRadius - innerRadius);

        const bgPath = wedgePath(cx, cy, innerRadius, maxRadius, startAngle, endAngle);
        const fgPath = wedgePath(cx, cy, innerRadius, outerR, startAngle, endAngle);

        const midAngle = (startAngle + endAngle) / 2;
        const labelPos = polar(cx, cy, labelRadius, midAngle);
        const textAnchor =
          Math.abs(labelPos.x - cx) < 8 ? 'middle' : labelPos.x < cx ? 'end' : 'start';

        return (
          <g key={segment.key}>
            {/* Background arc at full radius */}
            <path
              d={bgPath}
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />

            {/* Score arc wedge */}
            {isLg ? (
              <motion.path
                d={fgPath}
                fill="rgba(160, 120, 64, 0.85)"
                stroke="var(--color-accent-primary)"
                strokeWidth={1.5}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            ) : (
              <path
                d={fgPath}
                fill="rgba(160, 120, 64, 0.85)"
                stroke="var(--color-accent-primary)"
                strokeWidth={1.5}
              />
            )}

            {/* Label (lg only) */}
            {isLg && (
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fontSize="10"
                fontFamily="var(--font-label)"
                fill={
                  score >= 75
                    ? 'var(--color-accent-primary)'
                    : 'var(--color-text-secondary)'
                }
                style={{ userSelect: 'none' }}
              >
                {segment.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Centre */}
      <circle cx={cx} cy={cy} r={6} fill="#1a1208" />
      <circle cx={cx} cy={cy} r={2} fill="var(--color-accent-primary)" />
    </svg>
  );
};

export default FlavorWheel;
