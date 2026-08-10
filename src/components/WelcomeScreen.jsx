import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WelcomeScreen({ onStartExam }) {
  const [studentName, setStudentName] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All') // 'All', 'Math', 'Science', 'History'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!studentName.trim() || !selectedGrade) return
    onStartExam({
      name: studentName.trim(),
      grade: selectedGrade,
      subject: selectedSubject,
    })
  }

  // Curriculum topics metadata to show in the cards
  const curriculumDetails = {
    '3rd': {
      Math: ['Fractions & representations', 'Equivalent fractions', 'Word problems with fractions', 'Simple equations (x + 3 = 7)'],
      Science: ['Terrestrial & aquatic habitats', 'Producers, consumers & decomposers', 'Ecosystems & food chains', 'Three states of matter'],
      History: ['Community helpers & roles', 'American flag, Bald Eagle, Liberty Bell', 'US states, boundaries & coasts', 'Geographic landmarks'],
    },
    '5th': {
      Math: ['Exponents (2³ = 8)', 'Negative exponents & calculations', 'Multi-step algebraic equations', 'Operations with mixed fractions'],
      Science: ['The cell as the basic unit of life', 'Plant vs. animal cell structures', 'Cell organelles (nucleus, mitochondria, chloroplasts)', 'Characteristics of living things'],
      History: ['Declaration of Independence (1776)', 'Causes and events of the Civil War', 'Emancipation Proclamation & Lincoln', 'US Constitution & Bill of Rights'],
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="card-glass"
      style={{ padding: '2.5rem 2rem', width: '100%' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          style={{
            display: 'inline-block',
            fontSize: '3.5rem',
            marginBottom: '1rem',
          }}
        >
          🏫
        </motion.div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #6e8efb 0%, #a777e3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          SummerLMS portal
        </h1>
        <p style={{ color: 'var(--color-text-2)', fontSize: '0.95rem' }}>
          Welcome to the Bakersfield K-12 Interactive Examination Center.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Name input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Student Name
          </label>
          <input
            type="text"
            required
            placeholder="Enter your name..."
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '1.5px solid var(--color-border)',
              background: 'rgba(22, 27, 34, 0.6)',
              color: 'var(--color-text-1)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {/* Grade Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Your Grade Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {['3rd', '5th'].map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                style={{
                  padding: '1.25rem',
                  borderRadius: '14px',
                  border: selectedGrade === grade ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: selectedGrade === grade ? 'rgba(110, 142, 251, 0.15)' : 'rgba(22, 27, 34, 0.4)',
                  color: selectedGrade === grade ? '#fff' : 'var(--color-text-2)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedGrade === grade ? '0 0 15px rgba(110, 142, 251, 0.2)' : 'none',
                }}
              >
                🎒 Grade {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Selector */}
        <AnimatePresence>
          {selectedGrade && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' }}
            >
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select Subject / Topic Focus
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {['All', 'Math', 'Science', 'History'].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '10px',
                      border: selectedSubject === sub ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                      background: selectedSubject === sub ? 'rgba(110, 142, 251, 0.15)' : 'rgba(22, 27, 34, 0.4)',
                      color: selectedSubject === sub ? '#fff' : 'var(--color-text-2)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {sub === 'All' ? '📚 All' : sub === 'Math' ? '📐 Math' : sub === 'Science' ? '🔬 Science' : '🏛️ History'}
                  </button>
                ))}
              </div>

              {/* Syllabus Breakdown Preview */}
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem'
              }}>
                <p style={{ fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '0.5rem' }}>
                  🎯 Curriculum topics included:
                </p>
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-text-2)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {selectedSubject === 'All' ? (
                    <>
                      <li><strong>Math:</strong> {curriculumDetails[selectedGrade].Math[0]} & more</li>
                      <li><strong>Science:</strong> {curriculumDetails[selectedGrade].Science[0]} & more</li>
                      <li><strong>History:</strong> {curriculumDetails[selectedGrade].History[0]} & more</li>
                    </>
                  ) : (
                    curriculumDetails[selectedGrade][selectedSubject].map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))
                  )}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Button */}
        <button
          type="submit"
          className="btn-primary"
          disabled={!studentName.trim() || !selectedGrade}
          style={{
            padding: '1.1rem',
            fontSize: '1.05rem',
            marginTop: '1rem',
            width: '100%',
          }}
        >
          🚀 Start Assessment
        </button>
      </form>
    </motion.div>
  )
}
