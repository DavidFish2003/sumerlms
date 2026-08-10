import { useRef, useEffect } from 'react'

/**
 * ConfettiCanvas
 * Lightweight confetti animation painted to a <canvas> element.
 * Runs once when mounted, auto-clears after ~3.5 s.
 */
export default function ConfettiCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS = ['#6e8efb', '#a777e3', '#3fb950', '#e3b341', '#f0883e', '#58a6ff']
    const PIECES = 180

    const particles = Array.from({ length: PIECES }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * -canvas.height,
      w:     Math.random() * 10 + 5,
      h:     Math.random() * 6  + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      r:     Math.random() * Math.PI * 2,
      rSpeed: (Math.random() - 0.5) * 0.15,
      speed: Math.random() * 3 + 2,
      drift: (Math.random() - 0.5) * 1.5,
    }))

    let frame
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.save()
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2)
        ctx.rotate(p.r)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.85
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
        p.y     += p.speed
        p.x     += p.drift
        p.r     += p.rSpeed
      })
      frame = requestAnimationFrame(draw)
    }
    draw()

    const timeout = setTimeout(() => {
      cancelAnimationFrame(frame)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }, 3500)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timeout)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />
}
