/**
 * questionGenerator.js — Dynamic Question & Variation Engine
 * Generates fresh, topic-aligned, procedurally randomized questions
 * every single time a student starts an exam attempt.
 */

import { questions as baseQuestionBank } from './questions'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Creates a question object with dynamically shuffled option positions */
function createQuestion(id, grade, subject, questionText, correctText, distractors) {
  // Ensure unique distractors that don't match the correct text
  const uniqueDistractors = Array.from(new Set(distractors.filter(d => d !== correctText)))
  
  // Fill up if needed
  while (uniqueDistractors.length < 3) {
    uniqueDistractors.push(`Option ${uniqueDistractors.length + 1}`)
  }

  const selectedDistractors = shuffle(uniqueDistractors).slice(0, 3)
  const allOptions = shuffle([correctText, ...selectedDistractors])
  const correctAnswerIndex = allOptions.indexOf(correctText)

  return {
    id,
    grade,
    subject,
    questionText,
    options: allOptions,
    correctAnswer: correctAnswerIndex,
  }
}

const NAMES = ['Maya', 'Leo', 'Sophia', 'Ethan', 'Chloe', 'Jacob', 'Hannah', 'Liam', 'Noah', 'Ava', 'Lucas', 'Emma', 'Oliver', 'Isabella', 'Mason', 'Mia', 'Benjamin', 'Charlotte', 'Amelia', 'James']
const ITEMS = ['cupcakes', 'cookies', 'apples', 'oranges', 'pencils', 'stickers', 'marbles', 'booklets', 'crayons', 'stamps']
const BACKDROPS = ['bakery', 'school fair', 'community center', 'youth club', 'classroom garden', 'science fair', 'library workshop']

// ─── 3RD GRADE DYNAMIC GENERATORS ─────────────────────────────────────────────

function gen3rdMath(idOffset = 1000) {
  const qList = []
  let id = idOffset

  // 1. Fraction word problem
  const totalItems = randomChoice([12, 16, 20, 24, 28, 32, 36])
  const name1 = randomChoice(NAMES)
  const item1 = randomChoice(ITEMS)
  const fracNum = randomChoice([1, 3])
  const fracDen = 4
  const soldCount = (totalItems * fracNum) / fracDen
  qList.push(createQuestion(
    id++, '3rd', 'Math',
    `${name1} baked ${totalItems} ${item1}. ${name1} gave away ${fracNum}/${fracDen} of them. How many ${item1} did ${name1} give away?`,
    `${soldCount} ${item1}`,
    [`${totalItems - soldCount} ${item1}`, `${soldCount + 2} ${item1}`, `${Math.max(1, soldCount - 4)} ${item1}`, `${soldCount + 4} ${item1}`]
  ))

  // 2. Perimeter calculation
  const length = randomInt(4, 12)
  const width = randomInt(3, 9)
  const perimeter = 2 * (length + width)
  const name2 = randomChoice(NAMES)
  qList.push(createQuestion(
    id++, '3rd', 'Math',
    `${name2} is putting a border around a rectangular flower bed that is ${length} meters long and ${width} meters wide. What is the total perimeter?`,
    `${perimeter} meters`,
    [`${length + width} meters`, `${length * width} meters`, `${perimeter + 4} meters`, `${Math.max(2, perimeter - 6)} meters`]
  ))

  // 3. Fraction addition (like denominators)
  const den = randomChoice([4, 6, 8])
  const num1 = randomInt(1, 2)
  const num2 = randomInt(1, 3)
  const sumNum = num1 + num2
  qList.push(createQuestion(
    id++, '3rd', 'Math',
    `What is ${num1}/${den} + ${num2}/${den}?`,
    `${sumNum}/${den}`,
    [`${num1 + num2}/${den * 2}`, `${Math.max(1, sumNum - 1)}/${den}`, `${sumNum + 1}/${den}`, `1/${den}`]
  ))

  // 4. Area calculation
  const rLen = randomInt(3, 8)
  const rWid = randomInt(4, 9)
  const area = rLen * rWid
  qList.push(createQuestion(
    id++, '3rd', 'Math',
    `A classroom rug measures ${rLen} feet wide by ${rWid} feet long. What is the area of the rug?`,
    `${area} sq ft`,
    [`${2 * (rLen + rWid)} sq ft`, `${area + 5} sq ft`, `${area - 4} sq ft`, `${rLen + rWid} sq ft`]
  ))

  // 5. Algebraic equation x + A = B
  const addend = randomInt(4, 12)
  const target = addend + randomInt(5, 15)
  const xVal = target - addend
  const name3 = randomChoice(NAMES)
  qList.push(createQuestion(
    id++, '3rd', 'Math',
    `In the equation x + ${addend} = ${target}, x represents the number of points ${name3} scored in the game. What is the value of x?`,
    `${xVal}`,
    [`${xVal + 2}`, `${target + addend}`, `${Math.max(1, xVal - 3)}`, `${xVal + 5}`]
  ))

  // 6. Money change word problem
  const cost1 = randomInt(3, 8)
  const cost2 = randomInt(4, 9)
  const totalCost = cost1 + cost2
  const bill = 20
  const change = bill - totalCost
  const name4 = randomChoice(NAMES)
  qList.push(createQuestion(
    id++, '3rd', 'Math',
    `${name4} buys a notebook for $${cost1} and a pack of markers for $${cost2}. ${name4} pays with a $20 bill. How much change will ${name4} receive?`,
    `$${change}`,
    [`$${totalCost}`, `$${change + 3}`, `$${Math.max(1, change - 2)}`, `$${change + 5}`]
  ))

  // 7. Equal division / sharing
  const totalApples = randomChoice([16, 20, 24, 28, 30, 36])
  const groups = randomChoice([4, 5, 6])
  const perGroup = Math.floor(totalApples / groups)
  const rem = totalApples % groups
  if (rem === 0) {
    qList.push(createQuestion(
      id++, '3rd', 'Math',
      `A teacher divides ${totalApples} pencils equally into ${groups} pencil holders. How many pencils are in each holder?`,
      `${perGroup} pencils`,
      [`${perGroup + 2} pencils`, `${perGroup - 1} pencils`, `${groups} pencils`, `${perGroup + 4} pencils`]
    ))
  }

  // 8. Time calculation
  const hour = randomInt(2, 5)
  qList.push(createQuestion(
    id++, '3rd', 'Math',
    `An analog clock has its minute hand pointing directly at 6 and its hour hand between ${hour} and ${hour + 1}. What time is shown?`,
    `${hour}:30`,
    [`${hour}:15`, `${hour}:45`, `${hour + 1}:30`, `${hour}:00`]
  ))

  return qList
}

