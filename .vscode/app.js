// state
let state = {
  level:         1,
  xp:            0,
  streak:        0,
  lastDate:      null,
  tokens:        0,
  quests:        [],
  activeQuestId: null
}

let secondsLeft = 1500
let isRunning = false
let mode = "focus"
let timerInterval = null

// on page load
loadState()
renderHeader()
updateDisplay()
highlightNav()

//Timer functions
function startTimer() {
  if (isRunning) return
isRunning = true
document.getElementById("timer-ring").classList.add("pulsing")
timerInterval = setInterval(tick,1000)
}

function pauseTimer() {
  clearInterval(timerInterval)
  isRunning = false
  document.getElementById("timer-ring").classList.remove("pulsing")
}

function resetTimer() {
  clearInterval(timerInterval)
  isRunning = false
  secondsLeft = 1500
  mode = "focus"
  document.getElementById("timer-ring").classList.remove("pulsing")
  document.getElementById("timer-mode").textContent = "Focus"
  updateDisplay()
}

function tick() {
  secondsLeft = secondsLeft -1
  updateDisplay()

  if(secondsLeft <= 0) {
    clearInterval(timerInterval)
    isRunning = false
    document.getElementById("timer-ring").classList.remove("pulsing")
    onTimerComplete()
  }
}

function onTimerComplete(){
  if(mode == "focus") {
    mode = "rest"
    secondsLeft = 300
    document.getElementById("timer_mode").textContent = "REST"
    showMessage("Rest time! You need a break!")
  } else {
    mode = "focus"
    secondsLeft = 1500
    document.getElementById("timer-mode").textContent = "FOCUS"
    showMessage("Battle Ready! Start when you are ready!")
  }
  updateDisplay()
}

//display 
function updateDisplay() {
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeString = minutes + ":" + (seconds < 10 ? "0" + seconds :seconds)

  document.getElementById("timer-display").textContent = timeString

  const total = mode == "focus" ? 1500:300
  const elasped = total - secondsLeft
  const pct = (elasped /total) *100
  document.getElementById("timer-ring").style.setProperty("--progress",pct + "%")
}

function showMessage(text) {
  document.getElementById("message").textContent = text
  setTimeout(() => {
    document.getElementById("message").textContent = ""
  }, 3000)
}

//NAV highlights
function highlightNav() {
  const current = window.location.pathname
  document.querySelectorAll("nav a").forEach(link => {
    if(link.getAttribute("href") === "index.html" &&
 ( current.endsWith("index.html") || current.endsWith("/"))) {
      link.classList.add("active")
    }
  })
}

function loadState(){
  const saved = localStorage.getItem("focusForge_v1")
  if(saved) {
    state = JSON.parse(saved)
  }
}

function saveState() {
  localStorage.setItem("focusForge_v1",JSON.stringify(state))
}

function renderHeader(){
  document.getElementById("level-display").textContent = "LVL" + state.level
  document.getElementById("xp-display").textContent = "Streak:" + state.streak
  document.getElementById("tokens-display").textContent = "Tokens:" + state.tokens
  const pct = (state.xp/xpNeeded())*100
  document.getElementById("xp-bar").style.width = pct +"%"
}

function xpNeeded() {
  return 500 + (state.level -1) * 250
}

function awardXP(amount) {
checkStreak()
const multiplier = 1 + Math.min(state.streak,30) * 0.05
const gained = Math.round(amount * multiplier)
state.xp += gained
state.tokens += Math.round(gained/100)
while(state.xp>= xpNeeded()) {
  state.xp -= xpNeeded()
  state.level += 1
  showMessage("Level Up! You are now level " + state.level)
}
saveState()
renderHeader()
}

function getTodayString() {
  return new Date().toISOString().slice(0,10)
}

function getYesterdayString() {
  const d = new Date()
  d.setDate(d.getDate()-1)
  return d.toISOString().slice(0,10)
}

function checkStreak() {
  const today = getTodayString()
  const yesterday = getYesterdayString()
  if(state.lastDate === today) {
    return
  } else if(state.lastDate === yesterday) {
    state.streak += 1
  } else {
    state.streak = 0
  }
}