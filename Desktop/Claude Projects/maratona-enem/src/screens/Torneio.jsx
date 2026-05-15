import { useState, useEffect } from 'react'
import { getUserName, getUserAvatar, getPoints, getStreak } from '../utils/storage'

const FAKE_USERS = [
  { name: 'Ana Lima',         avatar: '👩‍🎓', points: 1250, streak: 15 },
  { name: 'Pedro Souza',      avatar: '🧑‍💻', points: 980,  streak: 8  },
  { name: 'Maria Santos',     avatar: '👩‍🔬', points: 875,  streak: 12 },
  { name: 'João Costa',       avatar: '🦁',  points: 720,  streak: 5  },
  { name: 'Larissa Ferreira', avatar: '🚀',  points: 650,  streak: 7  },
  { name: 'Lucas Rodrigues',  avatar: '🐉',  points: 580,  streak: 3  },
  { name: 'Beatriz Oliveira', avatar: '🧑‍🎓', points: 510,  streak: 9  },
  { name: 'Rafael Almeida',   avatar: '👨‍💻', points: 445,  streak: 2  },
  { name: 'Camila Lima',      avatar: '🌟',  points: 380,  streak: 6  },
  { name: 'Matheus Costa',    avatar: '🦁',  points: 290,  streak: 1  },
]

const PODIUM = {
  1: { medal: '🥇', border: '#C9A84C', glow: 'rgba(201,168,76,0.3)',  color: '#C9A84C' },
  2: { medal: '🥈', border: '#8A8A9A', glow: 'rgba(138,138,154,0.2)', color: '#8A8A9A' },
  3: { medal: '🥉', border: '#CD7F32', glow: 'rgba(205,127,50,0.25)', color: '#CD7F32' },
}

export default function Torneio() {
  const [ranking, setRanking] = useState([])
  const [copied, setCopied] = useState(false)
  const [userPos, setUserPos] = useState(null)

  useEffect(() => {
    const name   = getUserName()
    const avatar = getUserAvatar()
    const points = getPoints()
    const streak = getStreak()

    const all = [
      ...FAKE_USERS,
      { name, avatar, points, streak: streak.count, isUser: true },
    ].sort((a, b) => b.points - a.points)

    setRanking(all)
    setUserPos(all.findIndex(u => u.isUser) + 1)
  }, [])

  const share = () => {
    const pts  = getPoints()
    const text = `Estou em ${userPos}º lugar na Maratona ENEM 2026 com ${pts} pontos! 🔥 Me desafie! #MaratonaENEM2026`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const top3   = ranking.slice(0, 3)
  const others = ranking.slice(3)

  return (
    <div className="min-h-screen px-4 pt-6 pb-4 animate-screenEnter" style={{ background: '#0A0A0F' }}>

      {/* Header */}
      <div className="text-center mb-5">
        <span className="text-5xl animate-flame block mb-2">🏆</span>
        <h1 className="font-bebas text-[32px] leading-none tracking-[4px]" style={{ color: '#F0EDE8' }}>
          RANKING DA CAVERNA
        </h1>
        <p className="text-xs font-barlow font-semibold uppercase tracking-widest mt-1" style={{ color: '#8A8A9A' }}>
          Maratona ENEM 2026
        </p>
      </div>

      {/* Divider */}
      <div className="h-px mb-5"
           style={{ background: 'linear-gradient(to right, transparent, #FF4500, transparent)' }} />

      {/* User position card */}
      {userPos && (
        <div className="rounded-xl p-4 mb-5 glow-fire"
             style={{ background: '#1A1A26', border: '1px solid #1E1E2E', borderLeft: '3px solid #FF4500' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-barlow font-semibold uppercase tracking-wider" style={{ color: '#8A8A9A' }}>
                Sua posição
              </p>
              <p className="font-bebas leading-none" style={{ fontSize: '48px', color: '#FF4500' }}>
                {userPos <= 3 ? PODIUM[userPos].medal : `${userPos}º`}
              </p>
            </div>
            <button
              onClick={share}
              className="px-4 py-2 rounded-xl font-bebas text-sm tracking-wider transition-all duration-200"
              style={
                copied
                  ? { background: '#001A0D', border: '1px solid rgba(0,200,83,0.4)', color: '#00C853' }
                  : { background: 'linear-gradient(135deg, #FF4500, #FF8C00)', color: '#fff' }
              }
            >
              {copied ? '✅ COPIADO!' : '📤 COMPARTILHAR'}
            </button>
          </div>
        </div>
      )}

      {/* Pódio - Top 3 */}
      {top3.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-barlow font-semibold uppercase tracking-[2px] mb-3" style={{ color: '#4A4A5A' }}>
            PÓDIO
          </p>
          <div className="flex flex-col gap-2">
            {top3.map((user, idx) => {
              const pos = idx + 1
              const cfg = PODIUM[pos]
              return (
                <div
                  key={`top-${user.name}`}
                  className="flex items-center gap-3 rounded-xl p-4"
                  style={{
                    background: '#111118',
                    border: `1px solid ${cfg.border}`,
                    boxShadow: `0 0 16px ${cfg.glow}`,
                  }}
                >
                  <span className="text-2xl shrink-0">{cfg.medal}</span>
                  <span className="text-3xl shrink-0">{user.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-semibold text-sm truncate" style={{ color: '#F0EDE8' }}>
                      {user.name}{user.isUser ? ' (você)' : ''}
                    </p>
                    {user.streak > 0 && (
                      <p className="text-[10px] font-inter" style={{ color: '#FF8C00' }}>
                        🔥 {user.streak} dias
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bebas text-xl leading-none" style={{ color: cfg.color }}>
                      {user.points.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-[9px] font-barlow font-semibold uppercase" style={{ color: '#4A4A5A' }}>
                      pontos
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px mb-4"
           style={{ background: 'linear-gradient(to right, transparent, #FF4500, transparent)' }} />

      {/* Remaining ranking */}
      <div className="flex flex-col gap-1.5">
        {others.map((user, idx) => {
          const pos = idx + 4
          return (
            <div
              key={`${user.name}-${idx}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
              style={
                user.isUser
                  ? { background: '#1E0D00', border: '1px solid #FF4500', borderLeft: '3px solid #FF4500' }
                  : { background: '#111118', border: '1px solid #1E1E2E' }
              }
            >
              <span className="font-bebas text-lg w-7 text-center shrink-0" style={{ color: '#4A4A5A' }}>
                {pos}º
              </span>
              <span className="text-2xl shrink-0">{user.avatar}</span>
              <div className="flex-1 min-w-0">
                <p
                  className="font-inter font-semibold text-sm truncate"
                  style={{ color: user.isUser ? '#FF4500' : '#F0EDE8' }}
                >
                  {user.name}{user.isUser ? ' (você)' : ''}
                </p>
                {user.streak > 0 && (
                  <p className="text-[10px] font-inter" style={{ color: '#FF8C00' }}>
                    🔥 {user.streak} dias
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-barlow font-bold text-base leading-none" style={{ color: '#C9A84C' }}>
                  {user.points.toLocaleString('pt-BR')}
                </p>
                <p className="text-[9px] font-barlow font-semibold uppercase" style={{ color: '#4A4A5A' }}>
                  pts
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center mt-6 pb-2">
        <p className="text-[10px] font-inter" style={{ color: '#2A2A3A' }}>
          Ranking local • Os outros jogadores são simulados
        </p>
      </div>
    </div>
  )
}
