import { useState, useEffect } from 'react'
import Countdown from '../components/Countdown'
import StreakBadge from '../components/StreakBadge'
import {
  getUserName, getUserAvatar,
  getPoints, getXP, getNivel, getXPProgress,
  getStreak, checkAndResetStreak,
  getDailyTasks, getDailyGoal, updateDailyTask, addPoints,
  getPlanStatus, getDiagnostico,
  getPilulaDia, setPilulaDia,
} from '../utils/storage'

// ── PÍLULAS ESTÁTICAS (rotação diária) ────────────────────────────
const PILULAS = [
  { materia: 'Matemática', titulo: 'Função do 1º Grau', conceito: 'f(x) = ax + b', explicacao: 'O coeficiente "a" é a inclinação da reta. Se a > 0, a função cresce. Se a < 0, decresce. O "b" é onde a reta corta o eixo y.', macete: 'Quer encontrar a raiz? Faça f(x) = 0 e resolva para x: x = -b/a.', questao: 'Se f(x) = 2x – 4, qual é a raiz da função?', resposta: 'x = 2 (iguale 2x - 4 = 0 → x = 2)' },
  { materia: 'Biologia', titulo: 'Fotossíntese em 4 linhas', conceito: '6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂', explicacao: 'Plantas convertem luz solar, água e CO₂ em glicose (energia) e liberam oxigênio. Ocorre nos cloroplastos. A fase clara depende de luz; a fase escura (Calvin) não.', macete: 'Fotossíntese = anabolismo vegetal. Entrada: CO₂ e H₂O. Saída: glicose e O₂.', questao: 'A fase clara da fotossíntese ocorre em qual organela e estrutura?', resposta: 'Nos tilacoides dos cloroplastos' },
  { materia: 'Química', titulo: 'Ligações Iônicas vs Covalentes', conceito: 'Iônica = metal + não-metal | Covalente = não-metal + não-metal', explicacao: 'Ligação iônica: transferência de elétrons entre metal e não-metal. Covalente: compartilhamento de elétrons entre não-metais. Sólidos iônicos têm alto ponto de fusão.', macete: 'Metal + não-metal = íon. Não-metal + não-metal = compartilha.', questao: 'NaCl é ligação iônica ou covalente? Por quê?', resposta: 'Iônica: Na é metal, Cl é não-metal → transferência de elétrons' },
  { materia: 'Física', titulo: 'MRU — Movimento Uniforme', conceito: 'v = Δs/Δt | s = s₀ + v·t', explicacao: 'No MRU, a velocidade é constante e a aceleração é zero. No gráfico v×t é uma reta horizontal. No gráfico s×t é uma reta oblíqua.', macete: 'MRU = velocidade constante. Não confunda com MRUV (aceleração constante).', questao: 'Um carro percorre 120 km em 2h com velocidade constante. Qual é a velocidade?', resposta: '60 km/h (v = 120/2)' },
  { materia: 'História', titulo: 'Revolução Industrial', conceito: 'Inglaterra, séc. XVIII — do trabalho manual à máquina a vapor', explicacao: 'A Revolução Industrial transformou a produção artesanal em produção fabril. Criou o proletariado, urbanização acelerada e as bases do capitalismo moderno.', macete: 'Industrial = proletariado + burguesia industrial + urbanização + máquina a vapor.', questao: 'Qual classe social emergiu como principal força produtiva na Revolução Industrial?', resposta: 'O proletariado (trabalhadores das fábricas)' },
  { materia: 'Geografia', titulo: 'Clima Equatorial vs Tropical', conceito: 'Equatorial: chuva o ano todo | Tropical: duas estações', explicacao: 'O clima equatorial (próximo ao Equador) tem chuvas distribuídas todo o ano, altas temperaturas e umidade constante. O tropical tem estação seca e chuvosa bem definidas.', macete: 'Equatorial = sem estação seca. Tropical = verão chuvoso + inverno seco.', questao: 'A Amazônia tem qual tipo de clima? E o Cerrado?', resposta: 'Amazônia = equatorial. Cerrado = tropical (com seca invernal)' },
  { materia: 'Português', titulo: 'Coesão vs Coerência', conceito: 'Coesão = ligação entre frases | Coerência = lógica do texto', explicacao: 'Coesão são os conectivos e pronomes que ligam as partes do texto ("entretanto", "portanto", "ele" referindo a um sujeito). Coerência é o texto fazer sentido como um todo.', macete: 'Coesão = costura do texto. Coerência = sentido do texto.', questao: 'Um texto pode ter coesão mas não ter coerência? Dê exemplo.', resposta: 'Sim. "O cachorro voou para a Lua porque gostava de pizza." (Coeso, mas incoerente)' },
]

