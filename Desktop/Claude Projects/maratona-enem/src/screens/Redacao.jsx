import { useState } from 'react'
import { addPoints, getPoints, addRedacao } from '../utils/storage'

const SYSTEM_PROMPT = `Você é um corretor especialista em redações do ENEM com critério de notas 1000.
Avalie a redação a seguir usando as 5 competências oficiais do ENEM:

1. Domínio da norma culta da língua escrita
2. Compreensão da proposta e aplicação de conceitos das várias áreas do conhecimento
3. Capacidade de seleção, relação e organização de informações em defesa de um ponto de vista
4. Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação
5. Elaboração de proposta de intervenção para o problema abordado, respeitando os direitos humanos

Para cada competência, dê:
- Uma nota de 0 a 200
- Um comentário detalhado com pontos fortes e fracos
- Sugestões específicas de melhoria

Ao final, some as 5 notas e dê a NOTA FINAL de 0 a 1000.
Inclua também um parágrafo geral de feedback motivacional.
Use o tema informado para avaliar a pertinência do texto.
Responda SEMPRE em português do Brasil, de forma clara e didática.

Formate sua resposta como JSON no seguinte formato:
{
  "competencias": [
    {"numero": 1, "nome": "...", "nota": 000, "pontosFortes": "...", "pontosFracos": "...", "sugestoes": "..."},
    {"numero": 2, "nome": "...", "nota": 000, "pontosFortes": "...", "pontosFracos": "...", "sugestoes": "..."},
    {"numero": 3, "nome": "...", "nota": 000, "pontosFortes": "...", "pontosFracos": "...", "sugestoes": "..."},
    {"numero": 4, "nome": "...", "nota": 000, "pontosFortes": "...", "pontosFracos": "...", "sugestoes": "..."},
    {"numero": 5, "nome": "...", "nota": 000, "pontosFortes": "...", "pontosFracos": "...", "sugestoes": "..."}
  ],
  "notaFinal": 000,
  "feedbackMotivacional": "..."
}`

