import { useState } from 'react'
import RadarChart from '../components/RadarChart'
import {
  getUserName, getUserAvatar,
  getXP, getNivel, getXPProgress,
  getStreak, getMaxStreak,
  getDiagnostico,
  getStatsQuestoes,
  getRedacoes,
  getBadges, hasBadge,
  getCartaEnem,
  getPlanStatus,
} from '../utils/storage'

// ── BADGE CATALOG ─────────────────────────────────────────────────
const ALL_BADGES = [
  { id: 'chama_acesa',      emoji: '🔥', nome: 'Chama Acesa',      desc: '7 dias de streak' },
  { id: 'disciplina_rara',  emoji: '💎', nome: 'Disciplina Rara',   desc: '30 dias de streak' },
  { id: 'vulcao',           emoji: '🌋', nome: 'Vulcão',            desc: '60 dias de streak' },
  { id: 'lenda_viva',       emoji: '⚡', nome: 'Lenda Viva',        desc: '100 dias de streak' },
  { id: 'primeiro_rascunho', emoji: '✍️', nome: 'Primeiro Rascunho', desc: '1ª redação enviada' },
  { id: 'redator_em_forma', emoji: '📝', nome: 'Redator em Forma',  desc: '10 redações enviadas' },
  { id: 'redator_elite',    emoji: '🖊️', nome: 'Redator de Elite',  desc: 'Nota acima de 900' },
  { id: 'nota_1000',        emoji: '👑', nome: 'Nota 1000',         desc: 'Redação nota máxima' },
  { id: 'estrela_ascensao', emoji: '⭐', nome: 'Estrela em Ascensão', desc: 'Top 100 do ranking' },
  { id: 'mestre_matematica', emoji: '📐', nome: 'Mestre da Régua',  desc: 'Acerto >85% em Matemática' },
]

// ── DIAS ATÉ O ENEM ───────────────────────────────────────────────
function diasParaEnem() {
  const enem = new Date('2026-11-08T08:00:00')
  const hoje = new Date()
  return Math.max(0, Math.ceil((enem - hoje) / (1000 * 60 * 60 * 24)))
}

