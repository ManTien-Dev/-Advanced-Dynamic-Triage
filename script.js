// Slide Presentation Navigation Logic
const slides = document.querySelectorAll('.slide');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const progressBar = document.getElementById('progress-bar');
const slideNum = document.getElementById('slide-num');

let currentSlideIdx = 0;

function updateSlides() {
  slides.forEach((slide, idx) => {
    slide.classList.remove('active', 'prev');
    if (idx === currentSlideIdx) {
      slide.classList.add('active');
    } else if (idx < currentSlideIdx) {
      slide.classList.add('prev');
    }
  });

  // Update nav buttons
  btnPrev.disabled = currentSlideIdx === 0;
  btnNext.disabled = currentSlideIdx === slides.length - 1;

  // Update progress bar
  const progressPercent = (currentSlideIdx / (slides.length - 1)) * 100;
  progressBar.style.width = `${progressPercent}%`;

  // Update text indicator
  slideNum.textContent = `Slide ${currentSlideIdx + 1} / ${slides.length}`;
}

btnPrev.addEventListener('click', () => {
  if (currentSlideIdx > 0) {
    currentSlideIdx--;
    updateSlides();
  }
});

btnNext.addEventListener('click', () => {
  if (currentSlideIdx < slides.length - 1) {
    currentSlideIdx++;
    updateSlides();
  }
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
  // If user is typing in simulator inputs, do not change slides
  if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
    return;
  }

  if (e.key === 'ArrowRight' || e.key === ' ') {
    if (currentSlideIdx < slides.length - 1) {
      currentSlideIdx++;
      updateSlides();
      e.preventDefault();
    }
  } else if (e.key === 'ArrowLeft') {
    if (currentSlideIdx > 0) {
      currentSlideIdx--;
      updateSlides();
      e.preventDefault();
    }
  }
});

// Initialize slide show
updateSlides();


// ==========================================================================
// INTERACTIVE TRIAGE SIMULATOR LOGIC
// ==========================================================================

const BASE_SCORES = [1000, 500, 250, 100, 0];

let R1 = 1;
let R2 = 2;
let R3 = 5;

let currentTime = 0;
let patients = []; // List of patient objects

class Patient {
  constructor(tArrive, name, level) {
    this.tArrive = tArrive;
    this.name = name;
    this.level = level;
    this.pBase = BASE_SCORES[level - 1];
    this.removed = false;
    this.lastKnownPhase = 1;

    // Calculate static components
    this.c1 = this.pBase - this.tArrive * R1;
    this.c2 = this.pBase + 60 * R1 - 60 * R2 - this.tArrive * R2;
    this.c3 = this.pBase + 60 * R1 + 60 * R2 - 120 * R3 - this.tArrive * R3;
  }

  getWaitTime(T) {
    return T - this.tArrive;
  }

  getPhase(T) {
    const wait = this.getWaitTime(T);
    if (wait <= 60) return 1;
    if (wait <= 120) return 2;
    return 3;
  }

  score(T) {
    const wait = this.getWaitTime(T);
    if (wait <= 60) {
      return this.c1 + T * R1;
    } else if (wait <= 120) {
      return this.c2 + T * R2;
    } else {
      return this.c3 + T * R3;
    }
  }
}

// Comparators
function tieBreak(a, b) {
  if (a.tArrive !== b.tArrive) {
    return a.tArrive - b.tArrive;
  }
  return a.name.localeCompare(b.name);
}

