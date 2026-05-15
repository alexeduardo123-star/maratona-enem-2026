const TODAY = () => new Date().toISOString().split('T')[0]
const YESTERDAY = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export const storage = {
  get: (key, fallback) => {
    try {
      const v = localStorage.getItem(key)
      return v !== null ? JSON.parse(v) : fallback
    } catch {
      return fallback
    }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  },
  remove: (key) => localStorage.removeItem(key),
}

// ── LEGACY NAME/AVATAR ────────────────────────────────────────────
export const getUserName = () => storage.get('userName', 'Estudante')
export const setUserName = (n) => storage.set('userName', n)
export const getUserAvatar = () => storage.get('userAvatar', '🧑‍🎓')
export const setUserAvatar = (a) => storage.set('userAvatar', a)

// ── PONTOS + XP (simultaneous) ────────────────────────────────────
export const getPoints = () => storage.get('userPoints', 0)
export const addPoints = (pts) => {
  storage.set('userPoints', getPoints() + pts)
  storage.set('xpTotal', getXP() + pts)
}

// ── XP E NÍVEL ────────────────────────────────────────────────────
const XP_LEVELS = [
  { nivel: 1, nome: 'Recruta da Caverna',   xpMin: 0,    xpMax: 500 },
  { nivel: 2, nome: 'Aprendiz da Caverna',  xpMin: 501,  xpMax: 1500 },
  { nivel: 3, nome: 'Guerreiro da Caverna', xpMin: 1501, xpMax: 3500 },
  { nivel: 4, nome: 'Veterano da Caverna',  xpMin: 3501, xpMax: 7000 },
  { nivel: 5, nome: 'Lenda da Caverna',     xpMin: 7001, xpMax: 99999999 },
]

export const getXP = () => storage.get('xpTotal', 0)
export const addXP = (qty) => storage.set('xpTotal', getXP() + qty)

export const getNivel = (xp = null) => {
  const total = xp !== null ? xp : getXP()
  return XP_LEVELS.find(l => total >= l.xpMin && total <= l.xpMax) || XP_LEVELS[0]
}

export const getXPProgress = () => {
  const xp = getXP()
  const nivel = getNivel(xp)
  if (nivel.nivel === 5) return { pct: 100, xpAtual: xp - nivel.xpMin, xpTotal: 1000 }
  const xpAtual = xp - nivel.xpMin
  const xpTotal = nivel.xpMax - nivel.xpMin
  return { pct: Math.min(100, Math.floor((xpAtual / xpTotal) * 100)), xpAtual, xpTotal }
}

// ── DAILY GOAL ────────────────────────────────────────────────────
export const getDailyGoal = () => storage.get('dailyGoal', 10)
export const setDailyGoal = (g) => storage.set('dailyGoal', g)

// ── STREAK ────────────────────────────────────────────────────────
export const getStreak = () =>
  storage.get('streak', { count: 0, lastDate: '', correctToday: 0, lastStreakDate: '' })

export const getMaxStreak = () => storage.get('maxStreak', 0)

export const recordCorrectAnswer = () => {
  const today = TODAY()
  const s = getStreak()
  const correctToday = s.lastDate === today ? s.correctToday + 1 : 1
  const lastStreakDate = s.lastStreakDate !== undefined ? s.lastStreakDate : s.lastDate

  let count = s.count
  let nextLastStreakDate = lastStreakDate

  if (correctToday === 5 && lastStreakDate !== today) {
    count = lastStreakDate === YESTERDAY() ? s.count + 1 : 1
    nextLastStreakDate = today
    if (count > getMaxStreak()) storage.set('maxStreak', count)
  }

  const next = { count, lastDate: today, correctToday, lastStreakDate: nextLastStreakDate }
  storage.set('streak', next)
  return next
}

export const checkAndResetStreak = () => {
  const s = getStreak()
  const today = TODAY()
  const lastStreakDate = s.lastStreakDate !== undefined ? s.lastStreakDate : s.lastDate
  if (lastStreakDate && lastStreakDate !== today && lastStreakDate !== YESTERDAY()) {
    const reset = { ...s, count: 0, correctToday: 0, lastStreakDate: '' }
    storage.set('streak', reset)
    return reset
  }
  return s
}

// ── DAILY TASKS ───────────────────────────────────────────────────
export const getDailyTasks = () => {
  const today = TODAY()
  const saved = storage.get('dailyTasks', null)
  if (saved && saved.date === today) return saved.tasks

  const tasks = [
    { id: 'q10',  label: 'Responda 10 questões de qualquer matéria', icon: '❓', target: 10, progress: 0, completed: false, points: 80 },
    { id: 'mat5', label: 'Acerte 5 questões de Matemática',          icon: '📐', target: 5,  progress: 0, completed: false, points: 60 },
    { id: 'bio5', label: 'Estude Biologia: leia um tópico',          icon: '🧬', target: 1,  progress: 0, completed: false, points: 40 },
    { id: 'redo', label: 'Escreva uma redação completa',             icon: '✍️', target: 1,  progress: 0, completed: false, points: 100 },
    { id: 'hum5', label: 'Responda 5 questões de Humanas',           icon: '🌎', target: 5,  progress: 0, completed: false, points: 60 },
  ]
  storage.set('dailyTasks', { date: today, tasks })
  return tasks
}

export const updateDailyTask = (id, newProgress) => {
  const today = TODAY()
  const saved = storage.get('dailyTasks', { date: today, tasks: getDailyTasks() })
  const tasks = saved.tasks.map(t => {
    if (t.id !== id) return t
    const progress = Math.min(newProgress, t.target)
    return { ...t, progress, completed: progress >= t.target }
  })
  storage.set('dailyTasks', { date: today, tasks })
  return tasks
}

