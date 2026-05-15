import { Home, BookOpen, PenTool, Trophy, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'home', Icon: Home, label: 'Início' },
  { id: 'materias', Icon: BookOpen, label: 'Arsenal' },
  { id: 'redacao', Icon: PenTool, label: 'Redação' },
  { id: 'torneio', Icon: Trophy, label: 'Ranking' },
  { id: 'configuracoes', Icon: Settings, label: 'Config' },
]

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
         style={{ background: '#0D0D14', borderTop: '1px solid #1E1E2E' }}>
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ id, Icon, label }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200"
              style={{ color: isActive ? '#FF4500' : '#4A4A5A' }}
            >
              <Icon size={22} strokeWidth={1.5} />
              <span className="text-[10px] font-barlow font-semibold uppercase tracking-wide">
                {label}
              </span>
              {isActive && (
                <span className="block w-1.5 h-1.5 rounded-full" style={{ background: '#FF4500' }} />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