function gen3rdScience(idOffset = 2000) {
  const qList = []
  let id = idOffset

  // 1. Water phase changes
  const phaseScenarios = [
    { text: "A puddle of rainwater disappears after a sunny day.", ans: "Evaporation", dist: ["Freezing", "Condensation", "Melting"] },
    { text: "Water droplets form on the outside of a cold soda can.", ans: "Condensation", dist: ["Evaporation", "Freezing", "Melting"] },
    { text: "Water left in a freezer turns into hard ice cubes.", ans: "Freezing", dist: ["Condensation", "Evaporation", "Melting"] },
    { text: "Snowflakes turn into liquid water on a warm afternoon.", ans: "Melting", dist: ["Freezing", "Evaporation", "Condensation"] }
  ]
  const pScen = randomChoice(phaseScenarios)
  qList.push(createQuestion(
    id++, '3rd', 'Science',
    `Observe this everyday event: "${pScen.text}" Which phase change is taking place?`,
    pScen.ans,
    pScen.dist
  ))

  // 2. Biome & Ecosystems
  const ecosystems = [
    { biome: "freshwater pond", organisms: "frogs, pond lilies, and dragonflies", producer: "pond lilies" },
    { biome: "oak forest", organisms: "squirrels, oak trees, and wild mushrooms", producer: "oak trees" },
    { biome: "desert meadow", organisms: "cacti, lizards, and hawks", producer: "cacti" }
  ]
  const eco = randomChoice(ecosystems)
  qList.push(createQuestion(
    id++, '3rd', 'Science',
    `In a ${eco.biome} ecosystem featuring ${eco.organisms}, which organism acts as a producer by capturing sunlight to make food?`,
    eco.producer,
    ["Hawk", "Wild mushroom", "Decomposer", "Herbivore"]
  ))

  // 3. States of Matter selection
  const matterItems = [
    { desc: "keeps its shape and volume constant", state: "Solid", dist: ["Liquid", "Gas", "Plasma"] },
    { desc: "takes the shape of its container but has a fixed volume", state: "Liquid", dist: ["Solid", "Gas", "Plasma"] },
    { desc: "expands to fill any container and has no fixed shape", state: "Gas", dist: ["Solid", "Liquid", "Plasma"] }
  ]
  const mItem = randomChoice(matterItems)
  qList.push(createQuestion(
    id++, '3rd', 'Science',
    `A substance that ${mItem.desc} is classified as which state of matter?`,
    mItem.state,
    mItem.dist
  ))

  // 4. Phototropism plant adaptation
  qList.push(createQuestion(
    id++, '3rd', 'Science',
    `A potted plant sitting near a sunny window slowly bends its stem toward the glass over two weeks. What is the plant seeking?`,
    `Sunlight needed for making food through photosynthesis`,
    [`Fresh outdoor air`, `Heat to stay warm`, `Rainwater from outside`, `Shade from insects`]
  ))

  return qList
}