export default function Redacao() {
  const [tema, setTema] = useState('')
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')
  const [pointsAwarded, setPointsAwarded] = useState(false)
  const [userPoints, setUserPoints] = useState(getPoints())

  const wordCount = texto.trim().split(/\s+/).filter(Boolean).length

  const analisar = async () => {
    if (!tema.trim() || wordCount < 100) {
      setError('Preencha o tema e escreva pelo menos 100 palavras na redação.')
      return
    }
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) {
      setError('Chave da API não configurada. Crie um arquivo .env com VITE_ANTHROPIC_API_KEY.')
      return
    }

    setLoading(true)
    setError('')
    setResultado(null)
    setPointsAwarded(false)

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
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Tema da redação: "${tema}"\n\nTexto da redação:\n${texto}`,
            },
          ],
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `Erro HTTP ${res.status}`)
      }

      const data = await res.json()
      const raw = data.content[0].text

      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Resposta inválida da IA. Tente novamente.')

      const parsed = JSON.parse(jsonMatch[0])
      setResultado(parsed)

      addPoints(50)
      setUserPoints(getPoints())
      setPointsAwarded(true)
      addRedacao({ tema, nota_total: parsed.notaFinal, competencias: parsed.competencias })
    } catch (e) {
      setError(`Erro: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getNota = (nota) => {
    if (nota >= 160) return { color: '#00C853', bar: '#00C853', label: 'Excelente' }
    if (nota >= 100) return { color: '#FFD700', bar: '#FFD700', label: 'Bom' }
    return { color: '#FF2D55', bar: '#FF2D55', label: 'Precisa melhorar' }
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-4 animate-screenEnter" style={{ background: '#0A0A0F' }}>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-bebas text-4xl tracking-[3px]" style={{ color: '#F0EDE8' }}>
          ✍️ REDAÇÃO
        </h1>
        <div className="text-right">
          <p className="font-bebas text-lg" style={{ color: '#C9A84C' }}>
            {userPoints.toLocaleString('pt-BR')}
          </p>
          <p className="text-[9px] font-barlow font-semibold uppercase" style={{ color: '#4A4A5A' }}>pontos</p>
        </div>
      </div>
      <p className="text-xs font-inter mb-6" style={{ color: '#8A8A9A' }}>
        Corrija sua redação com IA — critérios oficiais do ENEM
      </p>

      {!resultado ? (
        <div className="flex flex-col gap-4">
          {/* Tema */}
          <div>
            <label className="block text-xs font-barlow font-semibold uppercase tracking-wider mb-2"
                   style={{ color: '#8A8A9A' }}>
              Tema da redação
            </label>
            <input
              type="text"
              value={tema}
              onChange={e => setTema(e.target.value)}
              placeholder="Ex: Desigualdade no acesso à internet no Brasil"
              className="w-full rounded-xl px-4 py-3 text-sm font-inter outline-none transition-all"
              style={{
                background: '#111118',
                border: '1px solid #2A2A3A',
                color: '#F0EDE8',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#FF4500'
                e.target.style.boxShadow = '0 0 0 2px rgba(255,69,0,0.15)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#2A2A3A'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Texto */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-barlow font-semibold uppercase tracking-wider"
                     style={{ color: '#8A8A9A' }}>
                Texto da redação
              </label>
              <span
                className="text-xs font-barlow font-semibold"
                style={{ color: wordCount >= 250 ? '#00C853' : wordCount >= 100 ? '#FFD700' : '#4A4A5A' }}
              >
                ~{wordCount} palavras
              </span>
            </div>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Cole ou escreva aqui sua redação completa (mínimo 100 palavras)..."
              rows={14}
              className="w-full rounded-xl px-4 py-3 text-sm font-inter outline-none resize-none leading-relaxed transition-all"
              style={{
                background: '#0D0D14',
                border: '1px solid #2A2A3A',
                color: '#F0EDE8',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#FF4500'
                e.target.style.boxShadow = '0 0 0 2px rgba(255,69,0,0.15)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#2A2A3A'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Tips */}
          <div className="rounded-xl p-4 border border-[#1E1E2E]" style={{ background: '#111118' }}>
            <p className="font-bebas text-base mb-2 tracking-wide" style={{ color: '#F0EDE8' }}>
              💡 DICAS PARA UMA BOA REDAÇÃO
            </p>
            <ul className="space-y-1">
              {[
                'Estruture: introdução, 2 parágrafos de desenvolvimento, conclusão com proposta de intervenção',
                'Apresente um ponto de vista claro e argumentos consistentes',
                'Use conectivos para dar coesão ao texto',
                'A proposta de intervenção deve ter: ação, agente, modo, finalidade',
              ].map((tip, i) => (
                <li key={i} className="text-xs font-inter flex gap-2" style={{ color: '#8A8A9A' }}>
                  <span className="shrink-0" style={{ color: '#FF4500' }}>•</span> {tip}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.4)' }}>
              <p className="text-sm font-inter" style={{ color: '#FF2D55' }}>{error}</p>
            </div>
          )}

          <button
            onClick={analisar}
            disabled={loading || !tema.trim() || wordCount < 100}
            className="w-full py-4 rounded-xl font-bebas text-2xl tracking-wider transition-all duration-200"
            style={
              loading || !tema.trim() || wordCount < 100
                ? { background: '#1E1E2E', color: '#4A4A5A', cursor: 'not-allowed' }
                : { background: 'linear-gradient(135deg, #FF4500, #FF8C00)', color: '#fff', boxShadow: '0 0 20px rgba(255,69,0,0.3)' }
            }
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Analisando com IA...
              </span>
            ) : (
              'ANALISAR MINHA REDAÇÃO 🔥'
            )}
          </button>
          <p className="text-center text-[10px] font-inter" style={{ color: '#2A2A3A' }}>
            +50 pontos ao analisar • Powered by Claude AI
          </p>
        </div>
      ) : (
        <ResultadoView
          resultado={resultado}
          pointsAwarded={pointsAwarded}
          getNota={getNota}
          onReset={() => { setResultado(null); setPointsAwarded(false) }}
        />
      )}
    </div>
  )
}

function ResultadoView({ resultado, pointsAwarded, getNota, onReset }) {
  const maxNota = 1000
  const pct = Math.round((resultado.notaFinal / maxNota) * 100)
  const notaCfg = getNota(resultado.notaFinal / 5)

  return (
    <div className="flex flex-col gap-4 animate-fadeUp">
      {pointsAwarded && (
        <div className="rounded-xl p-3 text-center"
             style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.4)' }}>
          <p className="font-bebas text-2xl" style={{ color: '#C9A84C' }}>🎉 +50 PONTOS ADICIONADOS!</p>
        </div>
      )}

      {/* Nota final */}
      <div className="rounded-xl p-6 text-center border border-[#1E1E2E]"
           style={{ background: '#111118', borderTop: '2px solid #C9A84C' }}>
        <p className="text-xs font-barlow font-semibold uppercase tracking-widest mb-2" style={{ color: '#8A8A9A' }}>
          Nota Final ENEM
        </p>
        <p
          className="font-bebas leading-none text-shadow-gold"
          style={{ fontSize: '72px', color: notaCfg.color, textShadow: `0 0 30px ${notaCfg.color}66` }}
        >
          {resultado.notaFinal}
        </p>
        <p className="text-sm font-inter" style={{ color: '#4A4A5A' }}>/ 1000 pontos</p>
        <div className="w-full h-3 rounded-full overflow-hidden mt-4" style={{ background: '#1E1E2E' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: notaCfg.bar }}
          />
        </div>
      </div>

      {/* Competências */}
      <div>
        <h2 className="font-bebas text-xl mb-3 tracking-wide" style={{ color: '#F0EDE8' }}>
          📊 POR COMPETÊNCIA
        </h2>
        <div className="flex flex-col gap-3">
          {resultado.competencias.map((comp) => {
            const cfg = getNota(comp.nota)
            return (
              <div key={comp.numero} className="rounded-xl p-4 border border-[#1E1E2E]" style={{ background: '#111118' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-inter font-semibold text-sm leading-tight flex-1 pr-2" style={{ color: '#F0EDE8' }}>
                    C{comp.numero}: {comp.nome}
                  </p>
                  <span className="font-bebas text-2xl shrink-0" style={{ color: cfg.color }}>{comp.nota}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: '#1E1E2E' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(comp.nota / 200) * 100}%`, background: cfg.bar }}
                  />
                </div>
                {comp.pontosFortes && (
                  <p className="text-xs font-inter mb-1" style={{ color: 'rgba(0,200,83,0.8)' }}>
                    <span className="font-semibold" style={{ color: '#00C853' }}>✓ Pontos fortes:</span>{' '}
                    {comp.pontosFortes}
                  </p>
                )}
                {comp.pontosFracos && (
                  <p className="text-xs font-inter mb-1" style={{ color: 'rgba(255,45,85,0.8)' }}>
                    <span className="font-semibold" style={{ color: '#FF2D55' }}>✗ Pontos fracos:</span>{' '}
                    {comp.pontosFracos}
                  </p>
                )}
                {comp.sugestoes && (
                  <p className="text-xs font-inter" style={{ color: 'rgba(201,168,76,0.8)' }}>
                    <span className="font-semibold" style={{ color: '#C9A84C' }}>💡 Sugestões:</span>{' '}
                    {comp.sugestoes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Feedback motivacional */}
      {resultado.feedbackMotivacional && (
        <div className="rounded-xl p-4"
             style={{ background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.3)', borderLeft: '3px solid #FF4500' }}>
          <p className="font-bebas text-lg mb-2 tracking-wide" style={{ color: '#FF4500' }}>
            🔥 FEEDBACK DO CORRETOR
          </p>
          <p className="text-sm font-inter leading-relaxed" style={{ color: '#F0EDE8' }}>
            {resultado.feedbackMotivacional}
          </p>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-4 rounded-xl font-bebas text-xl transition-all"
        style={{ border: '1px solid #2A2A3A', color: '#8A8A9A' }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#1A1A26'
          e.currentTarget.style.color = '#F0EDE8'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#8A8A9A'
        }}
      >
        ✍️ NOVA REDAÇÃO
      </button>
    </div>
  )
}
