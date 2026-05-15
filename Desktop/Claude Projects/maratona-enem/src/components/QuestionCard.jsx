import { useState } from 'react'
import { addPoints, recordCorrectAnswer } from '../utils/storage'

const NIVEL_CONFIG = {
  facil:  { label: 'Fácil',  points: 5,  dot: '🟢', bg: '#00281A', text: '#00C853' },
  medio:  { label: 'Médio',  points: 10, dot: '🟡', bg: '#1A1400', text: '#FFD700' },
  dificil:{ label: 'Difícil',points: 20, dot: '🔴', bg: '#1A0005', text: '#FF2D55' },
}

export default function QuestionCard({ questao, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const nivel = NIVEL_CONFIG[questao.nivel] || NIVEL_CONFIG.medio

  const handleSelect = (letra) => {
    if (revealed) return
    setSelected(letra)
  }

  const handleConfirm = () => {
    if (!selected || revealed) return
    setRevealed(true)
    const correct = selected === questao.gabarito
    if (correct) {
      addPoints(nivel.points)
      recordCorrectAnswer()
    }
    onAnswer?.({ correct, points: correct ? nivel.points : 0 })
  }

  const getAltStyle = (letra) => {
    if (!revealed) {
      return selected === letra
        ? { border: '1px solid #FF4500', background: '#1E0D00', color: '#F0EDE8' }
        : { border: '1px solid #2A2A3A', background: '#1A1A26', color: '#8A8A9A' }
    }
    if (letra === questao.gabarito)
      return { border: '1px solid #00C853', background: '#001A0D', color: '#00C853' }
    if (letra === selected && letra !== questao.gabarito)
      return { border: '1px solid #FF2D55', background: '#1A0005', color: '#FF2D55' }
    return { border: '1px solid #1E1E2E', background: '#111118', color: '#4A4A5A' }
  }

  return (
    <div className="rounded-xl p-5 border border-[#1E1E2E] animate-fadeUp" style={{ background: '#111118' }}>
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-xs font-barlow font-semibold uppercase tracking-wider px-2 py-1 rounded-md"
          style={{ background: nivel.bg, color: nivel.text }}
        >
          {nivel.dot} {nivel.label}
        </span>
        <span className="text-xs font-barlow font-bold" style={{ color: '#C9A84C' }}>
          +{nivel.points} pts
        </span>
      </div>

      <p className="text-[15px] font-inter leading-relaxed mb-5" style={{ color: '#F0EDE8' }}>
        {questao.enunciado}
      </p>

      <div className="flex flex-col gap-2 mb-4">
        {Object.entries(questao.alternativas).map(([letra, texto]) => (
          <button
            key={letra}
            onClick={() => handleSelect(letra)}
            className="flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200"
            style={getAltStyle(letra)}
          >
            <span className="font-bebas text-lg leading-none w-5 shrink-0">{letra}</span>
            <span className="text-sm font-inter leading-snug">{texto}</span>
          </button>
        ))}
      </div>

      {!revealed ? (
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className={`w-full py-3 rounded-xl font-bebas text-lg tracking-wider transition-all duration-200 ${
            selected ? 'animate-ctaPulse' : ''
          }`}
          style={
            selected
              ? { background: 'linear-gradient(135deg, #FF4500, #FF8C00)', color: '#fff' }
              : { background: '#1E1E2E', color: '#4A4A5A', cursor: 'not-allowed' }
          }
        >
          CONFIRMAR RESPOSTA
        </button>
      ) : (
        <div
          className="rounded-xl p-4"
          style={
            selected === questao.gabarito
              ? { background: '#001A0D', border: '1px solid rgba(0,200,83,0.4)' }
              : { background: '#1A0005', border: '1px solid rgba(255,45,85,0.4)' }
          }
        >
          <p
            className="font-bebas text-xl mb-1 tracking-wide"
            style={{ color: selected === questao.gabarito ? '#00C853' : '#FF2D55' }}
          >
            {selected === questao.gabarito
              ? `ISSO! Mais um passo rumo ao topo. +${nivel.points}pts 🔥`
              : 'Errou. Mas você sabe onde melhorar. Vai fundo.'}
          </p>
          <p className="text-xs font-inter leading-relaxed" style={{ color: '#8A8A9A' }}>
            {questao.explicacao}
          </p>
        </div>
      )}
    </div>
  )
}
