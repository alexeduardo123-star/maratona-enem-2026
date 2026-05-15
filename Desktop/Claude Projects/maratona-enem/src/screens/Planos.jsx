import { useState } from 'react'
import { getPlanStatus, setPlan, addXP } from '../utils/storage'

const PLANOS = [
  {
    id: 'free',
    nome: 'EXPLORADOR',
    sub: 'da Caverna',
    emoji: '🆓',
    preco: null,
    cor: '#4A4A5A',
    borda: '#2A2A3A',
    features: [
      { ok: true,  txt: '3 matérias à sua escolha' },
      { ok: true,  txt: '5 questões por dia' },
      { ok: true,  txt: '1 análise de redação por mês' },
      { ok: true,  txt: 'Ranking geral' },
      { ok: false, txt: 'Diagnóstico IA completo' },
      { ok: false, txt: 'Trilha personalizada' },
      { ok: false, txt: 'Simulados completos' },
      { ok: false, txt: 'Questões ilimitadas' },
    ],
  },
  {
    id: 'pro',
    nome: 'MODO CAVERNA',
    sub: 'Ativo',
    emoji: '🔥',
    preco: 'R$ 19,90',
    precoAnual: 'R$ 179/ano',
    descAnual: '25% off',
    cor: '#FF4500',
    borda: '#FF4500',
    destaque: true,
    features: [
      { ok: true, txt: 'Todas as 14 matérias liberadas' },
      { ok: true, txt: 'Questões ilimitadas' },
      { ok: true, txt: '10 análises de redação por mês' },
      { ok: true, txt: 'Diagnóstico IA completo + trilha' },
      { ok: true, txt: 'Spaced Repetition automático' },
      { ok: true, txt: '2 simulados completos/mês' },
      { ok: true, txt: 'Desafios da Alcateia' },
      { ok: false, txt: 'Redações ilimitadas' },
    ],
  },
  {
    id: 'elite',
    nome: 'TOPO DA',
    sub: 'Caverna',
    emoji: '👑',
    preco: 'R$ 49,90',
    precoAnual: 'R$ 399/ano',
    descAnual: '33% off',
    cor: '#C9A84C',
    borda: '#C9A84C',
    features: [
      { ok: true, txt: 'Tudo do Pro' },
      { ok: true, txt: 'Redações ilimitadas + feedback avançado' },
      { ok: true, txt: 'Simulados ilimitados com gabarito IA' },
      { ok: true, txt: 'Mentoria em grupo mensal (ao vivo)' },
      { ok: true, txt: 'Relatório mensal PDF por e-mail' },
      { ok: true, txt: 'Badge 👑 ELITE no ranking' },
      { ok: true, txt: 'Pelotão VIP (< 10 pessoas)' },
      { ok: true, txt: 'Certificados com QR code verificável' },
    ],
  },
]