function getPilulaHoje() {
  const saved = getPilulaDia()
  if (saved) return saved
  const dia = new Date().getDay() + new Date().getDate()
  const p = PILULAS[dia % PILULAS.length]
  setPilulaDia(p)
  return p
}

export default function Home({ navigate }) {
  const [userName, setUserNameState] = useState(getUserName())
  const [avatar, setAvatarState] = useState(getUserAvatar())
  const [points, setPoints] = useState(getPoints())
  const [xp, setXp] = useState(getXP())
  const [streak, setStreak] = useState(() => checkAndResetStreak())
  const [tasks, setTasks] = useState(getDailyTasks)
  const [dailyGoal, setDailyGoalState] = useState(getDailyGoal())
  const [pilula, setPilula] = useState(null)
  const [pilulaNova, setPilulaNova] = useState(false)
  const [showPilula, setShowPilula] = useState(false)

  const plan = getPlanStatus()
  const nivel = getNivel()
  const xpProg = getXPProgress()

  useEffect(() => {
    checkAndResetStreak()
    setUserNameState(getUserName())
    setAvatarState(getUserAvatar())
    setPoints(getPoints())
    setXp(getXP())
    setStreak(checkAndResetStreak())
    setTasks(getDailyTasks())
    setDailyGoalState(getDailyGoal())

    const p = getPilulaHoje()
    setPilula(p)
    const lastSeen = localStorage.getItem('pilula_vista')
    const hoje = new Date().toISOString().split('T')[0]
    if (lastSeen !== hoje) {
      setPilulaNova(true)
    }
  }, [])

  const handleVerPilula = () => {
    setShowPilula(true)
    setPilulaNova(false)
    localStorage.setItem('pilula_vista', new Date().toISOString().split('T')[0])
  }

  const handleCompleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.completed) return
    const newProgress = Math.min(task.progress + 1, task.target)
    const updated = updateDailyTask(taskId, newProgress)
    const completedTask = updated.find(t => t.id === taskId)
    if (completedTask.completed && !task.completed) {
      addPoints(task.points)
      setPoints(getPoints())
      setXp(getXP())
    }
    setTasks(updated)
  }

  const completedCount = tasks.filter(t => t.completed).length
  const overallProgress = Math.round((completedCount / tasks.length) * 100)

  const NIVEL_CORES = ['#4A4A5A', '#00C853', '#FF8C00', '#FF4500', '#C9A84C']
  const nivelCor = NIVEL_CORES[nivel.nivel - 1]

  const PLAN_BADGE = {
    trial: { label: `Trial (${plan.diasRestantes || 0}d)`, color: '#00C853' },
    pro:   { label: '🔥 PRO', color: '#FF4500' },
    elite: { label: '👑 ELITE', color: '#C9A84C' },
    free:  { label: 'Free', color: '#4A4A5A' },
  }
  const planBadge = PLAN_BADGE[plan.plano] || PLAN_BADGE.free

  return (
    <div className="min-h-screen px-4 pt-6 pb-4 animate-screenEnter" style={{ background: '#0A0A0F' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[11px] font-barlow font-semibold uppercase tracking-widest" style={{ color: '#4A4A5A' }}>
            HORA DE ENTRAR NA CAVERNA. 🔥
          </p>
          <h1 className="font-bebas text-[26px] leading-none tracking-[3px]" style={{ color: '#F0EDE8' }}>
            {avatar} {userName}
          </h1>
          <span className="text-[10px] font-barlow font-bold px-2 py-0.5 rounded"
            style={{ background: 'rgba(255,69,0,0.1)', color: planBadge.color, border: `1px solid ${planBadge.color}44` }}>
            {planBadge.label}
          </span>
        </div>
        <div className="rounded-xl px-3 py-2 text-center glow-gold"
          style={{ background: '#111118', border: '1px solid #1E1E2E', borderTop: '2px solid #C9A84C' }}>
          <p className="font-bebas text-2xl leading-none" style={{ color: '#C9A84C' }}>
            {points.toLocaleString('pt-BR')}
          </p>
          <p className="text-[9px] font-barlow font-semibold uppercase tracking-wide" style={{ color: '#8A8A9A' }}>
            pontos
          </p>
        </div>
      </div>

      {/* XP Level Bar */}
      <div className="rounded-xl p-3 mb-3" style={{ background: '#111118', border: '1px solid #1E1E2E' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-barlow font-semibold uppercase tracking-wide" style={{ color: nivelCor }}>
            {nivel.nome}
          </span>
          <span className="text-[10px] font-inter" style={{ color: '#4A4A5A' }}>
            {xp.toLocaleString('pt-BR')} XP
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#1E1E2E' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${xpProg.pct}%`, background: `linear-gradient(to right, ${nivelCor}88, ${nivelCor})` }} />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] font-inter" style={{ color: '#2A2A3A' }}>Nível {nivel.nivel}</span>
          <span className="text-[9px] font-inter" style={{ color: '#2A2A3A' }}>
            {nivel.nivel < 5 ? `Nível ${nivel.nivel + 1}` : 'MAX'}
          </span>
        </div>
      </div>

      {/* App title */}
      <h2 className="font-bebas text-[20px] tracking-[4px] mb-3" style={{ color: '#F0EDE8' }}>
        MARATONA ENEM <span style={{ color: '#FF4500' }}>2026</span>
      </h2>

      {/* Countdown */}
      <div className="mb-3">
        <Countdown />
      </div>

      {/* Divider */}
      <div className="h-px mb-3"
        style={{ background: 'linear-gradient(to right, transparent, #FF4500, transparent)' }} />

      {/* Pílula do Dia */}
      {pilula && (
        <div className="mb-4">
          <button onClick={handleVerPilula}
            className="w-full rounded-xl p-3 text-left transition-all relative"
            style={{ background: '#111118', border: `1px solid ${showPilula ? '#FF8C00' : '#1E1E2E'}` }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: 'rgba(255,140,0,0.15)' }}>
                💊
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-barlow font-semibold uppercase tracking-widest" style={{ color: '#FF8C00' }}>
                    PÍLULA DO DIA
                  </p>
                  {pilulaNova && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>
                <p className="text-sm font-inter font-semibold truncate" style={{ color: '#F0EDE8' }}>
                  {pilula.materia}: {pilula.titulo}
                </p>
              </div>
              <span style={{ color: '#4A4A5A' }}>{showPilula ? '▲' : '▼'}</span>
            </div>

            {showPilula && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: '#1E1E2E' }}
                onClick={e => e.stopPropagation()}>
                <p className="text-xs font-inter font-mono mb-2 text-center font-bold"
                  style={{ color: '#FF8C00' }}>
                  {pilula.conceito}
                </p>
                <p className="text-xs font-inter leading-relaxed mb-2" style={{ color: '#B0ADAA' }}>
                  {pilula.explicacao}
                </p>
                <div className="rounded-lg p-2 mb-2" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <p className="text-[10px] font-barlow uppercase tracking-wider mb-1" style={{ color: '#C9A84C' }}>
                    🧠 MACETE
                  </p>
                  <p className="text-xs font-inter" style={{ color: '#F0EDE8' }}>{pilula.macete}</p>
                </div>
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,69,0,0.06)', border: '1px solid rgba(255,69,0,0.2)' }}>
                  <p className="text-[10px] font-barlow uppercase tracking-wider mb-1" style={{ color: '#FF4500' }}>
                    ⚡ QUESTÃO RELÂMPAGO
                  </p>
                  <p className="text-xs font-inter mb-1" style={{ color: '#F0EDE8' }}>{pilula.questao}</p>
                  <p className="text-xs font-inter font-semibold" style={{ color: '#00C853' }}>
                    ✓ {pilula.resposta}
                  </p>
                </div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Streak */}
      <div className="mb-4">
        <StreakBadge count={streak.count} />
      </div>

      {/* Daily missions */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bebas text-xl tracking-wide" style={{ color: '#F0EDE8' }}>
            MISSÃO DO DIA
          </h2>
          <span className="text-[11px] font-barlow font-semibold" style={{ color: '#4A4A5A' }}>
            {completedCount}/{tasks.length} CONCLUÍDAS
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: '#1E1E2E' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%`, background: 'linear-gradient(to right, #FF4500, #FF8C00)' }} />
        </div>

        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task}
              onAction={() => {
                if (task.id === 'redo') navigate('redacao')
                else handleCompleteTask(task.id)
              }} />
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-2">
        <div className="h-px mb-3"
          style={{ background: 'linear-gradient(to right, transparent, #FF4500, transparent)' }} />
        <div className="grid grid-cols-3 gap-3 mb-3">
          <StatCard label="Questões hoje" value={streak.correctToday || 0} />
          <StatCard label="Streak" value={`${streak.count}🔥`} highlight />
          <StatCard label="Meta diária" value={`${Math.min(streak.correctToday || 0, dailyGoal)}/${dailyGoal}`} />
        </div>

        {/* Progresso CTA */}
        <button onClick={() => navigate('progresso')}
          className="w-full rounded-xl p-3 flex items-center justify-between transition-all"
          style={{ background: '#111118', border: '1px solid #1E1E2E' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#FF4500'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1E1E2E'}>
          <div className="flex items-center gap-3">
            <span className="text-xl">📈</span>
            <div className="text-left">
              <p className="text-sm font-inter font-semibold" style={{ color: '#F0EDE8' }}>Meu Progresso</p>
              <p className="text-xs font-inter" style={{ color: '#4A4A5A' }}>
                Radar, conquistas e evolução completa
              </p>
            </div>
          </div>
          <span style={{ color: '#FF4500' }}>→</span>
        </button>

        {/* Paywall nudge */}
        {!plan.ativo && (
          <button onClick={() => navigate('planos')}
            className="w-full mt-3 rounded-xl p-3 text-center transition-all animate-ctaPulse"
            style={{ background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.3)' }}>
            <p className="font-bebas text-base tracking-wider" style={{ color: '#FF4500' }}>
              🔓 Pare de estudar com uma mão amarrada — Ativar Modo PRO
            </p>
          </button>
        )}
      </div>
    </div>
  )
}

function TaskCard({ task, onAction }) {
  const pct = Math.round((task.progress / task.target) * 100)
  const borderColor = task.completed ? '#00C853' : '#FF4500'

  return (
    <div className="rounded-xl p-4 transition-all duration-300"
      style={{ background: '#111118', border: '1px solid #1E1E2E', borderLeft: `3px solid ${borderColor}` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg shrink-0">{task.icon}</span>
          <p className="text-sm font-inter font-semibold leading-tight truncate"
            style={{ color: task.completed ? '#00C853' : '#F0EDE8' }}>
            {task.label}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-[11px] font-barlow font-bold px-2 py-0.5 rounded"
            style={{ color: '#C9A84C', background: '#1E1E2E' }}>
            +{task.points}pts
          </span>
          {task.completed ? (
            <span className="text-lg">✅</span>
          ) : (
            <button onClick={onAction}
              className="text-white text-xs font-inter font-semibold px-3 py-1.5 rounded-lg transition-all glow-fire-sm"
              style={{ background: '#FF4500' }}>
              {task.target === 1 ? 'Ir' : '+1'}
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#1E1E2E' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: task.completed ? '#00C853' : 'linear-gradient(to right, #FF4500, #FF8C00)' }} />
        </div>
        <span className="text-[10px] font-inter shrink-0" style={{ color: '#4A4A5A' }}>
          {task.progress}/{task.target}
        </span>
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div className="rounded-xl p-3 text-center border border-[#1E1E2E]" style={{ background: '#111118' }}>
      <p className="font-bebas text-xl leading-none" style={{ color: highlight ? '#FF8C00' : '#F0EDE8' }}>
        {value}
      </p>
      <p className="text-[9px] font-barlow font-semibold uppercase tracking-wide mt-0.5" style={{ color: '#4A4A5A' }}>
        {label}
      </p>
    </div>
  )
}
