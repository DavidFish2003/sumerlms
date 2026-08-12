/**
 * achievements.js — OmisoreTestLab Gamification & Badge Engine
 * Evaluates student performance metrics and past history to award unlockable badges.
 */

export const BADGES = [
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    icon: '🌟',
    description: 'Scored 100% on any assessment.',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    check: (current, history) => current.percentage === 100,
  },
  {
    id: 'math_wizard',
    title: 'Math Wizard',
    icon: '🧙‍♂️',
    description: 'Scored 90%+ on a Math assessment.',
    gradient: 'linear-gradient(135deg, #6e8efb 0%, #a777e3 100%)',
    check: (current) => current.subject === 'Math' && current.percentage >= 90,
  },
  {
    id: 'science_explorer',
    title: 'Science Explorer',
    icon: '🔬',
    description: 'Scored 90%+ on a Science assessment.',
    gradient: 'linear-gradient(135deg, #42e695 0%, #3bb2b8 100%)',
    check: (current) => current.subject === 'Science' && current.percentage >= 90,
  },
  {
    id: 'civics_scholar',
    title: 'Civics Scholar',
    icon: '🏛️',
    description: 'Scored 90%+ on a History assessment.',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    check: (current) => current.subject === 'History' && current.percentage >= 90,
  },
  {
    id: 'scenario_master',
    title: 'Scenario Master',
    icon: '💡',
    description: 'Scored 85%+ on a Scenario-Based assessment.',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    check: (current) => current.subject === 'Scenario-Based' && current.percentage >= 85,
  },
  {
    id: 'dedicated_learner',
    title: 'Dedicated Learner',
    icon: '📚',
    description: 'Completed 3 or more assessments.',
    gradient: 'linear-gradient(135deg, #5efce8 0%, #736efe 100%)',
    check: (current, history) => history.length >= 3,
  },
  {
    id: 'on_fire',
    title: 'On Fire',
    icon: '🔥',
    description: 'Scored 80%+ on 2 consecutive exams.',
    gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
    check: (current, history) => {
      if (current.percentage < 80) return false
      const last = history[0]
      return last && last.percentage >= 80
    },
  },
  {
    id: 'honor_roll',
    title: 'Honor Roll',
    icon: '🎓',
    description: 'Achieved an average score of 85%+ across all tests.',
    gradient: 'linear-gradient(135deg, #ab86e3 0%, #6e8efb 100%)',
    check: (current, history) => {
      const all = [current, ...history]
      if (all.length < 2) return false
      const avg = all.reduce((sum, item) => sum + item.percentage, 0) / all.length
      return avg >= 85
    },
  },
]

/**
 * Evaluates current exam result and student history to return unlocked badges.
 * @param {Object} currentResult
 * @param {Array} history
 * @returns {{ unlockedBadges: Array, newBadges: Array }}
 */
export function evaluateBadges(currentResult, history = []) {
  const allAttempts = currentResult ? [currentResult, ...history] : history

  const unlockedBadges = []
  const newBadges = []

  BADGES.forEach((badge) => {
    const isUnlockedNow = currentResult ? badge.check(currentResult, history) : false
    const wasAlreadyUnlocked = history.some((prev) => badge.check(prev, history.filter((h) => h !== prev)))

    if (isUnlockedNow || wasAlreadyUnlocked) {
      unlockedBadges.push(badge)
    }

    if (isUnlockedNow && !wasAlreadyUnlocked) {
      newBadges.push(badge)
    }
  })

  return { unlockedBadges, newBadges }
}