function gen3rdHistory(idOffset = 3000) {
  const qList = []
  let id = idOffset

  // 1. National Symbols
  const symbols = [
    { item: "50 white stars on the American flag", mean: "The 50 current states of the USA" },
    { item: "13 red and white stripes on the U.S. flag", mean: "The 13 original American colonies" },
    { item: "The Bald Eagle as a U.S. national symbol", mean: "Freedom, strength, and national independence" },
    { item: "The Statue of Liberty", mean: "Freedom and welcome to democracy" }
  ]
  const sym = randomChoice(symbols)
  qList.push(createQuestion(
    id++, '3rd', 'History',
    `What does ${sym.item} represent in United States history?`,
    sym.mean,
    ["The 50 U.S. Presidents", "The signers of the Constitution", "The 50 state governors", "The British royal navy"]
  ))

  // 2. Government roles
  qList.push(createQuestion(
    id++, '3rd', 'History',
    `When a local community needs a new public park or safer street traffic light, which government body has primary responsibility?`,
    `Local City Council & Mayor`,
    [`U.S. Supreme Court`, `President of the United States`, `State Governor of another state`, `Military Command`]
  ))

  // 3. Primary vs Secondary source
  const sourceTypes = [
    { text: "A handwritten diary kept by a 3rd grader in 1850", type: "Primary source" },
    { text: "A modern social studies textbook written in 2024", type: "Secondary source" },
    { text: "An original photograph taken during a historical speech", type: "Primary source" },
    { text: "An encyclopedia entry summarizing a historic war", type: "Secondary source" }
  ]
  const src = randomChoice(sourceTypes)
  qList.push(createQuestion(
    id++, '3rd', 'History',
    `Historical artifact evaluation: "${src.text}" How is this source classified by historians?`,
    src.type,
    [src.type === "Primary source" ? "Secondary source" : "Primary source", "Fictional novel", "Mythological legend"]
  ))

  return qList
}

// ─── 5TH GRADE DYNAMIC GENERATORS ─────────────────────────────────────────────

