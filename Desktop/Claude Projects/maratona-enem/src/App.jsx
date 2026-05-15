import { useState, useEffect } from 'react'
import Home from './screens/Home'
import Materias from './screens/Materias'
import Redacao from './screens/Redacao'
import Torneio from './screens/Torneio'
import Configuracoes from './screens/Configuracoes'
import Progresso from './screens/Progresso'
import Planos from './screens/Planos'
import Diagnostico from './screens/Diagnostico'
import BottomNav from './components/BottomNav'
import { isDiagnosticoFeito, initTrial } from './utils/storage'

const MAIN_SCREENS = {
  home: Home,
  materias: Materias,
  redacao: Redacao,
  torneio: Torneio,
  configuracoes: Configuracoes,
}

// Screens without bottom nav (full-screen, back-button navigation)
const FULL_SCREENS = {
  progresso: Progresso,
  planos: Planos,
}

export default function App() {
  const [diagDone, setDiagDone] = useState(() => isDiagnosticoFeito())
  const [screen, setScreen] = useState('home')
  const [fading, setFading] = useState(false)

  useEffect(() => {
    initTrial()
  }, [])

  const navigate = (newScreen) => {
    if (newScreen === screen || fading) return
    setFading(true)
    setTimeout(() => {
      setScreen(newScreen)
      setFading(false)
    }, 180)
  }

  // Gate: show diagnostic before the main app
  if (!diagDone) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex justify-center font-inter">
        <div className="w-full max-w-[430px] min-h-screen overflow-y-auto">
          <Diagnostico onComplete={() => setDiagDone(true)} />
        </div>
      </div>
    )
  }

  // Full-screen secondary screens (no bottom nav)
  if (FULL_SCREENS[screen]) {
    const FullScreen = FULL_SCREENS[screen]
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex justify-center font-inter">
        <div className="w-full max-w-[430px] min-h-screen overflow-y-auto">
          <div className={`transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}>
            <FullScreen navigate={navigate} />
          </div>
        </div>
      </div>
    )
  }

  const CurrentScreen = MAIN_SCREENS[screen] || Home

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex justify-center font-inter">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative">
        <main
          className={`flex-1 overflow-y-auto pb-20 transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}
        >
          <CurrentScreen navigate={navigate} />
        </main>
        <BottomNav active={screen} onNavigate={navigate} />
      </div>
    </div>
  )
}
