import { useState, useEffect } from 'react'

const ENEM_DATE = new Date('2026-11-08T08:00:00')

function getTimeLeft() {
  const now = new Date()
  const diff = ENEM_DATE - now

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    over: false,
  }
}

export default function Countdown() {
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (time.over) {
    return (
      <div className="rounded-xl p-4 text-center glow-fire animate-pulse2"
           style={{ background: '#111118', borderTop: '2px solid #FF4500' }}>
        <p className="font-bebas text-3xl tracking-widest" style={{ color: '#FF4500' }}>
          🎯 O ENEM CHEGOU! BOA PROVA!
        </p>
      </div>
    )
  }

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="rounded-xl p-4" style={{ background: '#111118', borderTop: '2px solid #FF4500' }}>
      <p className="text-[11px] font-barlow font-semibold text-center mb-3 uppercase tracking-widest"
         style={{ color: '#8A8A9A' }}>
        até o ENEM 2026 🔥
      </p>
      <div className="flex items-center justify-center gap-3">
        <TimeBlock value={time.days} label="DIAS" />
        <Colon />
        <TimeBlock value={pad(time.hours)} label="HRS" />
        <Colon />
        <TimeBlock value={pad(time.minutes)} label="MIN" />
        <Colon />
        <TimeBlock value={pad(time.seconds)} label="SEG" />
      </div>
    </div>
  )
}

function TimeBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[48px]">
      <span className="font-bebas leading-none" style={{ fontSize: '42px', color: '#FF4500' }}>{value}</span>
      <span className="text-[11px] font-barlow font-semibold uppercase tracking-wider" style={{ color: '#8A8A9A' }}>
        {label}
      </span>
    </div>
  )
}

function Colon() {
  return (
    <span className="font-bebas text-3xl mb-5 animate-blink" style={{ color: '#FF4500' }}>:</span>
  )
}
