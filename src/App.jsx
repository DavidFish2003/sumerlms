import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getQuestions } from './data/questions'
import QuizCard from './components/QuizCard'
import ResultsScreen from './components/ResultsScreen'
import WelcomeScreen from './components/WelcomeScreen'

/** Shuffles an array in-place using Fisher-Yates — returns new array */
function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Builds the question list for a session.
 *   - Single subject  → shuffle all 40, take up to 40
 *   - 'All' subjects  → 30 Math + 30 Science + 10 History = 70, interleaved
 */
function buildSession(grade, subject) {
  if (subject !== 'All') {
    return shuffleArray(getQuestions(grade, subject)).slice(0, 40)
  }

  // Weighted mix for 'All': 30 Math + 30 Science + 10 History
  const math    = shuffleArray(getQuestions(grade, 'Math')).slice(0, 30)
  const science = shuffleArray(getQuestions(grade, 'Science')).slice(0, 30)
  const history = shuffleArray(getQuestions(grade, 'History')).slice(0, 10)

  // Interleave so questions feel varied (not all Math at the start)
  const combined = []
  const maxLen = Math.max(math.length, science.length, history.length)
  for (let i = 0; i < maxLen; i++) {
    if (math[i])    combined.push(math[i])
    if (science[i]) combined.push(science[i])
    if (history[i]) combined.push(history[i])
  }
  return combined
}

