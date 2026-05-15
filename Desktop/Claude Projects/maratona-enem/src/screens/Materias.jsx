import { useState } from 'react'
import { materias, areas, questoes } from '../data/questoes'
import QuestionCard from '../components/QuestionCard'
import { getPoints } from '../utils/storage'

export default function Materias() {
  const [view, setView] = useState('list')
  const [selectedMateria, setSelectedMateria] = useState(null)
  const [selectedTopico, setSelectedTopico] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [answered, setAnswered] = useState([])
  const [points, setPoints] = useState(getPoints())

  const openMateria = (id) => {
    setSelectedMateria(id)
    setView('topicos')
  }

  const openTopico = (topico) => {
    setSelectedTopico(topico)
    setQIndex(0)
    setAnswered([])
    setView('content')
  }

  const goBack = () => {
    if (view === 'content') { setView('topicos'); setSelectedTopico(null) }
    else if (view === 'topicos') { setView('list'); setSelectedMateria(null) }
  }

  const currentQuestoes = selectedMateria
    ? (questoes[selectedMateria] || []).filter(q => !selectedTopico || q.topico === selectedTopico)
    : []

  const currentQ = currentQuestoes[qIndex]

  const handleAnswer = (result) => {
    setAnswered(prev => [...prev, result])
    setPoints(getPoints())
  }

  const nextQ = () => {
    if (qIndex < currentQuestoes.length - 1) setQIndex(i => i + 1)
  }

  const prevQ = () => {
    if (qIndex > 0) setQIndex(i => i - 1)
  }

  if (view === 'list') return <SubjectList areas={areas} materias={materias} onSelect={openMateria} />
  if (view === 'topicos') return (
    <TopicList
      materia={materias[selectedMateria]}
      materiaId={selectedMateria}
      onSelect={openTopico}
      onBack={goBack}
    />
  )

  return (
    <ContentView
      materia={materias[selectedMateria]}
      topico={selectedTopico}
      questoes={currentQuestoes}
      qIndex={qIndex}
      currentQ={currentQ}
      answered={answered}
      points={points}
      onAnswer={handleAnswer}
      onNext={nextQ}
      onPrev={prevQ}
      onBack={goBack}
    />
  )
}