// Logs to simulator console
function logToSimConsole(msg, type = 'info') {
  const consoleEl = document.getElementById('sim-console');
  if (!consoleEl) return;

  const emptyMsg = consoleEl.querySelector('.empty');
  if (emptyMsg) {
    emptyMsg.remove();
  }

  const line = document.createElement('div');
  line.className = `console-line ${type}`;
  line.textContent = `[t=${currentTime}p] ${msg}`;
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

// Update simulation system parameters from UI
function updateRiskParameters() {
  R1 = parseInt(document.getElementById('r1-val').value) || 1;
  R2 = parseInt(document.getElementById('r2-val').value) || 2;
  R3 = parseInt(document.getElementById('r3-val').value) || 5;

  // Recalculate coefficients for all active patients
  patients.forEach(p => {
    p.c1 = p.pBase - p.tArrive * R1;
    p.c2 = p.pBase + 60 * R1 - 60 * R2 - p.tArrive * R2;
    p.c3 = p.pBase + 60 * R1 + 60 * R2 - 120 * R3 - p.tArrive * R3;
  });
}

// Main Render Function
function renderSimulation() {
  // Read risk parameters
  updateRiskParameters();

  document.getElementById('sim-time-val').textContent = currentTime;

  const q1Cards = document.getElementById('q1-cards');
  const q2Cards = document.getElementById('q2-cards');
  const q3Cards = document.getElementById('q3-cards');

  q1Cards.innerHTML = '';
  q2Cards.innerHTML = '';
  q3Cards.innerHTML = '';

  // Classify patients into queues based on current wait time
  const q1List = [];
  const q2List = [];
  const q3List = [];

  patients.forEach(p => {
    const phase = p.getPhase(currentTime);
    
    // Log lazy migrations if patient transitions to next phase
    if (phase > p.lastKnownPhase) {
      logToSimConsole(`Lazy Migration: Bệnh nhân ${p.name} chuyển từ G${p.lastKnownPhase} sang G${phase} (đã chờ ${p.getWaitTime(currentTime)} phút)`, 'warn');
      p.lastKnownPhase = phase;
    }

    if (phase === 1) q1List.push(p);
    else if (phase === 2) q2List.push(p);
    else q3List.push(p);
  });

  // Sort Q1 based on static constant c1 descending, tieBreak ascending
  q1List.sort((a, b) => {
    if (b.c1 !== a.c1) return b.c1 - a.c1;
    return tieBreak(a, b);
  });

  // Sort Q2 based on c2 descending, tieBreak ascending
  q2List.sort((a, b) => {
    if (b.c2 !== a.c2) return b.c2 - a.c2;
    return tieBreak(a, b);
  });

  // Sort Q3 based on c3 descending, tieBreak ascending
  q3List.sort((a, b) => {
    if (b.c3 !== a.c3) return b.c3 - a.c3;
    return tieBreak(a, b);
  });

  // Identify who is the current overall winner at time T
  let bestPatient = null;
  const candidates = [q1List[0], q2List[0], q3List[0]].filter(Boolean);

  candidates.forEach(cand => {
    if (!bestPatient) {
      bestPatient = cand;
      return;
    }
    const scoreCand = cand.score(currentTime);
    const scoreBest = bestPatient.score(currentTime);

    if (scoreCand > scoreBest) {
      bestPatient = cand;
    } else if (scoreCand === scoreBest) {
      if (tieBreak(cand, bestPatient) < 0) {
        bestPatient = cand;
      }
    }
  });

  // Helper to build DOM card
  function createCardHTML(p) {
    const isBest = bestPatient && bestPatient.name === p.name && bestPatient.tArrive === p.tArrive;
    const card = document.createElement('div');
    card.className = `patient-card ${isBest ? 'highest' : ''}`;
    
    card.innerHTML = `
      <div class="pat-name-row">
        <span class="pat-name" title="${p.name}">${p.name}</span>
        <span class="pat-level-dot dot-lvl-${p.level}" title="Cấp độ ưu tiên: ${p.level}"></span>
      </div>
      <div class="pat-details">
        <span>Vào lúc: ${p.tArrive}p</span>
        <span>Chờ: ${p.getWaitTime(currentTime)}p</span>
      </div>
      <div class="pat-score-row">
        <span class="pat-score-label">Điểm Triage:</span>
        <span class="pat-score-val">${p.score(currentTime)}</span>
      </div>
    `;
    return card;
  }

  // Populate Q1
  if (q1List.length === 0) {
    q1Cards.innerHTML = '<div class="empty-queue-msg">Hàng đợi trống</div>';
  } else {
    q1List.forEach(p => q1Cards.appendChild(createCardHTML(p)));
  }

  // Populate Q2
  if (q2List.length === 0) {
    q2Cards.innerHTML = '<div class="empty-queue-msg">Hàng đợi trống</div>';
  } else {
    q2List.forEach(p => q2Cards.appendChild(createCardHTML(p)));
  }

  // Populate Q3
  if (q3List.length === 0) {
    q3Cards.innerHTML = '<div class="empty-queue-msg">Hàng đợi trống</div>';
  } else {
    q3List.forEach(p => q3Cards.appendChild(createCardHTML(p)));
  }

  // Keep track of the active winner
  window.currentBest = bestPatient;
}

// Add patient event handler
document.getElementById('btn-add-patient').addEventListener('click', () => {
  const nameInput = document.getElementById('p-name');
  const levelSelect = document.getElementById('p-level');

  const name = nameInput.value.trim();
  const level = parseInt(levelSelect.value);

  if (!name) {
    alert('Vui lòng nhập tên bệnh nhân!');
    return;
  }

  // Validate name (only english characters as per constraint)
  if (!/^[a-zA-Z]+$/.test(name)) {
    alert('Tên bệnh nhân chỉ chứa ký tự chữ cái tiếng Anh viết liền!');
    return;
  }

  // Add patient
  const p = new Patient(currentTime, name, level);
  patients.push(p);
  logToSimConsole(`Bệnh nhân ${name} (Mức ${level}) nhập viện. P_base = ${p.pBase}`, 'success');

  // Clear name input for next entry
  nameInput.value = '';
  renderSimulation();
});

// Time step increment (+5 mins)
document.getElementById('btn-step-time').addEventListener('click', () => {
  currentTime += 5;
  logToSimConsole(`Thời gian tăng thêm +5 phút.`, 'info');
  renderSimulation();
});

// CALL event handler
document.getElementById('btn-call-patient').addEventListener('click', () => {
  const best = window.currentBest;
  if (!best) {
    logToSimConsole('Không có bệnh nhân nào trong phòng chờ (No patient)', 'empty');
    alert('Không có bệnh nhân nào trong phòng chờ để khám!');
    return;
  }

  // Announce the call using the modal/overlay
  const overlay = document.getElementById('call-overlay');
  document.getElementById('call-overlay-name').textContent = best.name;
  document.getElementById('call-overlay-arrive').textContent = `${best.tArrive} phút`;
  document.getElementById('call-overlay-wait').textContent = `${best.getWaitTime(currentTime)} phút`;
  document.getElementById('call-overlay-score').textContent = best.score(currentTime);

  overlay.classList.add('active');
  
  // Log calling
  logToSimConsole(`Gọi bệnh nhân: ${best.name} vào khám (Điểm Triage: ${best.score(currentTime)} | Thời gian chờ: ${best.getWaitTime(currentTime)}p)`, 'success');
  
  // Remove patient from list
  patients = patients.filter(p => !(p.name === best.name && p.tArrive === best.tArrive));
});

// Close call overlay
document.getElementById('btn-close-overlay').addEventListener('click', () => {
  document.getElementById('call-overlay').classList.remove('active');
  renderSimulation();
});

// Reset simulation state
function resetSim() {
  currentTime = 0;
  patients = [];
  document.getElementById('sim-console').innerHTML = '<div class="console-line empty">Hàng đợi đã được làm mới.</div>';
  renderSimulation();
}

document.getElementById('btn-reset-sim').addEventListener('click', resetSim);

// Load Sample Scenario 1
document.getElementById('btn-load-sample').addEventListener('click', () => {
  resetSim();
  
  // R1=1, R2=2, R3=5
  document.getElementById('r1-val').value = 1;
  document.getElementById('r2-val').value = 2;
  document.getElementById('r3-val').value = 5;
  updateRiskParameters();

  currentTime = 0;
  // IN 0 An 4
  const pAn = new Patient(0, 'An', 4);
  patients.push(pAn);
  logToSimConsole(`[Sample 1] IN 0 An 4 (Level 4, P_base=100)`, 'success');

  // Jump to 120
  currentTime = 120;
  logToSimConsole(`[Sample 1] Thời gian trôi đến T=120`, 'info');

  // IN 120 Binh 3
  const pBinh = new Patient(120, 'Binh', 3);
  patients.push(pBinh);
  logToSimConsole(`[Sample 1] IN 120 Binh 3 (Level 3, P_base=250)`, 'success');

  logToSimConsole(`[Sample 1] Sẵn sàng gọi khám tại phút thứ 120.`, 'info');
  renderSimulation();
});
