import React, { useState } from 'react';
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
  scores: FlavorScores;
  size?: 'sm' | 'lg';
}

const AXES: { key: keyof FlavorScores; label: string }[] = [
  { key: 'saltScore', label: 'Salt' },
  { key: 'sweetScore', label: 'Sweet' },
  { key: 'bitterScore', label: 'Bitter' },
  { key: 'acidityScore', label: 'Acidity' },
  { key: 'heatScore', label: 'Heat' },
  { key: 'aromaticSpiceScore', label: 'Aromatic' },
  { key: 'umamiScore', label: 'Umami' },
  { key: 'fatRichnessScore', label: 'Richness' },
  { key: 'smokeCharScore', label: 'Smoke' },
  { key: 'fermentationScore', label: 'Fermentation' },
  { key: 'mineralCleanScore', label: 'Mineral' },
  { key: 'aromaticIntensityScore', label: 'Intensity' },
];

const TOTAL_AXES = 12;

function polar(angle: number, r: number, cx: number, cy: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export const FlavorWheel: React.FC<FlavorWheelProps> = ({ scores, size = 'lg' }) => {
  const [tooltip, setTooltip] = useState<{ label: string; score: number; x: number; y: number } | null>(null);

  const isLg = size === 'lg';
  const viewBoxSize = isLg ? 400 : 200;
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2;
  const maxRadius = isLg ? 140 : 70;
  const dotR = isLg ? 3 : 2;
  const labelRadius = maxRadius + 18;

  // Build polygon points
  const points = AXES.map((axis, i) => {
    const angle = (i * 360) / TOTAL_AXES;
    const score = scores[axis.key] ?? 0;
    const r = (score / 100) * maxRadius;
    return polar(angle, r, cx, cy);
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: viewBoxSize, height: viewBoxSize }}>
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width={viewBoxSize}
        height={viewBoxSize}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Grid rings */}
        {[25, 50, 75, 100].map((pct) => (
          <circle
            key={pct}
            cx={cx}
            cy={cy}
            r={(pct / 100) * maxRadius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const angle = (i * 360) / TOTAL_AXES;
          const end = polar(angle, maxRadius, cx, cy);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
          );
        })}

        {/* Score polygon with Framer Motion fade-in */}
        <motion.polygon
          points={polygonPoints}
          fill="rgba(201, 169, 110, 0.15)"
          stroke="#c9a96e"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Score dots */}
        {points.map((p, i) => {
          const axis = AXES[i];
          const score = scores[axis.key] ?? 0;
          return (
            <circle
              key={axis.key}
              cx={p.x}
              cy={p.y}
              r={dotR}
              fill="#c9a96e"
              style={isLg ? { cursor: 'pointer' } : undefined}
              onMouseEnter={isLg ? (e) => {
                const svgEl = (e.target as SVGElement).closest('svg');
                const rect = svgEl?.getBoundingClientRect();
                if (!rect) return;
                setTooltip({
                  label: axis.label,
                  score,
                  x: p.x,
                  y: p.y,
                });
              } : undefined}
              onMouseLeave={isLg ? () => setTooltip(null) : undefined}
              onTouchStart={isLg ? () => {
                setTooltip({ label: axis.label, score, x: p.x, y: p.y });
                setTimeout(() => setTooltip(null), 1500);
              } : undefined}
            />
          );
        })}

        {/* Axis labels (lg only) */}
        {isLg && AXES.map((axis, i) => {
          const angle = (i * 360) / TOTAL_AXES;
          const pos = polar(angle, labelRadius, cx, cy);
          const textAnchor =
            Math.abs(pos.x - cx) < 8 ? 'middle' : pos.x < cx ? 'end' : 'start';
          return (
            <text
              key={axis.key}
              x={pos.x}
              y={pos.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fontSize="10"
              fontFamily="'DM Mono', monospace"
              fill="#b8b0a0"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onMouseEnter={() => {
                const score = scores[axis.key] ?? 0;
                setTooltip({ label: axis.label, score, x: pos.x, y: pos.y });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {axis.label}
            </text>
          );
        })}

        {/* Tooltip (lg only) */}
        {isLg && tooltip && (() => {
          const tooltipW = 100;
          const tooltipH = 28;
          // Clamp so tooltip stays inside viewBox
          const tx = Math.min(Math.max(tooltip.x - tooltipW / 2, 4), viewBoxSize - tooltipW - 4);
          const ty = tooltip.y - tooltipH - 8 < 0 ? tooltip.y + 8 : tooltip.y - tooltipH - 8;
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={tx}
                y={ty}
                width={tooltipW}
                height={tooltipH}
                rx={4}
                fill="#1e1e1e"
                stroke="#c9a96e"
                strokeWidth={1}
              />
              <text
                x={tx + tooltipW / 2}
                y={ty + tooltipH / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontFamily="'DM Mono', monospace"
                fill="#f5f0e8"
              >
                {tooltip.label} · {tooltip.score}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
};

export default FlavorWheel;