function SubjectList({ areas: areasData, materias: materiasData, onSelect }) {
  return (
    <div className="min-h-screen px-4 pt-6 pb-4 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      <h1 className="font-bebas leading-none tracking-[3px] mb-1" style={{ fontSize: '30px', color: '#F0EDE8' }}>
        ARSENAL DE CONHECIMENTO
      </h1>
      <p className="text-[11px] font-barlow font-semibold uppercase tracking-widest mb-6" style={{ color: '#8A8A9A' }}>
        Sem desculpa. Estude e evolua.
      </p>

      {Object.entries(areasData).map(([areaId, area]) => (
        <div key={areaId} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: `${area.cor}44` }} />
            <h2
              className="font-barlow font-bold text-[13px] tracking-[3px] uppercase px-2"
              style={{ color: area.cor }}
            >
              {area.nome}
            </h2>
            <div className="h-px flex-1" style={{ background: `${area.cor}44` }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {area.materias.map((mid) => {
              const m = materiasData[mid]
              if (!m) return null
              const count = (questoes[mid] || []).length
              return (
                <button
                  key={mid}
                  onClick={() => onSelect(mid)}
                  className="rounded-xl p-4 text-left transition-all duration-200 active:scale-95"
                  style={{ background: '#111118', border: '1px solid #1E1E2E' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = m.cor
                    e.currentTarget.style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1E1E2E'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <span className="text-3xl mb-2 block">{m.icon}</span>
                  <p className="font-barlow font-bold text-base leading-tight" style={{ color: '#F0EDE8' }}>
                    {m.nome}
                  </p>
                  <p className="text-[10px] mt-1 font-inter" style={{ color: '#4A4A5A' }}>
                    {count} questões
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function TopicList({ materia, materiaId, onSelect, onBack }) {
  const allQ = questoes[materiaId] || []
  const topicoStats = {}
  allQ.forEach(q => {
    if (!topicoStats[q.topico]) topicoStats[q.topico] = 0
    topicoStats[q.topico]++
  })

  return (
    <div className="min-h-screen px-4 pt-6 pb-4 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-inter mb-5 transition-colors"
        style={{ color: '#8A8A9A' }}
        onMouseEnter={e => e.currentTarget.style.color = '#F0EDE8'}
        onMouseLeave={e => e.currentTarget.style.color = '#8A8A9A'}
      >
        ← Voltar
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{materia.icon}</span>
        <div>
          <h1 className="font-bebas text-3xl leading-none tracking-[2px]" style={{ color: '#F0EDE8' }}>
            {materia.nome}
          </h1>
          <p className="text-xs font-barlow font-semibold uppercase tracking-widest" style={{ color: '#8A8A9A' }}>
            {allQ.length} questões disponíveis
          </p>
        </div>
      </div>

      <button
        onClick={() => onSelect(null)}
        className="w-full rounded-xl p-4 text-left mb-3 transition-all glow-fire"
        style={{ border: '1px solid #FF4500', background: '#1E0D00' }}
      >
        <p className="font-bebas text-xl tracking-wide" style={{ color: '#FF4500' }}>🎲 TODOS OS TÓPICOS</p>
        <p className="text-xs font-barlow font-semibold" style={{ color: '#8A8A9A' }}>
          {allQ.length} questões · todas as dificuldades
        </p>
      </button>

      <p className="text-[11px] font-barlow font-semibold uppercase tracking-[2px] mb-3" style={{ color: '#4A4A5A' }}>
        POR TÓPICO
      </p>

      <div className="flex flex-col gap-2">
        {materia.topicos.map((topico) => {
          const count = topicoStats[topico] || 0
          return (
            <button
              key={topico}
              onClick={() => onSelect(topico)}
              className="rounded-xl p-4 text-left active:scale-95 transition-all"
              style={{ border: '1px solid #1E1E2E', background: '#111118' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#4A4A5A'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1E1E2E'}
            >
              <div className="flex items-center justify-between">
                <p className="font-inter font-semibold text-sm" style={{ color: '#F0EDE8' }}>{topico}</p>
                <span className="text-xs font-barlow font-semibold" style={{ color: '#4A4A5A' }}>
                  {count > 0 ? `${count} q.` : 'em breve'}
                </span>
              </div>
              <p className="text-[11px] font-inter mt-1" style={{ color: '#8A8A9A' }}>
                {count > 0 ? `📖 Resumo + ${count} questões` : '📖 Resumo em breve'}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ContentView({ materia, topico, questoes: qs, qIndex, currentQ, answered, points, onAnswer, onNext, onPrev, onBack }) {
  const correctCount = answered.filter(a => a.correct).length

  return (
    <div className="min-h-screen px-4 pt-6 pb-4 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-inter mb-4 transition-colors"
        style={{ color: '#8A8A9A' }}
        onMouseEnter={e => e.currentTarget.style.color = '#F0EDE8'}
        onMouseLeave={e => e.currentTarget.style.color = '#8A8A9A'}
      >
        ← {materia.nome}
      </button>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-bebas text-2xl tracking-[2px]" style={{ color: '#F0EDE8' }}>
            {topico || 'TODOS OS TÓPICOS'}
          </h1>
          <p className="text-xs font-barlow font-semibold uppercase" style={{ color: '#8A8A9A' }}>
            {materia.nome}
          </p>
        </div>
        <div className="rounded-xl px-3 py-1.5 text-center"
             style={{ background: '#111118', border: '1px solid #1E1E2E', borderTop: '2px solid #C9A84C' }}>
          <p className="font-bebas text-lg leading-none" style={{ color: '#C9A84C' }}>
            {points.toLocaleString('pt-BR')}
          </p>
          <p className="text-[9px] font-barlow font-semibold uppercase" style={{ color: '#4A4A5A' }}>
            pts totais
          </p>
        </div>
      </div>

      {/* Theory placeholder */}
      <div className="rounded-xl p-4 mb-5 border border-[#1E1E2E]" style={{ background: '#111118' }}>
        <h2 className="font-bebas text-lg mb-2 tracking-wide" style={{ color: '#F0EDE8' }}>
          📖 RESUMO TEÓRICO
        </h2>
        <p className="text-sm font-inter leading-relaxed" style={{ color: '#8A8A9A' }}>
          Conteúdo em breve! Adicione arquivos{' '}
          <span style={{ color: '#FF4500' }}>.txt</span> ou{' '}
          <span style={{ color: '#FF4500' }}>.md</span> na pasta{' '}
          <span className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: '#1E1E2E', color: '#F0EDE8' }}>
            /conteudos/{materia?.nome?.toLowerCase()?.replace(/ /g, '-') || 'materia'}/
          </span>{' '}
          para que o conteúdo seja exibido aqui.
        </p>
      </div>

      {/* Questions */}
      {qs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm font-inter" style={{ color: '#4A4A5A' }}>
            Nenhuma questão para este tópico ainda.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bebas text-xl tracking-wide" style={{ color: '#F0EDE8' }}>
              QUESTÕES PRÁTICAS
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-barlow font-bold" style={{ color: '#00C853' }}>{correctCount} ✓</span>
              <span className="text-xs font-barlow font-semibold" style={{ color: '#4A4A5A' }}>
                {qIndex + 1}/{qs.length}
              </span>
            </div>
          </div>

          {currentQ && (
            <QuestionCard key={currentQ.id} questao={currentQ} onAnswer={onAnswer} />
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={onPrev}
              disabled={qIndex === 0}
              className="flex-1 py-3 rounded-xl font-bebas text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ border: '1px solid #1E1E2E', color: '#8A8A9A' }}
            >
              ← ANTERIOR
            </button>
            <button
              onClick={onNext}
              disabled={qIndex >= qs.length - 1}
              className="flex-1 py-3 rounded-xl font-bebas text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: '#1A1A26', color: '#F0EDE8' }}
            >
              PRÓXIMA →
            </button>
          </div>

          <div className="mt-4 w-full h-1 rounded-full overflow-hidden" style={{ background: '#1E1E2E' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((qIndex + 1) / qs.length) * 100}%`,
                background: 'linear-gradient(to right, #FF4500, #FF8C00)',
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