/** Formats seconds as MM:SS */
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function App() {
  const [studentInfo,          setStudentInfo]          = useState(null)
  const [quizQuestions,        setQuizQuestions]        = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score,                setScore]                = useState(0)
  const [selectedAnswer,       setSelectedAnswer]       = useState(null)
  const [isQuizComplete,       setIsQuizComplete]       = useState(false)
  const [userAnswers,          setUserAnswers]          = useState([])
  const [timeLeft,             setTimeLeft]             = useState(0)  // seconds

  // Use a ref to hold the finishQuiz handler so the interval can call it
  // without stale closure issues
  const finishQuizRef = useRef(null)

  /** Complete the exam — called both by "See Results" button and timer expiry */
  const finishQuiz = useCallback((answersSnapshot, scoreSnapshot) => {
    setUserAnswers(answersSnapshot)
    setScore(scoreSnapshot)
    setIsQuizComplete(true)
    setTimeLeft(0)
  }, [])

  // Keep the ref fresh on every render
  useEffect(() => {
    finishQuizRef.current = finishQuiz
  })

  /** Starts the countdown when a quiz session begins */
  useEffect(() => {
    if (!studentInfo || isQuizComplete || timeLeft <= 0) return

    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id)
          // Auto-submit: use the latest answers/score captured in state via ref
          // We call finish with whatever has been saved so far
          finishQuizRef.current?.(
            // We can't easily read latest state here without extra refs,
            // so we trigger via a special flag instead (see below)
          )
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentInfo, isQuizComplete])

  // When timeLeft hits 0 naturally (from the interval), auto-complete
  useEffect(() => {
    if (studentInfo && !isQuizComplete && timeLeft === 0 && quizQuestions.length > 0) {
      setIsQuizComplete(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  /** Handles the setup from the Welcome screen */
  const handleStartExam = useCallback(({ name, grade, subject, timerMinutes }) => {
    const sessionList = buildSession(grade, subject)
    setStudentInfo({ name, grade, subject, timerMinutes })
    setQuizQuestions(sessionList)
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setIsQuizComplete(false)
    setUserAnswers([])
    setTimeLeft(timerMinutes * 60)
  }, [])

  const totalQuestions  = quizQuestions.length
  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progressPercent = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0

  // Timer danger thresholds
  const timerDanger  = timeLeft > 0 && timeLeft <= 60   // < 1 min  → red pulse
  const timerWarning = timeLeft > 60 && timeLeft <= 300  // < 5 min  → amber

  /** Called when the student taps an answer option */
  const handleSelectAnswer = useCallback((optionIndex) => {
    setSelectedAnswer(optionIndex)
  }, [])

  /** Move to next question or finalise exam */
  const handleNext = useCallback(() => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    const newAnswer = {
      question:       currentQuestion,
      selectedAnswer: selectedAnswer,
      isCorrect:      isCorrect,
    }

    const nextAnswers = [...userAnswers, newAnswer]
    const nextScore   = score + (isCorrect ? 1 : 0)

    const next = currentQuestionIndex + 1
    if (next >= totalQuestions) {
      setUserAnswers(nextAnswers)
      setScore(nextScore)
      setIsQuizComplete(true)
      setTimeLeft(0)
    } else {
      setUserAnswers(nextAnswers)
      setScore(nextScore)
      setCurrentQuestionIndex(next)
      setSelectedAnswer(null)
    }
  }, [currentQuestionIndex, totalQuestions, selectedAnswer, currentQuestion, userAnswers, score])

  /** Reset to welcome screen */
  const handleRestart = useCallback(() => {
    setStudentInfo(null)
    setQuizQuestions([])
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setIsQuizComplete(false)
    setUserAnswers([])
    setTimeLeft(0)
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
          background: 'rgba(13,17,23,0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            maxWidth: '780px', margin: '0 auto',
            padding: '0.8rem 1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
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

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.2 }}>
              SummerLMS Portal
            </p>
            <h1 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-1)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {studentInfo ? `${studentInfo.name}'s Exam` : 'Interactive K-12 Examination'}
            </h1>
          </div>

          {/* Right side chips */}
          {studentInfo && (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
              {/* Grade chip */}
              <span style={{
                padding: '0.3rem 0.55rem', borderRadius: '6px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--color-border)',
                fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-2)',
              }}>
                G{studentInfo.grade}
              </span>

              {/* Question counter */}
              {!isQuizComplete && (
                <div style={{
                  padding: '0.3rem 0.55rem', borderRadius: '6px',
                  background: 'rgba(110,142,251,0.12)',
                  border: '1px solid rgba(110,142,251,0.25)',
                  fontSize: '0.72rem', fontWeight: 700,
                  color: 'var(--color-primary)',
                }}
                  aria-live="polite"
                >
                  Q{currentQuestionIndex + 1}/{totalQuestions}
                </div>
              )}

              {/* ── Countdown Timer chip ── */}
              {!isQuizComplete && timeLeft > 0 && (
                <motion.div
                  animate={timerDanger ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    minWidth: '4.5rem',
                    textAlign: 'center',
                    background: timerDanger
                      ? 'rgba(248,81,73,0.18)'
                      : timerWarning
                        ? 'rgba(240,136,62,0.15)'
                        : 'rgba(46,160,67,0.12)',
                    border: `1.5px solid ${timerDanger ? 'rgba(248,81,73,0.5)' : timerWarning ? 'rgba(240,136,62,0.4)' : 'rgba(46,160,67,0.3)'}`,
                    color: timerDanger
                      ? 'var(--color-wrong)'
                      : timerWarning
                        ? '#f0883e'
                        : 'var(--color-correct)',
                    boxShadow: timerDanger ? '0 0 12px rgba(248,81,73,0.3)' : 'none',
                    transition: 'background 0.4s, border-color 0.4s, color 0.4s',
                  }}
                  aria-live="off"
                  aria-label={`Time remaining: ${formatTime(timeLeft)}`}
                >
                  ⏱ {formatTime(timeLeft)}
                </motion.div>
              )}

              {/* Time's up chip */}
              {isQuizComplete && studentInfo && (
                <span style={{
                  padding: '0.3rem 0.6rem', borderRadius: '6px',
                  background: 'rgba(46,160,67,0.12)',
                  border: '1px solid rgba(46,160,67,0.3)',
                  fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-correct)',
                }}>
                  ✓ Complete
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress bar */}
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

      {/* ── Main content ────────────────────────────────────────────────────── */}
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
                <QuizCard
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={totalQuestions}
                  selectedAnswer={selectedAnswer}
                  onSelectAnswer={handleSelectAnswer}
                />

                {/* Next / Submit button */}
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

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>
          SummerLMS • Bakersfield Grade 3 &amp; 5 Assessment System • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
