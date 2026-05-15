import { useState, useEffect } from 'react'
import RadarChart from '../components/RadarChart'
import { setDiagnostico, setDiagnosticoFeito, setUserName, setUserAvatar, addXP, initTrial, setCartaEnem } from '../utils/storage'

// ── PROMPT ────────────────────────────────────────────────────────
const SYSTEM = `Você é o sistema de diagnóstico da Maratona ENEM 2026. Analise o perfil do estudante e responda APENAS com JSON válido, sem markdown, sem texto fora do JSON.`

function buildPrompt(a) {
  return `Perfil do estudante:
Nome: ${a.nome} | Idade: ${a.idade} | Situação: ${a.situacao}
Objetivo: ${a.objetivo} | Área desejada: ${a.area_desejada} | Meta de nota: ${a.meta_nota}
Fez ENEM antes: ${a.fez_enem ? 'Sim, nota ~' + a.nota_anterior : 'Não'}
Horas de estudo/dia: ${a.horas_dia} | Suporte: ${a.suporte}
Autoavaliação (1-5): Linguagens=${a.n_linguagens}, Humanas=${a.n_humanas}, Natureza=${a.n_natureza}, Matemática=${a.n_matematica}, Redação=${a.n_redacao}
Principal obstáculo: ${a.obstaculo} | Melhor período: ${a.periodo}

Gere o JSON exatamente neste formato:
{
  "pontuacoes_iniciais": {
    "linguagens": [0-100],
    "humanas": [0-100],
    "natureza": [0-100],
    "matematica": [0-100],
    "redacao": [0-100]
  },
  "nota_estimada_atual": [400-1000],
  "meta_realista": [400-1000],
  "diagnostico_geral": "[3 parágrafos diretos: onde está, o que fazer, consequência de não agir — sem eufemismos]",
  "ponto_critico": "[a UMA coisa mais urgente que precisa resolver agora]",
  "trilha_prioritaria": [
    {"materia": "", "area": "linguagens|humanas|natureza|matematica", "urgencia": [1-5], "motivo": ""}
  ],
  "perfil_tipo": "Guerreiro Iniciante|Lutador Intermediário|Veterano da Batalha|Elite da Caverna",
  "mensagem_motivacional": "[1 frase curta e poderosa para este perfil específico]"
}`
}

// ── FALLBACK (sem API) ────────────────────────────────────────────
function calcFallback(a) {
  const toScore = (n) => Math.round(((n - 1) / 4) * 100)
  const sc = {
    linguagens: toScore(a.n_linguagens),
    humanas: toScore(a.n_humanas),
    natureza: toScore(a.n_natureza),
    matematica: toScore(a.n_matematica),
    redacao: toScore(a.n_redacao),
  }
  const media = Math.round((sc.linguagens + sc.humanas + sc.natureza + sc.matematica + sc.redacao) / 5)
  const nota = Math.round(400 + media * 5.5)
  const fracos = Object.entries(sc).sort((x, y) => x[1] - y[1]).slice(0, 3)

  return {
    pontuacoes_iniciais: sc,
    nota_estimada_atual: nota,
    meta_realista: a.meta_nota,
    diagnostico_geral: `Seu perfil foi mapeado. Você está em ${nota} pontos estimados e precisa de ${a.meta_nota - nota > 0 ? a.meta_nota - nota + ' pontos a mais' : 'manter o nível'} para sua meta.\n\nAs matérias que mais vão impactar sua nota são as que você avaliou mais baixo. Não existe atalho — existe método. A trilha foi montada exatamente para você.\n\nSe você seguir a trilha com consistência, você chega. Se esperar a "hora certa", o ENEM vai chegar primeiro.`,
    ponto_critico: `Foque em ${fracos[0]?.[0] || 'matemática'} como prioridade máxima.`,
    trilha_prioritaria: fracos.map(([mat, score], i) => ({
      materia: mat.charAt(0).toUpperCase() + mat.slice(1),
      area: mat,
      urgencia: 5 - i,
      motivo: `Sua autoavaliação indica que esta é uma das suas áreas mais fracas — reforçar aqui vai trazer os maiores ganhos de nota.`,
    })),
    perfil_tipo: nota >= 750 ? 'Elite da Caverna' : nota >= 600 ? 'Veterano da Batalha' : nota >= 450 ? 'Lutador Intermediário' : 'Guerreiro Iniciante',
    mensagem_motivacional: 'A maioria desiste. Você chegou até aqui. Continue.',
  }
}