function gen5thMath(idOffset = 4000) {
  const qList = []
  let id = idOffset

  // 1. Exponent calculation
  const power = randomChoice([3, 4, 5])
  const base10Val = Math.pow(10, power)
  qList.push(createQuestion(
    id++, '5th', 'Math',
    `A clean energy solar plant outputs 10^${power} kilowatt-hours of power per day. What is this value in standard numerical form?`,
    `${base10Val.toLocaleString()} kWh`,
    [`${(power * 10).toLocaleString()} kWh`, `${(base10Val / 10).toLocaleString()} kWh`, `${(base10Val * 10).toLocaleString()} kWh`, `${(power * 100).toLocaleString()} kWh`]
  ))

  // 2. Negative exponent decimal notation
  const negPow = randomChoice([2, 3, 4])
  const coefficient = randomInt(2, 8)
  const decVal = (coefficient * Math.pow(10, -negPow)).toFixed(negPow + 1).replace(/0+$/, '')
  qList.push(createQuestion(
    id++, '5th', 'Math',
    `In a microbiology lab, a cell nucleus measurement is recorded as ${coefficient} × 10^-${negPow} meters. Express this value in standard decimal notation.`,
    `${(coefficient / Math.pow(10, negPow)).toString()} meters`,
    [`${(coefficient / Math.pow(10, negPow - 1)).toString()} meters`, `${(coefficient / Math.pow(10, negPow + 1)).toString()} meters`, `${(coefficient * 10).toString()} meters`, `0.${coefficient} meters`]
  ))

  // 3. Multi-step algebra 4x - A = B
  const xSol = randomInt(5, 15)
  const mult = randomChoice([3, 4, 5])
  const sub = randomInt(6, 18)
  const targetVal = mult * xSol - sub
  qList.push(createQuestion(
    id++, '5th', 'Math',
    `Solve the multi-step algebraic equation for x: ${mult}x − ${sub} = ${targetVal}`,
    `x = ${xSol}`,
    [`x = ${xSol + 2}`, `x = ${xSol - 1}`, `x = ${xSol + 4}`, `x = ${xSol * 2}`]
  ))

  // 4. Volume of rectangular prism
  const vL = randomInt(5, 12)
  const vW = randomInt(4, 9)
  const vH = randomInt(3, 7)
  const volume = vL * vW * vH
  qList.push(createQuestion(
    id++, '5th', 'Math',
    `A rectangular shipping container has a length of ${vL} meters, width of ${vW} meters, and height of ${vH} meters. What is its volume?`,
    `${volume} cubic meters`,
    [`${vL + vW + vH} cubic meters`, `${2 * (vL + vW + vH)} cubic meters`, `${volume + 20} cubic meters`, `${volume - 15} cubic meters`]
  ))

  // 5. Decimal multiplication / electric rate
  const rate = (randomInt(10, 20) / 2).toFixed(1)
  const hours = (randomInt(3, 8) / 2).toFixed(1)
  const totalKwh = (parseFloat(rate) * parseFloat(hours)).toFixed(2).replace(/\.00$/, '')
  qList.push(createQuestion(
    id++, '5th', 'Math',
    `An EV charging station delivers energy at a rate of ${rate} kWh per hour. How many total kWh are delivered in ${hours} hours?`,
    `${totalKwh} kWh`,
    [`${(parseFloat(rate) + parseFloat(hours)).toFixed(1)} kWh`, `${(parseFloat(totalKwh) + 5).toFixed(2)} kWh`, `${(parseFloat(totalKwh) - 3.5).toFixed(2)} kWh`, `${(parseFloat(rate) * 2).toFixed(1)} kWh`]
  ))

  return qList
}

function gen5thScience(idOffset = 5000) {
  const qList = []
  let id = idOffset

  // 1. Organelle functions
  const organelles = [
    { name: "Mitochondria", role: "Generate cellular ATP energy during respiration", nickname: "powerhouse of the cell" },
    { name: "Nucleus", role: "Store DNA chromosomes and direct cell operations", nickname: "control center of the cell" },
    { name: "Chloroplast", role: "Perform photosynthesis to convert sunlight into glucose", nickname: "solar energy converter" },
    { name: "Cell wall", role: "Provide rigid structural support and shape around plant cells", nickname: "outer protective boundary" }
  ]
  const org = randomChoice(organelles)
  qList.push(createQuestion(
    id++, '5th', 'Science',
    `Under an electron microscope, an organelle is observed actively working to ${org.role}. Which organelle is this?`,
    org.name,
    organelles.filter(o => o.name !== org.name).map(o => o.name)
  ))

  // 2. Osmosis scenario
  qList.push(createQuestion(
    id++, '5th', 'Science',
    `A biology student places a fresh potato slice into a beaker of concentrated salt water. After an hour, water leaves the potato cells and the slice turns soft. What process occurred?`,
    `Osmosis (water movement across a membrane)`,
    [`Active transport`, `Photosynthesis`, `Cellular division`, `Transpiration`]
  ))

  // 3. Biological organization hierarchy
  qList.push(createQuestion(
    id++, '5th', 'Science',
    `Which sequence correctly orders biological organization from simplest structure to most complex?`,
    `Cell → Tissue → Organ → Organ System → Organism`,
    [`Organism → Organ System → Organ → Tissue → Cell`, `Tissue → Cell → Organ → Organism`, `Organ → Cell → Organ System → Tissue`, `Cell → Organ → Tissue → Organism`]
  ))

  return qList
}

