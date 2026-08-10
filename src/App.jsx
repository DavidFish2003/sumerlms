import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getQuestions } from './data/questions'
import QuizCard from './components/QuizCard'
import ResultsScreen from './components/ResultsScreen'
import WelcomeScreen from './components/WelcomeScreen'

/** Shuffles an array using Fisher-Yates */
function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * App — Root component / Quiz Engine
 *
 * State:
 *   studentInfo          {object|null} – {name, grade, subject} or null if not started
 *   quizQuestions        {array}       – list of questions selected for this session
 *   currentQuestionIndex {number}      – index in quizQuestions
 *   score                {number}      – correct answer counter
 *   selectedAnswer       {number|null} – currently selected option
 *   isQuizComplete       {boolean}     – true when all questions answered
 */
export default function App() {
  const [studentInfo,          setStudentInfo]          = useState(null)
  const [quizQuestions,        setQuizQuestions]        = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score,                setScore]                = useState(0)
  const [selectedAnswer,       setSelectedAnswer]       = useState(null)
  const [isQuizComplete,       setIsQuizComplete]       = useState(false)
  const [userAnswers,          setUserAnswers]          = useState([]) // Array of { question, selectedAnswer, isCorrect }

  // Configure how many questions per test run
  const questionsPerSession = 40

  /** Handles the setup from the Welcome screen */
  const handleStartExam = useCallback(({ name, grade, subject }) => {
    // 1. Get filtered list of questions based on choices
    const subjectFilter = subject === 'All' ? null : subject
    const rawList = getQuestions(grade, subjectFilter)

    // 2. Shuffle the matching questions
    const shuffledList = shuffleArray(rawList)

    // 3. Slice a subset so it's not too long for students (up to 40)
    const sessionList = shuffledList.slice(0, Math.min(questionsPerSession, shuffledList.length))

    setStudentInfo({ name, grade, subject })
    setQuizQuestions(sessionList)
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setIsQuizComplete(false)
    setUserAnswers([])
  }, [])

  const totalQuestions  = quizQuestions.length
  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progressPercent = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0

  /** Called when the student taps an answer option */
  const handleSelectAnswer = useCallback((optionIndex) => {
    setSelectedAnswer(optionIndex)
  }, [])

  /** Move to next question or finalise exam */
  const handleNext = useCallback(() => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    
    // Save current question's result
    const newAnswer = {
      question: currentQuestion,
      selectedAnswer: selectedAnswer,
      isCorrect: isCorrect
    }
    
    setUserAnswers(prev => [...prev, newAnswer])
    
    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    const next = currentQuestionIndex + 1
    if (next >= totalQuestions) {
      setIsQuizComplete(true)
    } else {
      setCurrentQuestionIndex(next)
      setSelectedAnswer(null)
    }
  }, [currentQuestionIndex, totalQuestions, selectedAnswer, currentQuestion])

  /** Reset student state to selection screen */
  const handleRestart = useCallback(() => {
    setStudentInfo(null)
    setQuizQuestions([])
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setIsQuizComplete(false)
    setUserAnswers([])
  }, [])


  return (
    <div
      className="bg-animated"
      style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}
    >
      {/* ── App Header ─────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(13,17,23,0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            maxWidth: '780px', margin: '0 auto',
            padding: '0.9rem 1.5rem',
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}
        >
          {/* Logo mark */}
          <div
            aria-hidden="true"
            style={{
              width: '2.2rem', height: '2.2rem', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg, #6e8efb 0%, #a777e3 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}
          >
            🏫
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.2 }}>
              SummerLMS Portal
            </p>
            <h1 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-1)', lineHeight: 1.2 }}>
              {studentInfo ? `${studentInfo.name}'s Exam` : 'Interactive K-12 Examination'}
            </h1>
          </div>

          {/* Student Class / Subject Chip */}
          {studentInfo && (
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}
            >
              <span
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-2)',
                }}
              >
                Grade {studentInfo.grade}
              </span>
              {!isQuizComplete && (
                <div
                  style={{
                    padding: '0.3rem 0.6rem', borderRadius: '6px',
                    background: 'rgba(110,142,251,0.12)',
                    border: '1px solid rgba(110,142,251,0.25)',
                    fontSize: '0.75rem', fontWeight: 700,
                    color: 'var(--color-primary)',
                  }}
                  aria-live="polite"
                  aria-label={`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
                >
                  Q{currentQuestionIndex + 1} / {totalQuestions}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress bar — full-width beneath header */}
        {studentInfo && !isQuizComplete && (
          <div style={{ padding: '0 0 0.1rem' }}>
            <div className="progress-track" style={{ borderRadius: 0, border: 'none', height: '4px' }}>
              <motion.div
                className="progress-fill"
                style={{ borderRadius: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Exam progress"
              />
            </div>
          </div>
        )}
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div className="quiz-wrapper">

          <AnimatePresence mode="wait">
            {!studentInfo ? (
              <motion.div key="welcome">
                <WelcomeScreen onStartExam={handleStartExam} />
              </motion.div>
            ) : isQuizComplete ? (
              <motion.div key="results">
                <ResultsScreen
                  score={score}
                  totalQuestions={totalQuestions}
                  userAnswers={userAnswers}
                  onRestart={handleRestart}
                />
              </motion.div>

            ) : (
              <motion.div key={currentQuestionIndex}>
                {/* ── Question card ── */}
                <QuizCard
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={totalQuestions}
                  selectedAnswer={selectedAnswer}
                  onSelectAnswer={handleSelectAnswer}
                />

                {/* ── Next / Submit button ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0   }}
                  transition={{ delay: 0.1 }}
                  style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}
                >
                  <button
                    id="next-question-btn"
                    className="btn-primary"
                    onClick={handleNext}
                    disabled={selectedAnswer === null}
                    aria-label={
                      currentQuestionIndex + 1 === totalQuestions
                        ? 'See your results'
                        : 'Next question'
                    }
                  >
                    {currentQuestionIndex + 1 === totalQuestions
                      ? '🏁 See Results'
                      : 'Next Question →'}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>
          SummerLMS • Bakersfield Grade 3 & 5 Assessment System • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
