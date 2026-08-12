import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { evaluateBadges } from '../services/achievements'
import ConfettiCanvas from './ConfettiCanvas'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const OPTION_LABELS = ['A', 'B', 'C', 'D']

/**
 * ResultsScreen
 * Final screen shown once all questions are answered.
 *
 * Props:
 *   score          {number}  – number of correct answers
 *   totalQuestions {number}  – total question count
 *   userAnswers    {array}   – list of { question, selectedAnswer, isCorrect }
 *   onRestart      {function} – resets the quiz
 */
export default function ResultsScreen({ score, totalQuestions, userAnswers = [], onRestart, dbSyncStatus, dbError, history = [] }) {
  const percentage  = Math.round((score / totalQuestions) * 100)
  const dashOffset  = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE
  const [showReview, setShowReview] = useState(false)
  const [newBadges, setNewBadges] = useState([])

  const { emoji, label, color } = getGrade(percentage)

  // Evaluate badges for this exam result
  useEffect(() => {
    const currentResult = { percentage, subject: 'Mixed' }
    const { newBadges } = evaluateBadges(currentResult, history)
    setNewBadges(newBadges)
  }, [percentage, history])

  return (
    <>
      {percentage >= 70 && <ConfettiCanvas />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
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
            style={{ color: 'var(--color-text-2)', fontSize: '0.95rem', marginBottom: '1.25rem' }}
          >
            Here's how you performed across all subjects.
          </motion.p>

          {dbSyncStatus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                background: dbSyncStatus === 'saving'
                  ? 'rgba(110, 142, 251, 0.1)'
                  : dbSyncStatus === 'saved'
                    ? 'rgba(46, 160, 67, 0.1)'
                    : 'rgba(240, 136, 62, 0.1)',
                border: `1px solid ${
                  dbSyncStatus === 'saving'
                    ? 'rgba(110, 142, 251, 0.3)'
                    : dbSyncStatus === 'saved'
                      ? 'rgba(46, 160, 67, 0.3)'
                      : 'rgba(240, 136, 62, 0.3)'
                }`,
                color: dbSyncStatus === 'saving'
                  ? 'var(--color-primary)'
                  : dbSyncStatus === 'saved'
                    ? 'var(--color-correct)'
                    : '#f0883e'
              }}
            >
              {dbSyncStatus === 'saving' && (
                <>⏳ Syncing results to database...</>
              )}
              {dbSyncStatus === 'saved' && (
                <>☁️ Synchronized to Database</>
              )}
              {dbSyncStatus === 'error' && (
                <>💾 Saved locally (Offline mode: {dbError})</>
              )}
            </motion.div>
          )}

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

          {/* ── Action Buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', smDirection: 'row', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}
          >
            <button
              id="restart-quiz-btn"
              className="btn-primary"
              onClick={onRestart}
              style={{ width: '100%', maxWidth: '320px' }}
            >
              🔄 Restart Exam
            </button>

            {userAnswers.length > 0 && (
              <button
                type="button"
                onClick={() => setShowReview(prev => !prev)}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '0.85rem 2rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  border: '1.5px solid var(--color-border)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--color-text-1)',
                  transition: 'all 0.2s ease',
                }}
              >
                {showReview ? '🙈 Hide Answers' : '📋 Review Answers'}
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* New Badges earned */}
        {newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-1)' }}>New Badges Earned</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {newBadges.map(badge => (
                <span key={badge.id} className="badge" style={{ background: badge.gradient, color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.85rem' }}>
                  {badge.icon} {badge.title}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Expandable Answer Review Section ── */}
        <AnimatePresence>
          {showReview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-1)', borderBottom: '1.5px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                Answer Key & Review
              </h2>

              {userAnswers.map(({ question, selectedAnswer, isCorrect }, idx) => {
                const badgeClass = {
                  Math:            'badge-math',
                  Science:         'badge-science',
                  History:         'badge-history',
                  'Scenario-Based':'badge-scenario',
                }[question.subject] ?? 'badge-scenario'

                return (
                  <div
                    key={question.id}
                    className="card-glass"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      borderLeft: `4px solid ${isCorrect ? 'var(--color-correct)' : 'var(--color-wrong)'}`,
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-3)' }}>
                        Question {idx + 1}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className={badgeClass} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '99px' }}>
                          {question.subject}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: isCorrect ? 'var(--color-correct)' : 'var(--color-wrong)'
                        }}>
                          {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                        </span>
                      </div>
                    </div>

                    {/* Question Text */}
                    <p style={{ fontWeight: 600, color: 'var(--color-text-1)', fontSize: '0.95rem' }}>
                      {question.questionText}
                    </p>

                    {/* Options list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {question.options.map((option, optIdx) => {
                        let borderStyle = '1.5px solid var(--color-border)'
                        let bgStyle = 'rgba(255, 255, 255, 0.02)'
                        let indicator = ''

                        if (optIdx === question.correctAnswer) {
                          borderStyle = '1.5px solid var(--color-correct)'
                          bgStyle = 'var(--color-correct-bg)'
                          indicator = ' (Correct Answer)'
                        } else if (optIdx === selectedAnswer) {
                          borderStyle = '1.5px solid var(--color-wrong)'
                          bgStyle = 'var(--color-wrong-bg)'
                          indicator = ' (Your Choice)'
                        }

                        return (
                          <div
                            key={optIdx}
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '10px',
                              border: borderStyle,
                              background: bgStyle,
                              fontSize: '0.875rem',
                              color: 'var(--color-text-1)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>
                              <strong style={{ marginRight: '0.5rem' }}>{OPTION_LABELS[optIdx]}.</strong>
                              {option}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: optIdx === question.correctAnswer ? 'var(--color-correct)' : 'var(--color-wrong)' }}>
                              {indicator}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
