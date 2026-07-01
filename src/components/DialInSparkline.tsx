import type { ProgressionPoint } from '../lib/dialIn';
import { RATING_COLORS } from '../constants';

interface DialInSparklineProps {
    points: ProgressionPoint[];
}

const W = 132;
const H = 40;
const PAD = 6;
const DOT = 3;

// A small grind-over-time trend: the line traces grind size across the bean's
// shots, each dot coloured by how that shot tasted, so a run converging on
// Balanced reads at a glance.
export default function DialInSparkline({ points }: DialInSparklineProps) {
    if (points.length < 2) return null;

    const grinds = points.map((p) => p.grindSize);
    const min = Math.min(...grinds);
    const max = Math.max(...grinds);
    const range = max - min;
    const innerW = W - PAD * 2;
    const innerH = H - PAD * 2;

    const x = (i: number) => PAD + (i / (points.length - 1)) * innerW;
    const y = (grind: number) =>
        range === 0 ? H / 2 : PAD + innerH - ((grind - min) / range) * innerH;

    const line = points.map((p, i) => `${x(i).toFixed(1)},${y(p.grindSize).toFixed(1)}`).join(' ');
    const latest = points[points.length - 1];
    const summary = `Dial-in trend across ${points.length} shots, latest ${latest.rating ?? 'unrated'} at grind ${latest.grindSize}`;

    return (
        <svg
            className="dialin-sparkline"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={summary}
        >
            <polyline className="dialin-sparkline__line" fill="none" points={line} />
            {points.map((p, i) => (
                <circle
                    key={i}
                    cx={x(i)}
                    cy={y(p.grindSize)}
                    r={DOT}
                    fill={p.rating ? RATING_COLORS[p.rating] : 'var(--color-mocha)'}
                />
            ))}
        </svg>
    );
}
