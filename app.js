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
try { seedQuests() } catch(e) {}
try { renderHeader() } catch(e) {}
try { updateDisplay() } catch(e) {}
try { updateActiveQuestDisplay() } catch(e) {}
try { renderQuests() } catch(e) {}
try { highlightNav() } catch(e) {}

//Timer functions
function startTimer() {
  if (isRunning) return
isRunning = true
document.getElementById("timer-ring").classList.add("pulsing")
timerInterval = setInterval(tick,1000)
checkBossMode()
}

function pauseTimer() {
  clearInterval(timerInterval)
  isRunning = false
  document.getElementById("timer-ring").classList.remove("pulsing")
  document.body.classList.remove("boss-mode")
}

function resetTimer() {
  clearInterval(timerInterval)
  isRunning = false
  secondsLeft = 1500
  mode = "focus"
  document.getElementById("timer-ring").classList.remove("pulsing")
  document.getElementById("timer-mode").textContent = "Focus"
  updateDisplay()
  document.body.classList.remove("boss-mode")
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
    document.getElementById("timer-mode").textContent = "REST"
    showMessage("Rest time! You need a break!")
    awardXP(250)
  } else {
    mode = "focus"
    secondsLeft = 1500
    document.getElementById("timer-mode").textContent = "FOCUS"
    showMessage("Battle Ready! Start when you are ready!")
    playSound("rest")
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
  const elapsed = total - secondsLeft
  const pct = (elapsed /total) *100
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
  document.getElementById("player-name").textContent = state.playerName || "Hero"
  document.getElementById("level-display").textContent = "LVL" + state.level
  document.getElementById("streak-display").textContent = "Streak:" + state.streak
  document.getElementById("token-display").textContent = "Tokens:" + state.tokens
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
state.tokens += Math.round(gained/10)
while(state.xp>= xpNeeded()) {
  state.xp -= xpNeeded()
  state.level += 1
  showMessage("Level Up! You are now level " + state.level)
  playSound("levelup")
}
saveState()
playSound("xp")
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
  state.lastDate = today
}

const XP_REWARDS = {
  easy:   50,
  medium: 150,
  epic:   350,
  boss:   800
}

function handleAddQuest() {
  const title      = document.getElementById("quest-input").value.trim()
  const difficulty = document.getElementById("difficulty-select").value
  if (title === "") {
    showMessage("Please enter a quest name!")
    return
  }
  addQuest(title, difficulty)
  document.getElementById("quest-input").value = ""
}

function addQuest(title, difficulty) {
  const quest = {
    id:         Date.now(),
    title:      title,
    difficulty: difficulty,
    xpReward:   XP_REWARDS[difficulty],
    completed:  false
  }
  state.quests.push(quest)
  saveState()
  renderQuests()
}

function completeQuest(id) {
  const quest = state.quests.find(q => q.id === id)
  if (!quest || quest.completed) return
  quest.completed = true
  awardXP(quest.xpReward)
  showMessage("Quest complete! +" + quest.xpReward + " XP")
  playSound("complete")
  saveState()
  renderQuests()
  renderCompletedQuests()
}

function selectQuest(id) {
  state.activeQuestId = id
  saveState()
  renderQuests()
  updateActiveQuestDisplay()
  checkBossMode()
}

function removeQuest(id) {
  state.quests = state.quests.filter(q => q.id !== id)
  saveState()
  renderQuests()
}

function renderQuests() {
  const container = document.getElementById("quest-list")
  if (!container) return
  container.innerHTML = ""
  const open = state.quests.filter(q => !q.completed)
  if (open.length === 0) {
    container.innerHTML = "<p id='no-quests'>No quests yet. Add one above!</p>"
  }
  renderCompletedQuests()
    return
  
  renderCompletedQuests()
  }
  open.forEach(quest => {
    const card = document.createElement("div")
    card.className = "quest-card"
    if (quest.id === state.activeQuestId) {
      card.classList.add("quest-active")
    }
    card.innerHTML = `
      <div class="quest-info">
        <span class="quest-title">${quest.title}</span>
        <span class="quest-badge ${quest.difficulty}">${quest.difficulty}</span>
        <span class="quest-xp">+${quest.xpReward} XP</span>
      </div>
      <div class="quest-actions">
        <button onclick="selectQuest(${quest.id})">Target</button>
        <button onclick="completeQuest(${quest.id})">Complete</button>
        <button onclick="removeQuest(${quest.id})">✕</button>
      </div>
    `
    container.appendChild(card)
  })


