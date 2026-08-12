import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore'

// Environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Check if all essential keys are provided
const isFirebaseConfigured = 
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId

let db = null

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    console.log('Firebase initialized successfully.')
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
  }
} else {
  console.warn('Firebase credentials missing. Falling back to local storage.')
}

const LOCAL_STORAGE_KEY = 'summerlms_history'

/**
 * Saves the student's exam result to Firestore or LocalStorage.
 * @param {Object} studentInfo
 * @param {number} score
 * @param {number} totalQuestions
 * @param {Array} userAnswers
 */
export async function saveExamResult(studentInfo, score, totalQuestions, userAnswers) {
  const result = {
    name: studentInfo.name,
    studentNameNormalized: studentInfo.name.trim().toLowerCase(),
    grade: studentInfo.grade,
    subject: studentInfo.subject,
    timerMinutes: studentInfo.timerMinutes,
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    completedAt: new Date().toISOString(),
    userAnswers: userAnswers.map(ans => ({
      questionId: ans.question.id,
      questionText: ans.question.questionText,
      selectedAnswer: ans.selectedAnswer,
      correctAnswer: ans.question.correctAnswer,
      isCorrect: ans.isCorrect
    }))
  }

  if (db) {
    try {
      const resultsRef = collection(db, 'exam_results')
      const docRef = await addDoc(resultsRef, result)
      return { success: true, mode: 'cloud', id: docRef.id }
    } catch (error) {
      console.error('Firestore save failed, falling back to local storage:', error)
      saveToLocalStorage(result)
      return { success: true, mode: 'local', error: error.message }
    }
  } else {
    saveToLocalStorage(result)
    return { success: true, mode: 'local' }
  }
}

/**
 * Fetches all past exam results for a specific student name.
 * @param {string} studentName
 */
export async function getStudentHistory(studentName) {
  if (!studentName || !studentName.trim()) return []
  const normalizedName = studentName.trim().toLowerCase()

  if (db) {
    try {
      const resultsRef = collection(db, 'exam_results')
      const q = query(
        resultsRef,
        where('studentNameNormalized', '==', normalizedName),
        orderBy('completedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const history = []
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() })
      })
      return history;
    } catch (error) {
      console.error('Firestore query failed, falling back to local storage:', error)
      return getFromLocalStorage(normalizedName)
    }
  } else {
    return getFromLocalStorage(normalizedName)
  }
}

function saveToLocalStorage(result) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    list.push(result)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

function getFromLocalStorage(normalizedName) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    const filtered = list.filter(item => 
      item.name && item.name.trim().toLowerCase() === normalizedName
    )
    filtered.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    return filtered
  } catch (e) {
    console.error('Failed to read from localStorage:', e)
    return []
  }
}