export default function Progresso({ navigate }) {
  const nome     = getUserName()
  const avatar   = getUserAvatar()
  const xp       = getXP()
  const nivel    = getNivel()
  const xpProg   = getXPProgress()
  const streak   = getStreak()
  const maxStreak = getMaxStreak()
  const diag     = getDiagnostico()
  const stats    = getStatsQuestoes()
  const redacoes = getRedacoes()
  const badges   = getBadges()
  const carta    = getCartaEnem()
  const plan     = getPlanStatus()
  const dias     = diasParaEnem()

  // Calculate estimated note from diag + evolution
  const notaInicial = diag?.nota_estimada_atual || 0
  const taxaAtual   = stats.taxa || 0
  const notaEst     = notaInicial > 0
    ? Math.round(notaInicial + (taxaAtual - 50) * 2)
    : (taxaAtual > 0 ? Math.round(400 + taxaAtual * 5) : null)

  const metaOriginal = diag?.meta_realista || diag?.respostas?.meta_nota || null
  const gap = notaEst && metaOriginal ? metaOriginal - notaEst : null

  // Radar data: use initial scores from diag
  const radarData = diag?.pontuacoes_iniciais || { linguagens: 50, humanas: 50, natureza: 50, matematica: 50, redacao: 50 }

  const NIVEL_CORES = ['#4A4A5A', '#00C853', '#FF8C00', '#FF4500', '#C9A84C']
  const nivelCor = NIVEL_CORES[nivel.nivel - 1]

  return (
    <div className="min-h-screen px-4 pt-6 pb-8 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('home')}
          className="text-sm font-inter opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: '#8A8A9A' }}>
          ← Voltar
        </button>
      </div>

      <h1 className="font-bebas text-4xl tracking-[2px] mb-1" style={{ color: '#F0EDE8' }}>
        MEU <span style={{ color: '#FF4500' }}>PROGRESSO</span>
      </h1>
      <p className="text-xs font-inter mb-5" style={{ color: '#4A4A5A' }}>
        Faltam <span style={{ color: '#FF8C00' }}>{dias} dias</span> para o ENEM 2026
      </p>

      {/* Score card */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111118', border: '1px solid #1E1E2E', borderTop: '2px solid #FF4500' }}>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="font-bebas text-3xl leading-none" style={{ color: notaEst ? '#F0EDE8' : '#4A4A5A' }}>
              {notaEst || '—'}
            </p>
            <p className="text-[9px] font-barlow uppercase tracking-widest mt-1" style={{ color: '#4A4A5A' }}>
              NOTA HOJE (EST.)
            </p>
          </div>
          <div>
            <p className="font-bebas text-3xl leading-none"
              style={{ color: gap === null ? '#4A4A5A' : gap <= 0 ? '#00C853' : '#FF8C00' }}>
              {gap === null ? '—' : gap <= 0 ? '✅' : `+${gap}`}
            </p>
            <p className="text-[9px] font-barlow uppercase tracking-widest mt-1" style={{ color: '#4A4A5A' }}>
              PARA META
            </p>
          </div>
          <div>
            <p className="font-bebas text-3xl leading-none" style={{ color: '#C9A84C' }}>
              {metaOriginal || '—'}
            </p>
            <p className="text-[9px] font-barlow uppercase tracking-widest mt-1" style={{ color: '#4A4A5A' }}>
              META
            </p>
          </div>
        </div>
        {gap !== null && (
          <div className="mt-3">
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1E1E2E' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(0, notaEst / metaOriginal * 100))}%`,
                  background: gap <= 0 ? '#00C853' : 'linear-gradient(to right, #FF4500, #FF8C00)'
                }} />
            </div>
            <p className="text-[10px] font-inter mt-1 text-center" style={{ color: '#4A4A5A' }}>
              {gap <= 0 ? 'Meta atingida! Agora mantenha.' : `${Math.round((notaEst / metaOriginal) * 100)}% do caminho`}
            </p>
          </div>
        )}
      </div>

      {/* XP Level */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111118', border: '1px solid #1E1E2E' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-bebas text-lg leading-none" style={{ color: nivelCor }}>{nivel.nome}</p>
            <p className="text-[10px] font-barlow uppercase tracking-wider" style={{ color: '#4A4A5A' }}>
              NÍVEL {nivel.nivel} — {xp.toLocaleString('pt-BR')} XP
            </p>
          </div>
          <div className="text-right">
            <p className="font-bebas text-2xl" style={{ color: nivelCor }}>{nivel.nivel}</p>
          </div>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1E1E2E' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${xpProg.pct}%`, background: `linear-gradient(to right, ${nivelCor}88, ${nivelCor})` }} />
        </div>
        <p className="text-[10px] font-inter mt-1 text-right" style={{ color: '#4A4A5A' }}>
          {nivel.nivel < 5 ? `${xpProg.xpAtual} / ${xpProg.xpTotal} XP para próximo nível` : 'Nível máximo atingido!'}
        </p>
      </div>

      {/* Radar */}
      {diag && (
        <div className="rounded-xl p-4 mb-4 flex flex-col items-center"
          style={{ background: '#111118', border: '1px solid #1E1E2E' }}>
          <p className="text-[10px] font-barlow font-semibold uppercase tracking-widest mb-2" style={{ color: '#4A4A5A' }}>
            MAPA DE COMPETÊNCIAS ENEM
          </p>
          <RadarChart data={radarData} size={220} />
          <p className="text-[10px] font-inter mt-2 text-center" style={{ color: '#4A4A5A' }}>
            Diagnóstico de {new Date(diag.dataDiagnostico).toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111118', border: '1px solid #1E1E2E' }}>
        <p className="font-bebas text-lg mb-3 tracking-wide" style={{ color: '#F0EDE8' }}>
          📊 ESTATÍSTICAS DE QUESTÕES
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatMini label="Respondidas" value={stats.total} />
          <StatMini label="Acertos" value={stats.acertos} color="#00C853" />
          <StatMini label="Taxa" value={`${stats.taxa}%`} color={stats.taxa >= 70 ? '#00C853' : stats.taxa >= 50 ? '#FF8C00' : '#FF2D55'} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatMini label="Streak atual" value={`${streak.count}🔥`} color="#FF8C00" />
          <StatMini label="Maior streak" value={`${maxStreak}🏆`} color="#C9A84C" />
        </div>

        {/* Per-subject accuracy */}
        {Object.keys(stats.porMateria).length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-barlow uppercase tracking-widest mb-2" style={{ color: '#4A4A5A' }}>
              POR MATÉRIA
            </p>
            {Object.entries(stats.porMateria).sort((a, b) => b[1].total - a[1].total).slice(0, 5).map(([mat, s]) => {
              const taxa = Math.round((s.acertos / s.total) * 100)
              const cor = taxa >= 70 ? '#00C853' : taxa >= 50 ? '#FF8C00' : '#FF2D55'
              return (
                <div key={mat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-inter capitalize" style={{ color: '#8A8A9A' }}>{mat}</span>
                    <span className="text-xs font-inter font-bold" style={{ color: cor }}>{taxa}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: '#1E1E2E' }}>
                    <div className="h-full rounded-full" style={{ width: `${taxa}%`, background: cor }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Redações */}
      {redacoes.length > 0 && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#111118', border: '1px solid #1E1E2E' }}>
          <p className="font-bebas text-lg mb-3 tracking-wide" style={{ color: '#F0EDE8' }}>
            ✍️ ÚLTIMAS REDAÇÕES
          </p>
          {redacoes.slice(0, 3).map((r) => {
            const cor = r.nota_total >= 800 ? '#00C853' : r.nota_total >= 600 ? '#FF8C00' : '#FF2D55'
            return (
              <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-b-0"
                style={{ borderColor: '#1E1E2E' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-inter font-medium truncate" style={{ color: '#F0EDE8' }}>
                    {r.tema || 'Redação'}
                  </p>
                  <p className="text-[10px] font-inter" style={{ color: '#4A4A5A' }}>
                    {new Date(r.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-bebas text-2xl leading-none" style={{ color: cor }}>{r.nota_total}</p>
                  <p className="text-[9px] font-barlow uppercase" style={{ color: '#4A4A5A' }}>/ 1000</p>
                </div>
              </div>
            )
          })}
          <button onClick={() => navigate('redacao')}
            className="w-full mt-3 py-2 rounded-lg text-xs font-inter font-semibold text-center transition-all"
            style={{ background: '#1A1A26', color: '#FF4500' }}>
            + Nova redação
          </button>
        </div>
      )}

      {/* Badges */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111118', border: '1px solid #1E1E2E' }}>
        <p className="font-bebas text-lg mb-3 tracking-wide" style={{ color: '#F0EDE8' }}>
          🏆 CONQUISTAS
        </p>
        {badges.length === 0 ? (
          <p className="text-sm font-inter text-center py-4" style={{ color: '#4A4A5A' }}>
            Nenhuma conquista ainda. Continue estudando!
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-3 mb-3">
            {ALL_BADGES.filter(b => badges.includes(b.id)).map(b => (
              <div key={b.id} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: '#1E1E2E', border: '1px solid #FF4500' }}>
                  {b.emoji}
                </div>
                <p className="text-[9px] font-inter text-center leading-tight" style={{ color: '#8A8A9A' }}>
                  {b.nome}
                </p>
              </div>
            ))}
          </div>
        )}
        {/* Locked badges */}
        {ALL_BADGES.filter(b => !badges.includes(b.id)).length > 0 && (
          <>
            <p className="text-[10px] font-barlow uppercase tracking-widest mb-2" style={{ color: '#2A2A3A' }}>
              A DESBLOQUEAR
            </p>
            <div className="grid grid-cols-4 gap-3">
              {ALL_BADGES.filter(b => !badges.includes(b.id)).slice(0, 4).map(b => (
                <div key={b.id} className="flex flex-col items-center gap-1 opacity-30">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: '#0A0A0F', border: '1px solid #1E1E2E' }}>
                    🔒
                  </div>
                  <p className="text-[9px] font-inter text-center leading-tight" style={{ color: '#4A4A5A' }}>
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Carta ao ENEM */}
      {carta ? (
        <div className="rounded-xl p-4 mb-4"
          style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <p className="font-bebas text-lg mb-2 tracking-wide" style={{ color: '#C9A84C' }}>
            📬 MINHA CARTA AO ENEM
          </p>
          <p className="text-xs font-inter mb-3" style={{ color: '#4A4A5A' }}>
            Escrita em {new Date(carta.data).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-sm font-inter leading-relaxed italic" style={{ color: '#8A8A9A' }}>
            "{carta.texto.slice(0, 200)}{carta.texto.length > 200 ? '...' : ''}"
          </p>
        </div>
      ) : (
        <div className="rounded-xl p-4 mb-4"
          style={{ background: '#111118', border: '1px dashed #2A2A3A' }}>
          <p className="font-inter text-sm text-center" style={{ color: '#4A4A5A' }}>
            📬 Você ainda não escreveu sua Carta ao ENEM.<br />
            <span style={{ color: '#FF4500' }}>Complete o diagnóstico para guardar sua carta.</span>
          </p>
        </div>
      )}

      {/* Plan upgrade CTA */}
      {!plan.ativo && (
        <button onClick={() => navigate('planos')}
          className="w-full py-4 rounded-xl font-bebas text-xl tracking-wider transition-all animate-ctaPulse"
          style={{ background: 'linear-gradient(135deg, #FF4500, #FF8C00)', color: '#fff', boxShadow: '0 0 20px rgba(255,69,0,0.3)' }}>
          🔓 DESBLOQUEAR MODO CAVERNA PRO
        </button>
      )}
    </div>
  )
}

function StatMini({ label, value, color = '#F0EDE8' }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: '#0A0A0F', border: '1px solid #1E1E2E' }}>
      <p className="font-bebas text-xl leading-none" style={{ color }}>{value}</p>
      <p className="text-[9px] font-barlow uppercase tracking-wide mt-1" style={{ color: '#4A4A5A' }}>{label}</p>
    </div>
  )
}