// ── LOADING MESSAGES ──────────────────────────────────────────────
const LOADING_MSGS = [
  'Mapeando seu perfil...',
  'Identificando pontos cegos...',
  'Calculando sua nota estimada...',
  'Construindo sua trilha única...',
  'A Caverna tem a resposta. ⚔️',
]

// ── COMPONENT ─────────────────────────────────────────────────────
const DEFAULTS = {
  nome: '', idade: 17, situacao: 'ensino_medio',
  objetivo: 'universidade_federal', area_desejada: 'nao_sei', meta_nota: 650,
  fez_enem: false, nota_anterior: 550, horas_dia: '1a2', suporte: 'sozinho',
  n_linguagens: 3, n_humanas: 3, n_natureza: 2, n_matematica: 2, n_redacao: 3,
  obstaculo: 'procrastinacao', periodo: 'noite',
}

export default function Diagnostico({ onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(DEFAULTS)
  const [loadMsg, setLoadMsg] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [cartaTexto, setCartaTexto] = useState('')
  const [showCarta, setShowCarta] = useState(false)
  const [error, setError] = useState('')

  const set = (key, val) => setAnswers(p => ({ ...p, [key]: val }))

  // Cycle loading messages
  useEffect(() => {
    if (step !== 6) return
    const id = setInterval(() => setLoadMsg(m => (m + 1) % LOADING_MSGS.length), 1100)
    return () => clearInterval(id)
  }, [step])

  const callAI = async () => {
    setStep(6)
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) {
      await new Promise(r => setTimeout(r, 3000))
      finish(calcFallback(answers))
      return
    }
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          system: SYSTEM,
          messages: [{ role: 'user', content: buildPrompt(answers) }],
        }),
      })
      const data = await res.json()
      const raw = data?.content?.[0]?.text || ''
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('no json')
      finish(JSON.parse(match[0]))
    } catch {
      finish(calcFallback(answers))
    }
  }

  const finish = (res) => {
    setResultado(res)
    setStep(7)
  }

  const handleComplete = () => {
    const diag = resultado
    setDiagnostico({ ...diag, respostas: answers })
    setDiagnosticoFeito()
    setUserName(answers.nome || 'Estudante')
    initTrial()
    addXP(50)
    if (cartaTexto.trim()) setCartaEnem(cartaTexto)
    onComplete()
  }

  // ── RENDERS ───────────────────────────────────────────────────
  const TOTAL_STEPS = 5

  const ProgressBar = () => (
    step >= 1 && step <= 5 ? (
      <div className="w-full h-1 rounded-full mb-6 overflow-hidden" style={{ background: '#1E1E2E' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: 'linear-gradient(to right, #FF4500, #FF8C00)' }} />
      </div>
    ) : null
  )

  const Back = ({ toStep }) => (
    <button onClick={() => setStep(toStep)}
      className="text-sm font-inter mb-4 transition-opacity hover:opacity-100 opacity-50"
      style={{ color: '#8A8A9A' }}>
      ← Voltar
    </button>
  )

  const Next = ({ label = 'CONTINUAR →', onClick, disabled = false }) => (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-4 rounded-xl font-bebas text-xl tracking-wider transition-all duration-200 mt-4"
      style={disabled
        ? { background: '#1E1E2E', color: '#4A4A5A', cursor: 'not-allowed' }
        : { background: 'linear-gradient(135deg, #FF4500, #FF8C00)', color: '#fff', boxShadow: '0 0 20px rgba(255,69,0,0.25)' }}>
      {label}
    </button>
  )

  const Label = ({ children }) => (
    <p className="text-[11px] font-barlow font-semibold uppercase tracking-widest mb-2" style={{ color: '#4A4A5A' }}>
      {children}
    </p>
  )

  const inputStyle = {
    background: '#111118', border: '1px solid #2A2A3A', color: '#F0EDE8',
    outline: 'none', borderRadius: '12px', padding: '12px 16px',
    fontSize: '14px', fontFamily: 'Inter, sans-serif', width: '100%',
  }

  const selectStyle = { ...inputStyle }

  const SliderRow = ({ label, emoji, valKey }) => {
    const v = answers[valKey]
    const emojis = ['❄️', '🧊', '🌤️', '🔥', '🌋']
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-inter" style={{ color: '#F0EDE8' }}>{label}</span>
          <span className="text-lg">{emojis[v - 1]}</span>
        </div>
        <input type="range" min="1" max="5" step="1" value={v}
          onChange={e => set(valKey, parseInt(e.target.value))}
          style={{ accentColor: '#FF4500', width: '100%' }} />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-inter" style={{ color: '#4A4A5A' }}>Muito fraco</span>
          <span className="text-[10px] font-inter" style={{ color: '#4A4A5A' }}>Muito forte</span>
        </div>
      </div>
    )
  }

  // ── STEP 0: WELCOME ───────────────────────────────────────────
  if (step === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center animate-screenEnter"
      style={{ background: '#0A0A0F' }}>
      <div className="mb-6">
        <div className="font-bebas text-7xl mb-2 animate-flame" style={{ color: '#FF4500' }}>🔥</div>
        <h1 className="font-bebas text-5xl tracking-[4px] leading-none text-shadow-fire" style={{ color: '#F0EDE8' }}>
          MARATONA<br /><span style={{ color: '#FF4500' }}>ENEM</span> 2026
        </h1>
      </div>
      <p className="font-inter text-base mb-2" style={{ color: '#B0ADAA' }}>
        Antes de entrar na Caverna,<br />preciso te conhecer de verdade.
      </p>
      <p className="font-inter text-sm mb-8" style={{ color: '#4A4A5A' }}>
        2 minutos. Diagnóstico personalizado com IA.<br />Nenhum app faz isso antes de jogar conteúdo.
      </p>
      <button onClick={() => setStep(1)}
        className="w-full max-w-xs py-4 rounded-xl font-bebas text-2xl tracking-wider animate-ctaPulse"
        style={{ background: 'linear-gradient(135deg, #FF4500, #FF8C00)', color: '#fff', boxShadow: '0 0 30px rgba(255,69,0,0.4)' }}>
        ENTRAR NA CAVERNA ⚔️
      </button>
      <button onClick={() => {
        setDiagnosticoFeito()
        initTrial()
        onComplete()
      }}
        className="mt-4 text-xs font-inter transition-opacity hover:opacity-100 opacity-40"
        style={{ color: '#8A8A9A' }}>
        Pular diagnóstico → entrar direto
      </button>
    </div>
  )

  // ── STEP 1: IDENTIDADE ────────────────────────────────────────
  if (step === 1) return (
    <div className="min-h-screen px-6 pt-8 pb-6 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      <ProgressBar />
      <p className="text-xs font-barlow font-semibold uppercase tracking-widest mb-1" style={{ color: '#FF4500' }}>
        PASSO 1 DE 5
      </p>
      <h2 className="font-bebas text-4xl tracking-[2px] mb-1" style={{ color: '#F0EDE8' }}>
        QUEM É VOCÊ?
      </h2>
      <p className="text-sm font-inter mb-6" style={{ color: '#8A8A9A' }}>
        Todo guerreiro tem uma história. A Caverna precisa da sua.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <Label>Seu nome</Label>
          <input style={inputStyle} placeholder="Como quer ser chamado?" value={answers.nome}
            onChange={e => set('nome', e.target.value)} maxLength={30}
            onFocus={e => { e.target.style.borderColor = '#FF4500'; e.target.style.boxShadow = '0 0 0 2px rgba(255,69,0,0.15)' }}
            onBlur={e => { e.target.style.borderColor = '#2A2A3A'; e.target.style.boxShadow = 'none' }} />
        </div>

        <div>
          <Label>Idade: {answers.idade} anos</Label>
          <input type="range" min="14" max="35" step="1" value={answers.idade}
            onChange={e => set('idade', parseInt(e.target.value))}
            style={{ accentColor: '#FF4500', width: '100%' }} />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] font-inter" style={{ color: '#4A4A5A' }}>14</span>
            <span className="text-[10px] font-inter" style={{ color: '#4A4A5A' }}>35+</span>
          </div>
        </div>

        <div>
          <Label>Situação escolar</Label>
          <select style={selectStyle} value={answers.situacao} onChange={e => set('situacao', e.target.value)}>
            <option value="ensino_medio">Cursando o Ensino Médio</option>
            <option value="formado">Já terminei o Ensino Médio</option>
            <option value="cursando_faculdade">Cursando faculdade (quero trocar)</option>
            <option value="outro">Outra situação</option>
          </select>
        </div>
      </div>

      <Next label="CONTINUAR →" onClick={() => setStep(2)} disabled={!answers.nome.trim()} />
    </div>
  )

  // ── STEP 2: OBJETIVO ──────────────────────────────────────────
  if (step === 2) return (
    <div className="min-h-screen px-6 pt-8 pb-6 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      <ProgressBar />
      <Back toStep={1} />
      <p className="text-xs font-barlow font-semibold uppercase tracking-widest mb-1" style={{ color: '#FF4500' }}>
        PASSO 2 DE 5
      </p>
      <h2 className="font-bebas text-4xl tracking-[2px] mb-1" style={{ color: '#F0EDE8' }}>
        SEU OBJETIVO
      </h2>
      <p className="text-sm font-inter mb-6" style={{ color: '#8A8A9A' }}>
        Todo guerreiro precisa saber para onde está indo.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <Label>Objetivo com o ENEM</Label>
          <select style={selectStyle} value={answers.objetivo} onChange={e => set('objetivo', e.target.value)}>
            <option value="universidade_federal">Universidade pública federal</option>
            <option value="universidade_estadual">Universidade estadual</option>
            <option value="prouni_fies">ProUni / FIES</option>
            <option value="melhorar_nota">Melhorar minha nota anterior</option>
            <option value="certificacao">Certificação de conclusão do EM</option>
          </select>
        </div>

        <div>
          <Label>Área de interesse</Label>
          <select style={selectStyle} value={answers.area_desejada} onChange={e => set('area_desejada', e.target.value)}>
            <option value="saude">Saúde (Medicina, Enfermagem, Farmácia...)</option>
            <option value="exatas">Exatas (Engenharia, TI, Física...)</option>
            <option value="humanas">Humanas (Direito, Psicologia, Pedagogia...)</option>
            <option value="biologicas">Biológicas (Biologia, Agronomia...)</option>
            <option value="artes">Artes e Comunicação</option>
            <option value="nao_sei">Ainda não decidi</option>
          </select>
        </div>

        <div>
          <Label>Meta de nota: {answers.meta_nota} pontos</Label>
          <input type="range" min="400" max="950" step="10" value={answers.meta_nota}
            onChange={e => set('meta_nota', parseInt(e.target.value))}
            style={{ accentColor: '#FF4500', width: '100%' }} />
          <div className="grid grid-cols-4 mt-2 gap-1">
            {[{ v: 500, l: 'FIES básico' }, { v: 650, l: 'Federal' }, { v: 750, l: 'Top federal' }, { v: 850, l: 'Medicina' }].map(({ v, l }) => (
              <button key={v} onClick={() => set('meta_nota', v)}
                className="py-1.5 rounded-lg text-[10px] font-barlow font-semibold transition-all"
                style={answers.meta_nota === v
                  ? { background: '#FF4500', color: '#fff' }
                  : { background: '#111118', border: '1px solid #2A2A3A', color: '#4A4A5A' }}>
                {v}<br />{l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Next onClick={() => setStep(3)} />
    </div>
  )

  // ── STEP 3: HISTÓRICO ─────────────────────────────────────────
  if (step === 3) return (
    <div className="min-h-screen px-6 pt-8 pb-6 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      <ProgressBar />
      <Back toStep={2} />
      <p className="text-xs font-barlow font-semibold uppercase tracking-widest mb-1" style={{ color: '#FF4500' }}>
        PASSO 3 DE 5
      </p>
      <h2 className="font-bebas text-4xl tracking-[2px] mb-1" style={{ color: '#F0EDE8' }}>
        SEU HISTÓRICO
      </h2>
      <p className="text-sm font-inter mb-6" style={{ color: '#8A8A9A' }}>
        O passado define onde você está. O presente define onde vai.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <Label>Já fez o ENEM antes?</Label>
          <div className="grid grid-cols-2 gap-2">
            {[{ v: true, l: '✅ Sim' }, { v: false, l: '🆕 Não / Primeira vez' }].map(({ v, l }) => (
              <button key={String(v)} onClick={() => set('fez_enem', v)}
                className="py-3 rounded-xl font-inter text-sm font-semibold transition-all"
                style={answers.fez_enem === v
                  ? { background: '#1E0D00', border: '2px solid #FF4500', color: '#FF4500' }
                  : { background: '#111118', border: '1px solid #2A2A3A', color: '#8A8A9A' }}>
                {l}
              </button>
            ))}
          </div>
          {answers.fez_enem && (
            <div className="mt-3">
              <Label>Nota anterior: ~{answers.nota_anterior} pts</Label>
              <input type="range" min="300" max="900" step="10" value={answers.nota_anterior}
                onChange={e => set('nota_anterior', parseInt(e.target.value))}
                style={{ accentColor: '#FF4500', width: '100%' }} />
            </div>
          )}
        </div>

        <div>
          <Label>Horas disponíveis por dia para estudar</Label>
          <select style={selectStyle} value={answers.horas_dia} onChange={e => set('horas_dia', e.target.value)}>
            <option value="menos30min">Menos de 30 minutos</option>
            <option value="30min1h">30 minutos a 1 hora</option>
            <option value="1a2">1h a 2h por dia</option>
            <option value="2a4">2h a 4h por dia</option>
            <option value="mais4h">Mais de 4 horas</option>
          </select>
        </div>

        <div>
          <Label>Você estuda com algum suporte?</Label>
          <select style={selectStyle} value={answers.suporte} onChange={e => set('suporte', e.target.value)}>
            <option value="sozinho">Totalmente sozinho</option>
            <option value="cursinho_presencial">Tenho cursinho presencial</option>
            <option value="cursinho_online">Tenho cursinho online</option>
            <option value="professor">Tenho professor particular</option>
          </select>
        </div>
      </div>

      <Next onClick={() => setStep(4)} />
    </div>
  )

  // ── STEP 4: AUTOAVALIAÇÃO ─────────────────────────────────────
  if (step === 4) return (
    <div className="min-h-screen px-6 pt-8 pb-6 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      <ProgressBar />
      <Back toStep={3} />
      <p className="text-xs font-barlow font-semibold uppercase tracking-widest mb-1" style={{ color: '#FF4500' }}>
        PASSO 4 DE 5
      </p>
      <h2 className="font-bebas text-4xl tracking-[2px] mb-1" style={{ color: '#F0EDE8' }}>
        SEUS PONTOS FORTES
      </h2>
      <p className="text-sm font-inter mb-6" style={{ color: '#8A8A9A' }}>
        Seja honesto. A Caverna não julga. Só analisa.
      </p>

      <div className="rounded-xl p-4 mb-4" style={{ background: '#111118', border: '1px solid #1E1E2E' }}>
        <SliderRow label="📝 Linguagens e Português" valKey="n_linguagens" />
        <SliderRow label="🌍 Ciências Humanas" valKey="n_humanas" />
        <SliderRow label="🔬 Ciências da Natureza" valKey="n_natureza" />
        <SliderRow label="📐 Matemática" valKey="n_matematica" />
        <SliderRow label="✍️ Redação" valKey="n_redacao" />
      </div>

      <Next onClick={() => setStep(5)} />
    </div>
  )

  // ── STEP 5: COMPORTAMENTO ─────────────────────────────────────
  if (step === 5) return (
    <div className="min-h-screen px-6 pt-8 pb-6 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      <ProgressBar />
      <Back toStep={4} />
      <p className="text-xs font-barlow font-semibold uppercase tracking-widest mb-1" style={{ color: '#FF4500' }}>
        PASSO 5 DE 5 — ÚLTIMO
      </p>
      <h2 className="font-bebas text-4xl tracking-[2px] mb-1" style={{ color: '#F0EDE8' }}>
        SEU MAIOR INIMIGO
      </h2>
      <p className="text-sm font-inter mb-6" style={{ color: '#8A8A9A' }}>
        O maior inimigo do estudante não é a prova. É a rotina.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <Label>Seu principal obstáculo hoje</Label>
          {[
            { v: 'procrastinacao', l: '😴 Procrastinação' },
            { v: 'falta_tempo', l: '⏰ Falta de tempo' },
            { v: 'nao_entendo', l: '🤯 Não entendo os conteúdos' },
            { v: 'ansiedade', l: '😰 Ansiedade na prova' },
            { v: 'por_onde_comecar', l: '🧭 Não sei por onde começar' },
            { v: 'motivacao', l: '🔋 Falta de motivação' },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => set('obstaculo', v)}
              className="w-full py-3 px-4 rounded-xl text-left font-inter text-sm font-medium mb-2 transition-all"
              style={answers.obstaculo === v
                ? { background: '#1E0D00', border: '2px solid #FF4500', color: '#FF4500' }
                : { background: '#111118', border: '1px solid #2A2A3A', color: '#8A8A9A' }}>
              {l}
            </button>
          ))}
        </div>

        <div>
          <Label>Você estuda melhor em qual período?</Label>
          <div className="grid grid-cols-2 gap-2">
            {[{ v: 'manha', l: '🌅 Manhã' }, { v: 'tarde', l: '☀️ Tarde' }, { v: 'noite', l: '🌙 Noite' }, { v: 'varia', l: '🔄 Varia' }].map(({ v, l }) => (
              <button key={v} onClick={() => set('periodo', v)}
                className="py-3 rounded-xl font-inter text-sm font-semibold transition-all"
                style={answers.periodo === v
                  ? { background: '#1E0D00', border: '2px solid #FF4500', color: '#FF4500' }
                  : { background: '#111118', border: '1px solid #2A2A3A', color: '#8A8A9A' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Next label="GERAR MEU DIAGNÓSTICO 🔥" onClick={callAI} />
    </div>
  )

  // ── STEP 6: LOADING ───────────────────────────────────────────
  if (step === 6) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#0A0A0F' }}>
      <div className="font-bebas text-8xl animate-flame mb-6" style={{ color: '#FF4500' }}>🔥</div>
      <h2 className="font-bebas text-3xl tracking-[3px] mb-3" style={{ color: '#F0EDE8' }}>
        A CAVERNA TE ANALISA
      </h2>
      <p className="font-inter text-base transition-all duration-500" style={{ color: '#FF8C00' }}>
        {LOADING_MSGS[loadMsg]}
      </p>
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-pulse2"
            style={{ background: '#FF4500', animationDelay: `${i * 0.3}s` }} />
        ))}
      </div>
    </div>
  )

  // ── STEP 7: RESULTADO ─────────────────────────────────────────
  if (step === 7 && resultado) {
    const r = resultado
    const gap = r.meta_realista - r.nota_estimada_atual
    const PERFIL_ICON = {
      'Guerreiro Iniciante': '🗡️',
      'Lutador Intermediário': '⚔️',
      'Veterano da Batalha': '🛡️',
      'Elite da Caverna': '👑',
    }

    return (
      <div className="min-h-screen px-6 pt-8 pb-20 animate-screenEnter" style={{ background: '#0A0A0F' }}>
        {/* Profile badge */}
        <div className="text-center mb-6">
          <div className="font-bebas text-6xl mb-2">{PERFIL_ICON[r.perfil_tipo] || '🔥'}</div>
          <div className="inline-block px-4 py-1.5 rounded-full mb-2"
            style={{ background: 'rgba(255,69,0,0.15)', border: '1px solid rgba(255,69,0,0.4)' }}>
            <span className="font-bebas text-lg tracking-widest" style={{ color: '#FF4500' }}>
              {r.perfil_tipo?.toUpperCase()}
            </span>
          </div>
          <h2 className="font-bebas text-3xl tracking-[2px]" style={{ color: '#F0EDE8' }}>
            {answers.nome}, a Caverna te conhece agora.
          </h2>
        </div>

        {/* Radar chart */}
        <div className="rounded-xl p-4 mb-4 flex flex-col items-center"
          style={{ background: '#111118', border: '1px solid #1E1E2E' }}>
          <p className="text-[10px] font-barlow font-semibold uppercase tracking-widest mb-3" style={{ color: '#4A4A5A' }}>
            MAPA DE MATURIDADE ENEM
          </p>
          <RadarChart data={r.pontuacoes_iniciais} size={240} />
          <div className="w-full mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-bebas text-2xl" style={{ color: '#8A8A9A' }}>{r.nota_estimada_atual}</p>
              <p className="text-[9px] font-barlow uppercase tracking-wide" style={{ color: '#4A4A5A' }}>HOJE (EST.)</p>
            </div>
            <div>
              <p className="font-bebas text-2xl" style={{ color: gap > 0 ? '#FF8C00' : '#00C853' }}>
                {gap > 0 ? `+${gap}` : '✅'}
              </p>
              <p className="text-[9px] font-barlow uppercase tracking-wide" style={{ color: '#4A4A5A' }}>PARA META</p>
            </div>
            <div>
              <p className="font-bebas text-2xl" style={{ color: '#C9A84C' }}>{r.meta_realista}</p>
              <p className="text-[9px] font-barlow uppercase tracking-wide" style={{ color: '#4A4A5A' }}>META REAL</p>
            </div>
          </div>
        </div>

        {/* Diagnosis text */}
        <div className="rounded-xl p-4 mb-4"
          style={{ background: '#111118', border: '1px solid #1E1E2E', borderLeft: '3px solid #FF4500' }}>
          <p className="font-bebas text-lg mb-2 tracking-wide" style={{ color: '#FF4500' }}>
            🔥 DIAGNÓSTICO CAVERNA
          </p>
          {r.diagnostico_geral?.split('\n').filter(Boolean).map((p, i) => (
            <p key={i} className="text-sm font-inter leading-relaxed mb-2" style={{ color: '#B0ADAA' }}>{p}</p>
          ))}
          <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(255,69,0,0.1)' }}>
            <p className="text-xs font-barlow font-semibold uppercase tracking-widest mb-1" style={{ color: '#FF4500' }}>
              ⚡ PONTO CRÍTICO
            </p>
            <p className="text-sm font-inter font-semibold" style={{ color: '#F0EDE8' }}>{r.ponto_critico}</p>
          </div>
        </div>

        {/* Trail preview */}
        {r.trilha_prioritaria?.length > 0 && (
          <div className="rounded-xl p-4 mb-4"
            style={{ background: '#111118', border: '1px solid #1E1E2E' }}>
            <p className="font-bebas text-lg mb-3 tracking-wide" style={{ color: '#F0EDE8' }}>
              🗺️ SUA TRILHA PRIORITÁRIA
            </p>
            {r.trilha_prioritaria.slice(0, 4).map((t, i) => (
              <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bebas text-lg"
                  style={{ background: i === 0 ? '#FF4500' : '#1E1E2E', color: i === 0 ? '#fff' : '#8A8A9A' }}>
                  {i + 1}
                </div>
                <div>
                  <p className="font-inter font-semibold text-sm" style={{ color: i === 0 ? '#F0EDE8' : '#8A8A9A' }}>
                    {t.materia}
                  </p>
                  <p className="text-xs font-inter" style={{ color: '#4A4A5A' }}>{t.motivo}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Motivational message */}
        <div className="text-center py-4 mb-4">
          <p className="font-bebas text-2xl tracking-[2px]" style={{ color: '#FF8C00' }}>
            "{r.mensagem_motivacional}"
          </p>
        </div>

        {/* Carta ao ENEM */}
        {!showCarta ? (
          <button onClick={() => setShowCarta(true)}
            className="w-full py-3 rounded-xl font-inter text-sm font-semibold mb-3 transition-all"
            style={{ background: '#111118', border: '1px solid #2A2A3A', color: '#8A8A9A' }}>
            📬 Escrever minha Carta ao ENEM (opcional)
          </button>
        ) : (
          <div className="rounded-xl p-4 mb-4" style={{ background: '#111118', border: '1px solid #2A2A3A' }}>
            <p className="font-bebas text-base mb-2 tracking-wide" style={{ color: '#C9A84C' }}>
              📬 CARTA AO ENEM
            </p>
            <p className="text-xs font-inter mb-3" style={{ color: '#4A4A5A' }}>
              Escreva para você mesmo. Vamos entregar 30 dias antes do ENEM.
            </p>
            <textarea rows={4} value={cartaTexto} onChange={e => setCartaTexto(e.target.value)}
              placeholder="Hoje eu decidi que..."
              className="w-full rounded-lg px-3 py-2 text-sm font-inter outline-none resize-none"
              style={{ background: '#0A0A0F', border: '1px solid #2A2A3A', color: '#F0EDE8' }} />
          </div>
        )}

        <button onClick={handleComplete}
          className="w-full py-4 rounded-xl font-bebas text-2xl tracking-wider animate-ctaPulse"
          style={{ background: 'linear-gradient(135deg, #FF4500, #FF8C00)', color: '#fff', boxShadow: '0 0 30px rgba(255,69,0,0.4)' }}>
          ENTRAR NA CAVERNA ⚔️
        </button>
      </div>
    )
  }

  return null
}