// ── NOTIFICAÇÕES ──────────────────────────────────────────────────
export const getNotifications = () => storage.get('notifications', false)
export const setNotifications = (v) => storage.set('notifications', v)

// ── DIAGNÓSTICO ───────────────────────────────────────────────────
export const isDiagnosticoFeito = () => storage.get('diagnosticoFeito', false)
export const setDiagnosticoFeito = () => storage.set('diagnosticoFeito', true)
export const getDiagnostico = () => storage.get('diagnostico', null)

export const setDiagnostico = (data) => {
  const atual = getDiagnostico()
  const historico = atual?.historicoRediagnosticos || []
  if (atual) historico.push({ ...atual, historicoRediagnosticos: undefined })
  storage.set('diagnostico', {
    ...data,
    dataDiagnostico: new Date().toISOString(),
    historicoRediagnosticos: historico.slice(-5),
  })
}

// ── PLANO / TRIAL ─────────────────────────────────────────────────
export const initTrial = () => {
  if (!storage.get('trialExpira', null)) {
    const exp = new Date()
    exp.setDate(exp.getDate() + 7)
    storage.set('trialExpira', exp.toISOString())
    storage.set('planoAtual', 'trial')
  }
}

export const getPlanStatus = () => {
  const plano = storage.get('planoAtual', 'trial')
  if (plano === 'pro' || plano === 'elite') return { plano, ativo: true, trial: false }

  const trialExpira = storage.get('trialExpira', null)
  if (!trialExpira) { initTrial(); return { plano: 'trial', ativo: true, trial: true, diasRestantes: 7 } }

  const diasRestantes = Math.ceil((new Date(trialExpira) - new Date()) / (1000 * 60 * 60 * 24))
  if (diasRestantes > 0) return { plano: 'trial', ativo: true, trial: true, diasRestantes }

  const diasExpirado = Math.abs(diasRestantes)
  return {
    plano: 'free', ativo: false, trial: false, diasExpirado,
    bloqueios: {
      redacoes: true,
      materiasExtras: diasExpirado >= 2,
      questoesLimitadas: diasExpirado >= 4,
      bloqueioTotal: diasExpirado >= 6,
    }
  }
}

export const setPlan = (plano) => storage.set('planoAtual', plano)

// ── BADGES ────────────────────────────────────────────────────────
export const getBadges = () => storage.get('userBadges', [])
export const hasBadge = (id) => getBadges().includes(id)

export const addBadge = (id) => {
  const badges = getBadges()
  if (!badges.includes(id)) {
    storage.set('userBadges', [...badges, id])
    return true
  }
  return false
}

// ── HISTÓRICO REDAÇÕES ────────────────────────────────────────────
export const getRedacoes = () => storage.get('historicoRedacoes', [])

export const addRedacao = (redacao) => {
  const lista = getRedacoes()
  const nova = { id: Date.now().toString(), ...redacao, data: new Date().toISOString() }
  storage.set('historicoRedacoes', [nova, ...lista].slice(0, 50))
  return nova
}

// ── HISTÓRICO QUESTÕES ────────────────────────────────────────────
export const getHistoricoQuestoes = () => storage.get('historicoQuestoes', [])

export const addQuestaoRespondida = (q) => {
  const lista = getHistoricoQuestoes()
  storage.set('historicoQuestoes', [
    { id: Date.now().toString(), ...q, data: new Date().toISOString() },
    ...lista
  ].slice(0, 500))
}

export const getStatsQuestoes = () => {
  const h = getHistoricoQuestoes()
  if (!h.length) return { total: 0, acertos: 0, taxa: 0, porMateria: {} }
  const acertos = h.filter(q => q.correta).length
  const porMateria = {}
  h.forEach(q => {
    if (!porMateria[q.materia]) porMateria[q.materia] = { total: 0, acertos: 0 }
    porMateria[q.materia].total++
    if (q.correta) porMateria[q.materia].acertos++
  })
  return { total: h.length, acertos, taxa: Math.round((acertos / h.length) * 100), porMateria }
}

// ── INDICAÇÕES ────────────────────────────────────────────────────
export const getIndicacoes = () => storage.get('indicacoes', { convertidos: 0, recompensas: [] })

export const getReferralCode = () => {
  let code = storage.get('referralCode', null)
  if (!code) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase()
    storage.set('referralCode', code)
  }
  return code
}

// ── PÍLULA DO DIA ─────────────────────────────────────────────────
export const getPilulaDia = () => {
  const saved = storage.get('pilulaDia', null)
  if (saved && saved.data === TODAY()) return saved
  return null
}
export const setPilulaDia = (p) => storage.set('pilulaDia', { ...p, data: TODAY() })

// ── CARTA AO ENEM ─────────────────────────────────────────────────
export const getCartaEnem = () => storage.get('cartaEnem', null)
export const setCartaEnem = (texto) =>
  storage.set('cartaEnem', { texto, data: new Date().toISOString() })

// ── RESET ─────────────────────────────────────────────────────────
export const resetAll = () => {
  [
    'userName', 'userAvatar', 'userPoints', 'xpTotal', 'maxStreak',
    'dailyGoal', 'streak', 'dailyTasks', 'notifications',
    'diagnosticoFeito', 'diagnostico', 'trialExpira', 'planoAtual',
    'userBadges', 'historicoRedacoes', 'historicoQuestoes',
    'indicacoes', 'referralCode', 'pilulaDia', 'cartaEnem',
  ].forEach(k => localStorage.removeItem(k))
}
