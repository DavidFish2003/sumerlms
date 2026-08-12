import { motion, AnimatePresence } from 'framer-motion'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

/**
 * QuizCard
 * Renders a single question with its four answer options.
 *
 * Props:
 *   question       {object}  – question data object from questions.js
 *   questionNumber {number}  – 1-based display index
 *   totalQuestions {number}  – total count
 *   selectedAnswer {number|null} – selected option index or null
 *   onSelectAnswer {function}   – callback(optionIndex)
 */
export default function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
}) {
  const getOptionClass = (index) => {
    if (index === selectedAnswer) return 'option-btn selected'
    return 'option-btn'
  }

  const badgeClass = {
    Math:            'badge-math',
    Science:         'badge-science',
    History:         'badge-history',
    'Scenario-Based':'badge-scenario',
  }[question.subject] ?? 'badge-scenario'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 60, scale: 0.97 }}
        animate={{ opacity: 1, x: 0,  scale: 1    }}
        exit={   { opacity: 0, x: -60, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="card-glass"
        style={{ padding: '2rem' }}
        role="region"
        aria-label={`Question ${questionNumber} of ${totalQuestions}`}
      >
        {/* ── Header row ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span
            style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-3)', textTransform: 'uppercase' }}
          >
            Question {questionNumber} / {totalQuestions}
          </span>

          {/* Subject badge */}
          <span
            className={badgeClass}
            style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.8rem', borderRadius: '99px', letterSpacing: '0.04em' }}
          >
            {question.subject}
          </span>
        </div>

        {/* ── Question text ── */}
        <h2
          style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)', fontWeight: 700, lineHeight: 1.5, marginBottom: '1.75rem', color: 'var(--color-text-1)' }}
        >
          {question.questionText}
        </h2>

        {/* ── Options grid ── */}
        <div
          role="radiogroup"
          aria-label="Answer options"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              id={`option-${question.id}-${index}`}
              className={getOptionClass(index)}
              onClick={() => onSelectAnswer(index)}
              aria-pressed={selectedAnswer === index}
              whileTap={{ scale: 0.98 }}
            >
              <span className="option-index">{OPTION_LABELS[index]}</span>
              <span>{option}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

