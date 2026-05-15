const AXES = ['Linguagens', 'Humanas', 'Natureza', 'Matemática', 'Redação']
const NUM = 5
const GRID = [20, 40, 60, 80, 100]

function angle(i) { return (2 * Math.PI * i / NUM) - Math.PI / 2 }

function pt(cx, cy, r, i, val) {
  const a = angle(i)
  const radius = (val / 100) * r
  return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) }
}

function toPath(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'
}

// data: { linguagens, humanas, natureza, matematica, redacao } all 0-100
// initial: same shape, shown as dashed overlay
export default function RadarChart({ data, initial = null, size = 260 }) {
  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.36
  const labelR = maxR + 26

  const keys = ['linguagens', 'humanas', 'natureza', 'matematica', 'redacao']
  const vals = keys.map(k => Math.max(0, Math.min(100, data[k] || 0)))
  const initVals = initial ? keys.map(k => Math.max(0, Math.min(100, initial[k] || 0))) : null

  const dataPts = vals.map((v, i) => pt(cx, cy, maxR, i, v))
  const initPts = initVals ? initVals.map((v, i) => pt(cx, cy, maxR, i, v)) : null

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {/* Grid pentagons */}
      {GRID.map(level => {
        const pts = Array.from({ length: NUM }, (_, i) => pt(cx, cy, maxR, i, level))
        return (
          <path key={level} d={toPath(pts)}
            fill="none" stroke={level === 100 ? '#ffffff25' : '#ffffff12'} strokeWidth="1" />
        )
      })}

      {/* Axes */}
      {Array.from({ length: NUM }, (_, i) => {
        const end = pt(cx, cy, maxR, i, 100)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#ffffff18" strokeWidth="1" />
      })}

      {/* Initial overlay (before diagnosis) */}
      {initPts && (
        <path d={toPath(initPts)}
          fill="rgba(74,74,90,0.15)" stroke="#4A4A5A" strokeWidth="1.5" strokeDasharray="4,3" />
      )}

      {/* Current data polygon */}
      <path d={toPath(dataPts)} fill="rgba(255,69,0,0.18)" stroke="#FF4500" strokeWidth="2" />

      {/* Data points */}
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#FF4500" stroke="#FF8C00" strokeWidth="1.5" />
      ))}

      {/* Value labels next to points */}
      {dataPts.map((p, i) => {
        const a = angle(i)
        const ox = Math.cos(a) * 12
        const oy = Math.sin(a) * 12
        return (
          <text key={`v${i}`} x={p.x + ox} y={p.y + oy}
            textAnchor="middle" dominantBaseline="middle"
            fill="#FF8C00" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="700">
            {vals[i]}
          </text>
        )
      })}

      {/* Axis labels */}
      {AXES.map((label, i) => {
        const a = angle(i)
        const lx = cx + labelR * Math.cos(a)
        const ly = cy + labelR * Math.sin(a)
        return (
          <text key={`l${i}`} x={lx} y={ly}
            textAnchor="middle" dominantBaseline="middle"
            fill="#B0ADAA" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="600">
            {label}
          </text>
        )
      })}
    </svg>
  )
}