function gen5thHistory(idOffset = 6000) {
  const qList = []
  let id = idOffset

  // 1. Constitutional Checks & Balances
  qList.push(createQuestion(
    id++, '5th', 'History',
    `If Congress passes a federal law and the President vetoes it, Congress can override the veto with a 2/3 majority vote in both houses. This constitutional mechanism is called:`,
    `Checks and Balances`,
    [`Judicial Review`, `Executive Order`, `Direct Democracy`, `Articles of Confederation`]
  ))

  // 2. Civil War & Reconstruction
  qList.push(createQuestion(
    id++, '5th', 'History',
    `What was the main purpose of the Emancipation Proclamation issued by President Lincoln in 1863?`,
    `To declare enslaved people in Confederate states in rebellion to be forever free`,
    [`To immediately end the Civil War`, `To grant voting rights to women`, `To write the U.S. Constitution`, `To establish the federal Supreme Court`]
  ))

  // 3. Bill of Rights
  const amendments = [
    { num: "1st Amendment", right: "Freedom of speech, press, religion, and peaceful assembly" },
    { num: "13th Amendment", right: "Abolishing slavery throughout the entire United States" },
    { num: "19th Amendment", right: "Guaranteeing women the right to vote" }
  ]
  const amd = randomChoice(amendments)
  qList.push(createQuestion(
    id++, '5th', 'History',
    `Which constitutional amendment is celebrated for ${amd.right}?`,
    amd.num,
    amendments.filter(a => a.num !== amd.num).map(a => a.num).concat(["5th Amendment"])
  ))

  return qList
}

// ─── MAIN EXPORTED GENERATOR FUNCTION ────────────────────────────────────────

/**
 * Generates dynamic questions for an exam session.
 * Merges static curriculum base bank with fresh procedurally generated questions
 * and shuffles all answer choices so every attempt is unique.
 *
 * @param {"3rd"|"5th"} grade
 * @param {"Math"|"Science"|"History"|"Scenario-Based"|"All"} subject
 * @returns {Array} List of dynamically prepared question objects
 */
export function generateSessionQuestions(grade, subject) {
  // 1. Fetch base static questions for this grade/subject
  let baseList = baseQuestionBank.filter(q => q.grade === grade)
  if (subject !== 'All') {
    baseList = baseList.filter(q => q.subject === subject)
  }

  // 2. Generate procedural dynamic questions
  const dynamicGenerated = []
  if (grade === '3rd') {
    if (subject === 'Math' || subject === 'All' || subject === 'Scenario-Based') {
      dynamicGenerated.push(...gen3rdMath(1000 + Math.random() * 100))
    }
    if (subject === 'Science' || subject === 'All' || subject === 'Scenario-Based') {
      dynamicGenerated.push(...gen3rdScience(2000 + Math.random() * 100))
    }
    if (subject === 'History' || subject === 'All' || subject === 'Scenario-Based') {
      dynamicGenerated.push(...gen3rdHistory(3000 + Math.random() * 100))
    }
  } else {
    if (subject === 'Math' || subject === 'All' || subject === 'Scenario-Based') {
      dynamicGenerated.push(...gen5thMath(4000 + Math.random() * 100))
    }
    if (subject === 'Science' || subject === 'All' || subject === 'Scenario-Based') {
      dynamicGenerated.push(...gen5thScience(5000 + Math.random() * 100))
    }
    if (subject === 'History' || subject === 'All' || subject === 'Scenario-Based') {
      dynamicGenerated.push(...gen5thHistory(6000 + Math.random() * 100))
    }
  }

  // 3. Shuffle options for base questions so choice locations (A/B/C/D) are randomized every time
  const randomizedBase = baseList.map(q => {
    const correctText = q.options[q.correctAnswer]
    const shuffledOptions = shuffle(q.options)
    const newCorrectIndex = shuffledOptions.indexOf(correctText)
    return {
      ...q,
      options: shuffledOptions,
      correctAnswer: newCorrectIndex,
    }
  })

  // 4. Combine randomized base + procedural dynamic questions
  const pool = shuffle([...dynamicGenerated, ...randomizedBase])

  // 5. Slice to target session count
  let targetCount = 40
  if (subject === 'All') targetCount = 70
  if (subject === 'Scenario-Based') targetCount = 40

  return pool.slice(0, targetCount)
}
