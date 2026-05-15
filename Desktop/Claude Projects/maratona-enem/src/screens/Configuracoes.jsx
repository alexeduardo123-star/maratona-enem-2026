import { useState } from 'react'
import {
  getUserName, setUserName,
  getUserAvatar, setUserAvatar,
  getDailyGoal, setDailyGoal,
  getPoints,
  getStreak,
  getNivel,
  storage,
  resetAll,
  getPlanStatus,
  getReferralCode,
  getIndicacoes,
} from '../utils/storage'

const AVATARS = ['🧑‍🎓', '👨‍💻', '👩‍🔬', '🦁', '🐉', '🚀', '🎯', '💡', '🔥', '⭐', '🎮', '🏆']
const GOALS = [5, 10, 15, 20]

export default function Configuracoes({ navigate }) {
  const [name, setName] = useState(getUserName())
  const [avatar, setAvatar] = useState(getUserAvatar())
  const [goal, setGoal] = useState(getDailyGoal())
  const [notifications, setNotifications] = useState(storage.get('notifications', false))
  const [showReset, setShowReset] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const plan = getPlanStatus()
  const nivel = getNivel()
  const referralCode = getReferralCode()
  const indicacoes = getIndicacoes()

  const handleCopyReferral = () => {
    const link = `maratonaenem.com.br?ref=${referralCode}`
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const PLAN_LABEL = {
    trial: { label: `Trial ativo (${plan.diasRestantes || 0} dias)`, color: '#00C853', btn: 'Ver Planos' },
    pro:   { label: '🔥 Modo Caverna Pro',    color: '#FF4500', btn: 'Gerenciar' },
    elite: { label: '👑 Topo da Caverna Elite', color: '#C9A84C', btn: 'Gerenciar' },
    free:  { label: '🆓 Plano gratuito — Limitado', color: '#4A4A5A', btn: '🔓 Upgrade Agora' },
  }
  const planInfo = PLAN_LABEL[plan.plano] || PLAN_LABEL.free

  const handleSave = () => {
    setUserName(name.trim() || 'Estudante')
    setUserAvatar(avatar)
    setDailyGoal(goal)
    storage.set('notifications', notifications)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    resetAll()
    window.location.reload()
  }

  const points = getPoints()
  const streak = getStreak()

  return (
    <div className="min-h-screen px-4 pt-6 pb-4 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      <h1 className="font-bebas text-4xl mb-1 tracking-[2px]" style={{ color: '#F0EDE8' }}>
        Configurações
      </h1>
      <p className="text-xs font-inter mb-4" style={{ color: '#8A8A9A' }}>
        Personalize sua experiência na caverna
      </p>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatBox label="Pontos" value={points.toLocaleString('pt-BR')} color="#C9A84C" />
        <StatBox label="Streak" value={`${streak.count}🔥`} color="#FF8C00" />
        <StatBox label="Nível" value={`Nv.${nivel.nivel}`} color="#F0EDE8" />
      </div>

      {/* Current Plan */}
      <div className="rounded-xl p-4 mb-4 flex items-center justify-between"
        style={{ background: '#111118', border: `1px solid ${planInfo.color}44`, borderLeft: `3px solid ${planInfo.color}` }}>
        <div>
          <p className="text-[10px] font-barlow uppercase tracking-widest mb-0.5" style={{ color: '#4A4A5A' }}>
            SEU PLANO ATUAL
          </p>
          <p className="font-inter font-semibold text-sm" style={{ color: planInfo.color }}>
            {planInfo.label}
          </p>
        </div>
        <button onClick={() => navigate('planos')}
          className="px-3 py-2 rounded-lg font-bebas text-sm transition-all"
          style={{ background: 'rgba(255,69,0,0.15)', color: '#FF4500', border: '1px solid rgba(255,69,0,0.3)' }}>
          {planInfo.btn}
        </button>
      </div>

      {/* Referral */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111118', border: '1px solid #1E1E2E' }}>
        <p className="text-[10px] font-barlow uppercase tracking-widest mb-1" style={{ color: '#4A4A5A' }}>
          INDICAÇÃO VIRAL — GANHE RECOMPENSAS
        </p>
        <p className="text-xs font-inter mb-3" style={{ color: '#8A8A9A' }}>
          Indique 3 amigos → 1 mês Pro grátis • {indicacoes.convertidos}/3 convertidos
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg px-3 py-2 font-mono text-sm"
            style={{ background: '#0A0A0F', border: '1px solid #2A2A3A', color: '#FF8C00' }}>
            maratonaenem.com.br?ref={referralCode}
          </div>
          <button onClick={handleCopyReferral}
            className="shrink-0 px-3 py-2 rounded-lg font-bebas text-sm transition-all"
            style={copied
              ? { background: '#00C853', color: '#fff' }
              : { background: '#FF4500', color: '#fff' }}>
            {copied ? '✓' : 'Copiar'}
          </button>
        </div>
        {indicacoes.convertidos >= 1 && (
          <p className="text-[10px] font-inter mt-2 text-center" style={{ color: '#00C853' }}>
            ✅ {indicacoes.convertidos} amigo{indicacoes.convertidos !== 1 ? 's' : ''} convertido{indicacoes.convertidos !== 1 ? 's' : ''}!
          </p>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {/* Name */}
        <Section title="Nome de usuário">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={24}
            placeholder="Seu nome"
            className="w-full rounded-xl px-4 py-3 text-sm font-inter outline-none transition-all"
            style={{ background: '#111118', border: '1px solid #2A2A3A', color: '#F0EDE8' }}
            onFocus={e => {
              e.target.style.borderColor = '#FF4500'
              e.target.style.boxShadow = '0 0 0 2px rgba(255,69,0,0.15)'
            }}
            onBlur={e => {
              e.target.style.borderColor = '#2A2A3A'
              e.target.style.boxShadow = 'none'
            }}
          />
        </Section>

        {/* Avatar */}
        <Section title="Avatar">
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className="aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-150"
                style={
                  avatar === a
                    ? { background: '#1E0D00', border: '2px solid #FF4500', transform: 'scale(1.1)' }
                    : { background: '#111118', border: '1px solid #1E1E2E' }
                }
              >
                {a}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 rounded-xl p-3"
               style={{ background: '#1A1A26' }}>
            <span className="text-4xl">{avatar}</span>
            <div>
              <p className="font-inter font-semibold text-sm" style={{ color: '#F0EDE8' }}>
                {name || 'Estudante'}
              </p>
              <p className="text-xs font-inter" style={{ color: '#8A8A9A' }}>Preview do seu perfil</p>
            </div>
          </div>
        </Section>

        {/* Daily goal */}
        <Section title="Meta diária de questões">
          <div className="grid grid-cols-4 gap-2">
            {GOALS.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className="py-3 rounded-xl font-bebas text-xl transition-all duration-150"
                style={
                  goal === g
                    ? { background: '#FF4500', color: '#fff', boxShadow: '0 0 20px rgba(255,69,0,0.3)' }
                    : { background: '#111118', border: '1px solid #2A2A3A', color: '#8A8A9A' }
                }
              >
                {g}q
              </button>
            ))}
          </div>
          <p className="text-xs font-inter mt-2" style={{ color: '#4A4A5A' }}>
            Meta atual:{' '}
            <span style={{ color: '#FF4500' }}>{goal} questões/dia</span>
          </p>
        </Section>

        {/* Notifications */}
        <Section title="Notificações">
          <div className="flex items-center justify-between rounded-xl p-4" style={{ background: '#111118' }}>
            <div>
              <p className="text-sm font-inter font-medium" style={{ color: '#F0EDE8' }}>
                Lembretes de estudo
              </p>
              <p className="text-xs font-inter" style={{ color: '#8A8A9A' }}>Receba alertas diários</p>
            </div>
            <button
              onClick={() => setNotifications(n => !n)}
              className="w-12 h-6 rounded-full transition-all duration-200 relative"
              style={{ background: notifications ? '#FF4500' : '#2A2A3A' }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
                style={{ left: notifications ? '1.375rem' : '0.125rem' }}
              />
            </button>
          </div>
          {notifications && (
            <p className="text-[10px] font-inter mt-2 text-center" style={{ color: '#4A4A5A' }}>
              (Simulado — notificações reais requerem configuração PWA)
            </p>
          )}
        </Section>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-xl font-bebas text-xl tracking-wider transition-all duration-200"
          style={
            saved
              ? { background: '#00C853', color: '#fff' }
              : { background: 'linear-gradient(135deg, #FF4500, #FF8C00)', color: '#fff', boxShadow: '0 0 20px rgba(255,69,0,0.3)' }
          }
        >
          {saved ? '✅ SALVO!' : '💾 SALVAR CONFIGURAÇÕES'}
        </button>

        {/* About */}
        <Section title="Sobre o App">
          <div className="rounded-xl p-4 space-y-2 border border-[#1E1E2E]" style={{ background: '#111118' }}>
            <InfoRow label="Versão" value="1.0.0" />
            <InfoRow label="ENEM 2026" value="8 e 9 de novembro de 2026" />
            <InfoRow label="Desenvolvido com" value="React + Vite + Tailwind" />
            <InfoRow label="IA" value="Claude AI (Anthropic)" />
            <InfoRow label="Dados" value="localStorage (local)" />
          </div>
        </Section>

        {/* Reset */}
        <Section title="Zona de Perigo">
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="w-full py-3 rounded-xl font-bebas text-lg transition-all"
              style={{ border: '1px solid rgba(255,45,85,0.4)', color: '#FF2D55', background: '#1A0005' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#FF2D55'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#1A0005'
                e.currentTarget.style.color = '#FF2D55'
              }}
            >
              🗑️ RESETAR TODO O PROGRESSO
            </button>
          ) : (
            <div className="rounded-xl p-4" style={{ background: '#1A0005', border: '1px solid rgba(255,45,85,0.4)' }}>
              <p className="font-inter font-semibold text-sm mb-1" style={{ color: '#FF2D55' }}>
                Tem certeza?
              </p>
              <p className="text-xs font-inter mb-4" style={{ color: '#8A8A9A' }}>
                Isso apagará TODOS os seus pontos, streak, progresso e configurações. Essa ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReset(false)}
                  className="flex-1 py-2.5 rounded-xl font-bebas text-base transition-all"
                  style={{ border: '1px solid #2A2A3A', color: '#8A8A9A' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl font-bebas text-base transition-all"
                  style={{ background: '#FF2D55', color: '#fff' }}
                >
                  Sim, resetar!
                </button>
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[11px] font-barlow font-semibold uppercase tracking-[2px] mb-2"
         style={{ color: '#4A4A5A' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="rounded-xl p-3 text-center border border-[#1E1E2E]" style={{ background: '#111118' }}>
      <p className="font-bebas text-2xl leading-none" style={{ color }}>{value}</p>
      <p className="text-[9px] font-barlow font-semibold uppercase tracking-wide mt-0.5" style={{ color: '#4A4A5A' }}>
        {label}
      </p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-inter" style={{ color: '#4A4A5A' }}>{label}</span>
      <span className="text-xs font-inter" style={{ color: '#8A8A9A' }}>{value}</span>
    </div>
  )
}
