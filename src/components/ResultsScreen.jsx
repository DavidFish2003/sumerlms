import { motion } from 'framer-motion'
import ConfettiCanvas from './ConfettiCanvas'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * ResultsScreen
 * Final screen shown once all questions are answered.
 *
 * Props:
 *   score          {number}  – number of correct answers
 *   totalQuestions {number}  – total question count
 *   onRestart      {function} – resets the quiz
 */
export default function ResultsScreen({ score, totalQuestions, onRestart }) {
  const percentage  = Math.round((score / totalQuestions) * 100)
  const dashOffset  = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE

  const { emoji, label, color } = getGrade(percentage)

  return (
    <>
      {percentage >= 70 && <ConfettiCanvas />}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1   }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="card-glass"
        style={{ padding: '2.5rem 2rem', textAlign: 'center' }}
        role="main"
        aria-label="Quiz Results"
      >
        {/* ── Headline ── */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0   }}
          transition={{ delay: 0.15 }}
          style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}
        >
          Exam Complete
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0   }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '0.25rem' }}
        >
          {emoji} {label}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{ color: 'var(--color-text-2)', fontSize: '0.95rem', marginBottom: '2rem' }}
        >
          Here's how you performed across all subjects.
        </motion.p>

        {/* ── Score ring ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1   }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', position: 'relative' }}
        >
          <svg width="140" height="140" viewBox="0 0 140 140" aria-label={`Score: ${percentage}%`}>
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#6e8efb" />
                <stop offset="100%" stopColor="#a777e3" />
              </linearGradient>
            </defs>
            <circle cx="70" cy="70" r={RADIUS} className="score-ring-track" />
            <motion.circle
              cx="70" cy="70" r={RADIUS}
              className="score-ring-fill"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ delay: 0.45, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            />
          </svg>

          {/* Center label */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color }}>{percentage}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-2)', fontWeight: 600 }}>Score</span>
          </div>
        </motion.div>

        {/* ── Score breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0   }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {[
            { label: 'Correct',   value: score,                   color: 'var(--color-correct)' },
            { label: 'Incorrect', value: totalQuestions - score,  color: 'var(--color-wrong)'   },
            { label: 'Total',     value: totalQuestions,          color: 'var(--color-primary)'  },
          ].map(({ label, value, color: c }) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '12px',
                padding: '1rem 0.5rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: c }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-2)', fontWeight: 600, marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Restart button ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.6 }}
        >
          <button
            id="restart-quiz-btn"
            className="btn-primary"
            onClick={onRestart}
            style={{ width: '100%', maxWidth: '320px' }}
          >
            🔄 Restart Exam
          </button>
        </motion.div>
      </motion.div>
    </>
  )
}

/** Returns emoji, label, and highlight color based on percentage score */
function getGrade(pct) {
  if (pct >= 90) return { emoji: '🏆', label: 'Outstanding!',       color: '#e3b341' }
  if (pct >= 75) return { emoji: '🎉', label: 'Great Work!',         color: 'var(--color-correct)' }
  if (pct >= 60) return { emoji: '📚', label: 'Good Effort!',        color: 'var(--color-primary)' }
  if (pct >= 40) return { emoji: '💪', label: 'Keep Practicing!',    color: '#f0883e' }
  return           { emoji: '🔁', label: "Let's Try Again!",         color: 'var(--color-wrong)'   }
}
