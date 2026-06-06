import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FlavorScores {
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
  scores: FlavorScores;
  size?: number;
}

const AXES: { key: keyof FlavorScores; label: string }[] = [
  { key: 'saltScore', label: 'Salt' },
  { key: 'sweetScore', label: 'Sweet' },
  { key: 'bitterScore', label: 'Bitter' },
  { key: 'acidityScore', label: 'Acidity' },
  { key: 'heatScore', label: 'Heat' },
  { key: 'aromaticSpiceScore', label: 'Spice' },
  { key: 'umamiScore', label: 'Umami' },
  { key: 'fatRichnessScore', label: 'Fat' },
  { key: 'smokeCharScore', label: 'Smoke' },
  { key: 'fermentationScore', label: 'Ferment' },
  { key: 'mineralCleanScore', label: 'Mineral' },
  { key: 'aromaticIntensityScore', label: 'Aroma' },
];

const TOTAL_AXES = 12;
const CENTER = 100;
const MAX_R = 70;
const LABEL_R = 88;

function polar(angle: number, r: number, cx = CENTER, cy = CENTER) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export const FlavorWheel: React.FC<FlavorWheelProps> = ({ scores, size = 200 }) => {
  const [tooltip, setTooltip] = useState<{ label: string; score: number; x: number; y: number } | null>(null);
  const [animated, setAnimated] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const scale = size / 200;

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ display: 'block' }}
      >
        {/* Background rings */}
        {[25, 50, 75, 100].map((pct) => (
          <circle
            key={pct}
            cx={CENTER}
            cy={CENTER}
            r={(pct / 100) * MAX_R}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.5"
          />
        ))}

        {/* Background axis lines */}
        {AXES.map((_, i) => {
          const angle = (i * 360) / TOTAL_AXES;
          const end = polar(angle, MAX_R);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.75"
            />
          );
        })}

        {/* Score lines with animation */}
        {AXES.map((axis, i) => {
          const angle = (i * 360) / TOTAL_AXES;
          const score = scores[axis.key] ?? 0;
          const r = (score / 100) * MAX_R;
          const end = polar(angle, r);
          const fullEnd = polar(angle, MAX_R);
          const lineLen = Math.sqrt((fullEnd.x - CENTER) ** 2 + (fullEnd.y - CENTER) ** 2);

          return (
            <g key={axis.key}>
              <motion.line
                x1={CENTER}
                y1={CENTER}
                x2={end.x}
                y2={end.y}
                stroke="var(--color-accent-primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: animated ? 1 : 0, opacity: animated ? 1 : 0 }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
              />
              {/* Endpoint dot */}
              <motion.circle
                cx={end.x}
                cy={end.y}
                r={2.5}
                fill="var(--color-accent-primary)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: animated ? 1 : 0, opacity: animated ? 1 : 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 + 0.7, ease: 'easeOut' }}
              />
              {/* Invisible hit area for tooltip */}
              <line
                x1={CENTER}
                y1={CENTER}
                x2={end.x}
                y2={end.y}
                stroke="transparent"
                strokeWidth="8"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const rect = svgRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  setTooltip({
                    label: axis.label,
                    score: score,
                    x: (e.clientX - rect.left) / scale,
                    y: (e.clientY - rect.top) / scale,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
                onTouchStart={() => {
                  setTooltip({ label: axis.label, score, x: end.x, y: end.y });
                  setTimeout(() => setTooltip(null), 1500);
                }}
              />
            </g>
          );
        })}

        {/* Labels */}
        {AXES.map((axis, i) => {
          const angle = (i * 360) / TOTAL_AXES;
          const pos = polar(angle, LABEL_R);
          const textAnchor =
            Math.abs(pos.x - CENTER) < 5
              ? 'middle'
              : pos.x < CENTER
              ? 'end'
              : 'start';
          return (
            <text
              key={axis.key}
              x={pos.x}
              y={pos.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fontSize="6.5"
              fontFamily="var(--font-label)"
              fill="rgba(255,255,255,0.5)"
            >
              {axis.label}
            </text>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={tooltip.x - 22}
              y={tooltip.y - 14}
              width={44}
              height={18}
              rx={3}
              fill="var(--color-bg-elevated)"
              stroke="var(--color-accent-border)"
              strokeWidth="0.5"
            />
            <text
              x={tooltip.x}
              y={tooltip.y - 5}
              textAnchor="middle"
              fontSize="5.5"
              fontFamily="var(--font-label)"
              fill="var(--color-accent-primary)"
            >
              {tooltip.label}: {tooltip.score}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default FlavorWheel;