function updateActiveQuestDisplay() {
  const el = document.getElementById("active-quest-name")
  if (!el) return
  const quest = state.quests.find(q => q.id === state.activeQuestId)
  if (quest) {
    el.textContent = quest.title
    document.getElementById("active-quest").querySelector("p").textContent = "Current Target:"
  } else {
    el.textContent = ""
    const p = document.getElementById("active-quest")
    if (p) p.querySelector("p").textContent = "No quest selected"
  }
}

function seedQuests() {
  if (state.quests.length > 0) return
  addQuest("Set up your workspace", "easy")
  addQuest("Finish the assignment", "medium")
  addQuest("Build FocusForge", "boss")
}

function resetProgress() {
  const confirmed = window.confirm("Wipe all progress? This cannot be undone.")
  if (confirmed) {
    localStorage.removeItem("focusforge_v1")
    window.location.href = "index.html"
  }
}

function editName() {
  const current = state.playerName || "Hero"
  const newName = prompt("Enter your name:",current)
  if (newName && newName.trim() !== "") {
    state.playerName = newName.trim()
    saveState()
    document.getElementById("player-name").textContent = state.playerName

  }
}

function playSound(type) {
  const ctx = new(window.AudioContext || window.webkitAudioContext)()
const oscillator = ctx.createOscillator()
const gain = ctx.createGain()

oscillator.connect(gain)
gain.connect(ctx.destination)

if (type === "xp") {
  oscillator.frequency.setValueAtTime(420, ctx.currentTime)
  oscillator.frequency.setValueAtTime(660,  ctx.currentTime + 0.1)
  gain.gain.setValueAtTime(0.3,ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.3)
}

if(type === "levelup") {
  oscillator.frequency.setValueAtTime(400, ctx.currentTime)
  oscillator.frequency.setValueAtTime(600,  ctx.currentTime + 0.1)
  oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2)
  gain.gain.setValueAtTime(0.4, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.5)
}

if(type === "complete") {
  oscillator.frequency.setValueAtTime(300, ctx.currentTime)
  oscillator.frequency.setValueAtTime(500, ctx.currentTime + 0.15)
  oscillator.frequency.setValueAtTime(700, ctx.currentTime + 0.3)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.5)
}

if(type === "rest") {
  oscillator.type = "sine"
  oscillator.frequency.setValueAtTime(250, ctx.currentTime)
  oscillator.frequency.setValueAtTime(200, ctx.currentTime + 0.2)
  gain.gain.setValueAtTime(0.2, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.4)
}
}

function checkBossMode() {
  const activeQuest = state.quests.find(q => q.id === state.activeQuestId)
  if (activeQuest && activeQuest.difficulty === "boss" && isRunning) {
    document.body.classList.add("boss-mode")
  } else {
    document.body.classList.remove("boss-mode")
  }
  }

function renderCompletedQuests() {
  const container = document.getElementById("completed-list")
  if(!container) return

  container.innerHTML = ""

  const done = state.quests.filter(q => q.completed)
  if(done.length === 0) {
    container.innerHTML = "<p style = 'color:var(--dust); padding:10px'>No completed quests yet.</p>"
    return
  }
  done.forEach(quest => {
    const card = document.createElement("div")
    card.className = "quest-card"
    card.style.opacity = "0.5"
    card.innerHTML =  `
    <div class="quest-info">
      <span class= "quest-title" style = "text-decoration:line-through">${quest.title}</span>
      <span class = "quest-badge ${quest.difficulty}">${quest.difficulty}</span>
      <span class="quest-xp">+${quest.xpReward} XP ✓</span>
    </div>
      `
      container.appendChild(card)
  })
}

function toggleCompleted() {
  const list = document.getElementById("completed-list")
  const toggle = document.getElementById("completed-toggle")
  if (list.style.display === "none") {
    list.style.display = "block"
    toggle.textContent = "▼"
  } else {
    list.style.display = "none"
    toggle.textContent = "►"
  }
}

