import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BADGES, evaluateBadges } from '../services/achievements'

export default function AnalyticsDashboard({ history = [], studentName = '' }) {
  const [activeTab, setActiveTab] = useState('charts') // 'charts' | 'trophies'

  if (!history || history.length === 0) return null

  // Calculate stats
  const totalExams = history.length
  const totalPercentageSum = history.reduce((acc, item) => acc + (item.percentage || 0), 0)
  const avgScore = Math.round(totalPercentageSum / totalExams)
  const highestScore = Math.max(...history.map((item) => item.percentage || 0))

  // Calculate subject mastery averages
  const subjectStats = {}
  history.forEach((item) => {
    const sub = item.subject || 'All'
    if (!subjectStats[sub]) {
      subjectStats[sub] = { sum: 0, count: 0 }
    }
    subjectStats[sub].sum += item.percentage || 0
    subjectStats[sub].count += 1
  })

  const subjectMastery = Object.keys(subjectStats).map((sub) => ({
    subject: sub,
    avg: Math.round(subjectStats[sub].sum / subjectStats[sub].count),
    count: subjectStats[sub].count,
  }))

  // Evaluate unlocked badges
  const { unlockedBadges } = evaluateBadges(null, history)
  const unlockedIds = new Set(unlockedBadges.map((b) => b.id))

  // Prepare chart coordinates for score progression line chart (chronological: oldest to newest)
  const chronologicalHistory = [...history].reverse()
  const chartWidth = 320
  const chartHeight = 110
  const padding = 20

  const points = chronologicalHistory.map((item, idx) => {
    const x = padding + (idx / Math.max(1, chronologicalHistory.length - 1)) * (chartWidth - 2 * padding)
    const y = chartHeight - padding - ((item.percentage || 0) / 100) * (chartHeight - 2 * padding)
    return { x, y, percentage: item.percentage, date: item.completedAt, subject: item.subject }
  })

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  const getSubjectColor = (sub) => {
    switch (sub) {
      case 'Math': return '#6e8efb'
      case 'Science': return '#3fb950'
      case 'History': return '#e3b341'
      case 'Scenario-Based': return '#f0883e'
      default: return '#a777e3'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        marginTop: '1rem',
        padding: '1.25rem',
        borderRadius: '16px',
        background: 'rgba(22, 27, 34, 0.75)',
        border: '1.5px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* ── Dashboard Navigation Tabs ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-1)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>📊</span>
          <span>Analytics & Trophies</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', fontWeight: 500 }}>({studentName})</span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('charts')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: activeTab === 'charts' ? '1px solid var(--color-primary)' : '1px solid transparent',
              background: activeTab === 'charts' ? 'rgba(110, 142, 251, 0.15)' : 'transparent',
              color: activeTab === 'charts' ? '#fff' : 'var(--color-text-2)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            📈 Performance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trophies')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: activeTab === 'trophies' ? '1px solid #e3b341' : '1px solid transparent',
              background: activeTab === 'trophies' ? 'rgba(227, 179, 65, 0.15)' : 'transparent',
              color: activeTab === 'trophies' ? '#fff' : 'var(--color-text-2)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            🏆 Badges ({unlockedBadges.length}/{BADGES.length})
          </button>
        </div>
      </div>

      {/* ── Top Summary Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        <div style={{ padding: '0.65rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-3)', fontWeight: 600 }}>Total Exams</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-1)', marginTop: '0.1rem' }}>{totalExams}</div>
        </div>
        <div style={{ padding: '0.65rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-3)', fontWeight: 600 }}>Average</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: avgScore >= 70 ? 'var(--color-correct)' : 'var(--color-wrong)', marginTop: '0.1rem' }}>{avgScore}%</div>
        </div>
        <div style={{ padding: '0.65rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-3)', fontWeight: 600 }}>High Score</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e3b341', marginTop: '0.1rem' }}>{highestScore}%</div>
        </div>
        <div style={{ padding: '0.65rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-3)', fontWeight: 600 }}>Badges</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0883e', marginTop: '0.1rem' }}>{unlockedBadges.length}</div>
        </div>
      </div>

      {/* ── TAB 1: PERFORMANCE CHARTS ── */}
      {activeTab === 'charts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Score Trend SVG Line Chart */}
          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-2)' }}>📈 Score Trend Over Time</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-3)' }}>Past {chronologicalHistory.length} attempt{chronologicalHistory.length > 1 ? 's' : ''}</span>
            </div>

            <div style={{ width: '100%', overflowX: 'auto' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                {/* Horizontal reference grid lines */}
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.1)" />

                {/* Score trend line */}
                {points.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePoints}
                  />
                )}

                {/* Glowing data points */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="4" fill={getSubjectColor(p.subject)} stroke="#fff" strokeWidth="1.5" />
                    <text x={p.x} y={p.y - 7} textAnchor="middle" fill="#e6edf3" fontSize="8" fontWeight="bold">
                      {p.percentage}%
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Subject Mastery Bar Chart */}
          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-2)', display: 'block', marginBottom: '0.75rem' }}>
              🎯 Subject Mastery Accuracy
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {subjectMastery.map((item) => {
                const color = getSubjectColor(item.subject)
                return (
                  <div key={item.subject} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-1)' }}>
                        {item.subject === 'All' ? '📚 All Subjects' : item.subject}
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-3)', marginLeft: '0.3rem' }}>({item.count} test{item.count > 1 ? 's' : ''})</span>
                      </span>
                      <span style={{ fontWeight: 800, color }}>{item.avg}%</span>
                    </div>

                    <div style={{ height: '7px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.avg}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ height: '100%', background: color, borderRadius: '99px' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 2: TROPHY CABINET BADGES ── */}
      {activeTab === 'trophies' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
          {BADGES.map((badge) => {
            const isUnlocked = unlockedIds.has(badge.id)

            return (
              <div
                key={badge.id}
                style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: isUnlocked ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.25)',
                  border: isUnlocked ? '1.5px solid rgba(227, 179, 65, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                  opacity: isUnlocked ? 1 : 0.45,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isUnlocked ? badge.gradient : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                    boxShadow: isUnlocked ? '0 0 10px rgba(227, 179, 65, 0.3)' : 'none',
                  }}
                >
                  {isUnlocked ? badge.icon : '🔒'}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isUnlocked ? '#fff' : 'var(--color-text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {badge.title}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-3)', marginTop: '0.1rem', lineHeight: '1.2' }}>
                    {badge.description}
                  </div>
                </div>
              </div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