export default function Planos({ navigate }) {
  const planStatus = getPlanStatus()
  const [selected, setSelected] = useState('pro')
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)

  const handleAssinar = () => {
    if (selected === 'free') return
    setConfirming(true)
  }

  const handleConfirm = () => {
    setPlan(selected)
    addXP(100)
    setConfirming(false)
    setDone(true)
  }

  const planLabel = {
    trial: { color: '#00C853', bg: 'rgba(0,200,83,0.1)', borda: 'rgba(0,200,83,0.3)', txt: '🟢 Trial ativo' },
    pro:   { color: '#FF4500', bg: 'rgba(255,69,0,0.1)',   borda: 'rgba(255,69,0,0.3)',   txt: '🔥 Modo Caverna Pro' },
    elite: { color: '#C9A84C', bg: 'rgba(201,168,76,0.1)', borda: 'rgba(201,168,76,0.3)', txt: '👑 Topo da Caverna' },
    free:  { color: '#4A4A5A', bg: 'rgba(74,74,90,0.1)',   borda: 'rgba(74,74,90,0.3)',   txt: '🆓 Plano gratuito' },
  }

  const pLabel = planLabel[planStatus.plano] || planLabel.free

  return (
    <div className="min-h-screen px-4 pt-6 pb-8 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      {/* Header */}
      <button onClick={() => navigate('configuracoes')}
        className="text-sm font-inter mb-4 opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: '#8A8A9A' }}>
        ← Voltar
      </button>

      <h1 className="font-bebas text-4xl tracking-[2px] mb-1" style={{ color: '#F0EDE8' }}>
        ESCOLHA SEU<br /><span style={{ color: '#FF4500' }}>MODO DE BATALHA</span>
      </h1>
      <p className="text-sm font-inter mb-4" style={{ color: '#8A8A9A' }}>
        O cursinho custa R$ 800/mês. A Caverna custa R$ 19,90.
      </p>

      {/* Current plan */}
      <div className="rounded-xl p-3 mb-6 text-center"
        style={{ background: pLabel.bg, border: `1px solid ${pLabel.borda}` }}>
        {planStatus.trial ? (
          <p className="font-inter text-sm font-semibold" style={{ color: pLabel.color }}>
            {pLabel.txt} — {planStatus.diasRestantes} dia{planStatus.diasRestantes !== 1 ? 's' : ''} restante{planStatus.diasRestantes !== 1 ? 's' : ''}
          </p>
        ) : (
          <p className="font-inter text-sm font-semibold" style={{ color: pLabel.color }}>
            {pLabel.txt}
          </p>
        )}
        {!planStatus.ativo && (
          <p className="text-xs font-inter mt-1" style={{ color: '#FF2D55' }}>
            Seu trial expirou. Você está com acesso limitado.
          </p>
        )}
      </div>

      {/* Plan cards */}
      {!done ? (
        <>
          <div className="flex flex-col gap-4 mb-6">
            {PLANOS.map((plano) => (
              <button key={plano.id} onClick={() => plano.id !== 'free' && setSelected(plano.id)}
                className="text-left rounded-xl p-4 transition-all duration-200 w-full"
                style={{
                  background: selected === plano.id ? 'rgba(255,69,0,0.08)' : '#111118',
                  border: `2px solid ${selected === plano.id ? plano.borda : '#1E1E2E'}`,
                  boxShadow: selected === plano.id ? `0 0 20px ${plano.cor}22` : 'none',
                }}>
                {plano.destaque && (
                  <div className="inline-block px-2 py-0.5 rounded text-[10px] font-barlow font-bold uppercase tracking-wider mb-2"
                    style={{ background: '#FF4500', color: '#fff' }}>
                    MAIS POPULAR
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-2xl">{plano.emoji}</span>
                      <div>
                        <p className="font-bebas text-xl leading-none tracking-wider" style={{ color: plano.cor }}>
                          {plano.nome}
                        </p>
                        <p className="font-bebas text-sm leading-none" style={{ color: '#4A4A5A' }}>
                          {plano.sub}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {plano.preco ? (
                      <>
                        <p className="font-bebas text-2xl leading-none" style={{ color: plano.cor }}>{plano.preco}</p>
                        <p className="text-[10px] font-inter" style={{ color: '#4A4A5A' }}>/mês</p>
                        <p className="text-[10px] font-inter font-semibold mt-1"
                          style={{ color: plano.cor === '#FF4500' ? '#FF8C00' : plano.cor }}>
                          {plano.precoAnual} <span style={{ color: '#00C853' }}>({plano.descAnual})</span>
                        </p>
                      </>
                    ) : (
                      <p className="font-bebas text-2xl" style={{ color: '#4A4A5A' }}>GRÁTIS</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  {plano.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="shrink-0 text-xs mt-0.5" style={{ color: f.ok ? '#00C853' : '#2A2A3A' }}>
                        {f.ok ? '✓' : '✗'}
                      </span>
                      <span className="text-xs font-inter" style={{ color: f.ok ? '#B0ADAA' : '#3A3A4A' }}>
                        {f.txt}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {selected !== 'free' && (
            <button onClick={handleAssinar}
              className="w-full py-4 rounded-xl font-bebas text-2xl tracking-wider transition-all animate-ctaPulse"
              style={{ background: 'linear-gradient(135deg, #FF4500, #FF8C00)', color: '#fff', boxShadow: '0 0 25px rgba(255,69,0,0.35)' }}>
              ASSINAR {PLANOS.find(p => p.id === selected)?.nome} ⚔️
            </button>
          )}

          <p className="text-center text-xs font-inter mt-3" style={{ color: '#2A2A3A' }}>
            Sem contrato. Cancele quando quiser.
          </p>

          {/* Paywall copy */}
          {!planStatus.ativo && (
            <div className="mt-4 rounded-xl p-4 text-center"
              style={{ background: 'rgba(255,69,0,0.06)', border: '1px solid rgba(255,69,0,0.2)' }}>
              <p className="font-bebas text-xl mb-1" style={{ color: '#FF4500' }}>
                Você provou que consegue.
              </p>
              <p className="text-sm font-inter" style={{ color: '#8A8A9A' }}>
                Agora vá até o fim.<br />Pare de estudar com uma mão amarrada nas costas.
              </p>
            </div>
          )}

          {/* Confirm modal */}
          {confirming && (
            <div className="fixed inset-0 flex items-end justify-center z-50"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setConfirming(false)}>
              <div className="w-full max-w-[430px] rounded-t-2xl p-6 animate-fadeUp"
                style={{ background: '#111118', border: '1px solid #2A2A3A' }}
                onClick={e => e.stopPropagation()}>
                <h3 className="font-bebas text-2xl mb-2" style={{ color: '#F0EDE8' }}>
                  ATIVAR PLANO {selected.toUpperCase()}?
                </h3>
                <p className="text-sm font-inter mb-4" style={{ color: '#8A8A9A' }}>
                  Você será direcionado para pagamento. (Integração com gateway em breve — por ora, ativação imediata para demonstração.)
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirming(false)}
                    className="flex-1 py-3 rounded-xl font-bebas text-lg"
                    style={{ border: '1px solid #2A2A3A', color: '#8A8A9A' }}>
                    CANCELAR
                  </button>
                  <button onClick={handleConfirm}
                    className="flex-1 py-3 rounded-xl font-bebas text-lg"
                    style={{ background: 'linear-gradient(135deg, #FF4500, #FF8C00)', color: '#fff' }}>
                    CONFIRMAR
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 animate-fadeUp">
          <div className="font-bebas text-7xl mb-4">
            {selected === 'elite' ? '👑' : '🔥'}
          </div>
          <h2 className="font-bebas text-4xl mb-3 tracking-[2px]" style={{ color: '#F0EDE8' }}>
            PLANO ATIVADO!
          </h2>
          <p className="font-inter text-base mb-2" style={{ color: '#8A8A9A' }}>
            Bem-vindo ao {selected === 'elite' ? 'Topo da Caverna.' : 'Modo Caverna Ativo.'}
          </p>
          <p className="font-bebas text-xl mb-8" style={{ color: '#FF8C00' }}>
            Agora vá até o fim. ⚡
          </p>
          <button onClick={() => navigate('home')}
            className="w-full max-w-xs mx-auto py-4 rounded-xl font-bebas text-xl"
            style={{ background: 'linear-gradient(135deg, #FF4500, #FF8C00)', color: '#fff' }}>
            VOLTAR AO INÍCIO
          </button>
        </div>
      )}
    </div>
  )
}
