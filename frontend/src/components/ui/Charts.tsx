interface LineChartProps {
  series: { name: string; color: string; values: number[] }[];
  labels?: string[];
  height?: number;
}

export function LineChart({ series, labels, height = 180 }: LineChartProps) {
  const w = 400;
  const h = height;
  const pad = 16;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all, 1);
  const min = Math.min(...all, 0);
  const range = max - min || 1;
  const n = Math.max(...series.map((s) => s.values.length), 2);

  const toPath = (values: number[]) =>
    values
      .map((v, i) => {
        const x = pad + (i / (n - 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" style={{ height }} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={pad}
            x2={w - pad}
            y1={pad + t * (h - pad * 2)}
            y2={pad + t * (h - pad * 2)}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {series.map((s) => (
          <path
            key={s.name}
            d={toPath(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div className="chart-legend">
        {series.map((s) => (
          <span key={s.name}>
            <i className="legend-swatch" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
        {labels && labels.length > 0 && (
          <span style={{ marginLeft: 'auto' }}>{labels[0]} → {labels[labels.length - 1]}</span>
        )}
      </div>
    </div>
  );
}

interface BarChartProps {
  groups: { label: string; a: number; b: number }[];
  aLabel?: string;
  bLabel?: string;
  aColor?: string;
  bColor?: string;
  height?: number;
}

export function BarChart({
  groups,
  aLabel = 'Input',
  bLabel = 'Output',
  aColor = '#2563eb',
  bColor = '#93c5fd',
  height = 180,
}: BarChartProps) {
  const max = Math.max(...groups.flatMap((g) => [g.a, g.b]), 1);
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
          height,
          padding: '0 4px',
        }}
      >
        {groups.map((g) => (
          <div
            key={g.label}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: height - 28, width: '100%', justifyContent: 'center' }}>
              <div
                title={`${aLabel}: ${g.a}`}
                style={{
                  width: 10,
                  height: `${(g.a / max) * 100}%`,
                  background: aColor,
                  borderRadius: '4px 4px 0 0',
                  minHeight: 4,
                }}
              />
              <div
                title={`${bLabel}: ${g.b}`}
                style={{
                  width: 10,
                  height: `${(g.b / max) * 100}%`,
                  background: bColor,
                  borderRadius: '4px 4px 0 0',
                  minHeight: 4,
                }}
              />
            </div>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{g.label}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span>
          <i className="legend-swatch" style={{ background: aColor }} />
          {aLabel}
        </span>
        <span>
          <i className="legend-swatch" style={{ background: bColor }} />
          {bLabel}
        </span>
      </div>
    </div>
  );
}

interface DonutChartProps {
  slices: { label: string; value: number; color: string }[];
  size?: number;
}

export function DonutChart({ slices, size = 160 }: DonutChartProps) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 56;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox="0 0 140 140">
        <g transform="translate(70,70)">
          {slices.map((slice) => {
            const len = (slice.value / total) * c;
            const el = (
              <circle
                key={slice.label}
                r={r}
                fill="none"
                stroke={slice.color}
                strokeWidth="18"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90)"
              />
            );
            offset += len;
            return el;
          })}
          <circle r="38" fill="#fff" />
          <text textAnchor="middle" dy="4" fontSize="14" fontWeight="700" fill="#0f172a">
            ${total}
          </text>
        </g>
      </svg>
      <div className="chart-legend" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 0 }}>
        {slices.map((s) => (
          <span key={s.label}>
            <i className="legend-swatch" style={{ background: s.color }} />
            {s.label} ({Math.round((s.value / total) * 100)}%)
          </span>
        ))}
      </div>
    </div>
  );
}
