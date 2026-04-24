// state
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
    document.getElementById("timer_mode").textContent = "Rest"
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
    current.endsWith("index.html") || current.endsWith("/"))) {
      link.classList.add("active")
    }
  })
}

//placeholders
function loadState() {

}
function renderHeader() {
  
}