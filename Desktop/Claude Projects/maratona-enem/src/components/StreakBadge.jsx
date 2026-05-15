export default function StreakBadge({ count }) {
  if (count === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-4 py-3"
           style={{ background: '#111118', border: '1px solid #1E1E2E', borderLeft: '3px solid #2A2A3A' }}>
        <span className="text-3xl" style={{ opacity: 0.3 }}>🔥</span>
        <div>
          <p className="text-sm font-inter font-medium" style={{ color: '#4A4A5A' }}>A chama apagou.</p>
          <p className="text-[11px] font-inter" style={{ color: '#4A4A5A' }}>
            Reacenda hoje. Acerte 5 questões.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3"
         style={{ background: '#1A1A26', border: '1px solid #1E1E2E', borderLeft: '3px solid #FF4500' }}>
      <span className="text-4xl animate-flicker select-none">🔥</span>
      <div>
        <p className="font-bebas leading-none tracking-wide" style={{ fontSize: '28px', color: '#FF8C00' }}>
          {count} {count === 1 ? 'dia' : 'dias'} seguidos
        </p>
        <p className="text-[13px] font-barlow font-semibold" style={{ color: '#8A8A9A' }}>
          {count >= 30
            ? '🏆 Lendário!'
            : count >= 14
            ? '⭐ Incrível!'
            : count >= 7
            ? '💪 Na brasa!'
            : '🌱 Crescendo!'}
        </p>
      </div>
    </div>
  )
}
