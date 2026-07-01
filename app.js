/**
 * STRIDE-lite Threat Modeler - Application logic & SVG Engine controller
 */

// State Control
let state = {
  playerName: "GUEST",
  studentId: "N/A",
  googleUserEmail: null,
  currentLevelIdx: 0,
  threatIndex: 0,
  score: 0,
  lives: 3,
  timeStart: 0,
  timeElapsed: 0,
  threatTimeStart: 0,
  strideScores: {
    S: { correct: 0, total: 2 },
    T: { correct: 0, total: 2 },
    R: { correct: 0, total: 1 },
    I: { correct: 0, total: 1 },
    D: { correct: 0, total: 1 },
    E: { correct: 0, total: 2 }
  },
  selectedNodeId: null,
  selectedStride: null,
  selectedControl: null,
  isQuestionLocked: false,
  timerInterval: null
};

// DOM References
const screens = {
  start: document.getElementById("start-screen"),
  game: document.getElementById("game-screen"),
  result: document.getElementById("result-screen")
};

const topbar = {
  playerDisplayName: document.getElementById("player-display-name"),
  playerBadge: document.getElementById("player-badge"),
  bestScore: document.getElementById("best-score")
};

const scanlineToggleBtn = document.getElementById("scanline-toggle-btn");

const oauthUI = {
  btnSettings: document.getElementById("oauth-settings-btn"),
  modal: document.getElementById("oauth-settings-modal"),
  closeBtn: document.getElementById("close-oauth-modal-btn"),
  clientIdInput: document.getElementById("oauth-client-id"),
  saveBtn: document.getElementById("save-oauth-btn"),
  clearBtn: document.getElementById("clear-oauth-btn"),
  loginSection: document.getElementById("google-login-section"),
  googleBtn: document.getElementById("google-signin-btn")
};

const gameUI = {
  levelBadge: document.getElementById("level-badge"),
  levelName: document.getElementById("level-name"),
  scoreDisplay: document.getElementById("score-display"),
  livesDisplay: document.getElementById("lives-display"),
  progressPercent: document.getElementById("progress-percent"),
  progressBarFill: document.getElementById("progress-bar-fill"),
  progressText: document.getElementById("progress-text"),
  dfdSvg: document.getElementById("dfd-svg"),
  hintButton: document.getElementById("hint-button"),
  hintPanel: document.getElementById("hint-panel"),
  hintText: document.getElementById("hint-text"),
  threatPrompt: document.getElementById("threat-prompt"),
  selectedNodeDisplay: document.getElementById("selected-node-display"),
  controlsListContainer: document.getElementById("controls-list-container"),
  submitAuditBtn: document.getElementById("submit-audit-btn"),
  feedbackPanel: document.getElementById("feedback-panel"),
  feedbackTitle: document.getElementById("feedback-title"),
  feedbackText: document.getElementById("feedback-text"),
  feedbackIcon: document.getElementById("feedback-icon"),
  nextButton: document.getElementById("next-button")
};

const resultUI = {
  evalName: document.getElementById("eval-name"),
  evalId: document.getElementById("eval-id"),
  evalBadge: document.getElementById("eval-badge"),
  evalTitle: document.getElementById("eval-title"),
  evalDesc: document.getElementById("eval-desc"),
  evalScore: document.getElementById("eval-score"),
  evalTime: document.getElementById("eval-time"),
  restartButton: document.getElementById("restart-button"),
  showCertButton: document.getElementById("show-cert-button"),
  statSVal: document.getElementById("stat-s-val"),
  statSBar: document.getElementById("stat-s-bar"),
  statTVal: document.getElementById("stat-t-val"),
  statTBar: document.getElementById("stat-t-bar"),
  statRVal: document.getElementById("stat-r-val"),
  statRBar: document.getElementById("stat-r-bar"),
  statIVal: document.getElementById("stat-i-val"),
  statIBar: document.getElementById("stat-i-bar"),
  statDVal: document.getElementById("stat-d-val"),
  statDBar: document.getElementById("stat-d-bar"),
  statEVal: document.getElementById("stat-e-val"),
  statEBar: document.getElementById("stat-e-bar")
};

const certUI = {
  certModal: document.getElementById("cert-modal"),
  closeCertButton: document.getElementById("close-cert-button"),
  certificate: document.getElementById("certificate"),
  recipientName: document.getElementById("cert-recipient-name"),
  recipientId: document.getElementById("cert-recipient-id"),
  date: document.getElementById("cert-date"),
  hash: document.getElementById("cert-hash"),
  printButton: document.getElementById("print-button"),
  dismissButton: document.getElementById("dismiss-modal-button")
};

// Initialize listeners
document.addEventListener("DOMContentLoaded", () => {
  // Load best score
  const cachedBest = localStorage.getItem("stride_best_score") || "0000";
  topbar.bestScore.textContent = cachedBest.toString().padStart(4, "0");

  // Load scanline preference
  const isScanlineOff = localStorage.getItem("scanlines_disabled") === "true";
  if (isScanlineOff) {
    document.body.classList.add("no-scanlines");
    if (scanlineToggleBtn) scanlineToggleBtn.textContent = "CRT SCREEN: OFF";
  }

  // Scanline toggle click listener
  if (scanlineToggleBtn) {
    scanlineToggleBtn.addEventListener("click", () => {
      const isCurrentlyOff = document.body.classList.contains("no-scanlines");
      if (isCurrentlyOff) {
        document.body.classList.remove("no-scanlines");
        scanlineToggleBtn.textContent = "CRT SCREEN: ON";
        localStorage.setItem("scanlines_disabled", "false");
      } else {
        document.body.classList.add("no-scanlines");
        scanlineToggleBtn.textContent = "CRT SCREEN: OFF";
        localStorage.setItem("scanlines_disabled", "true");
      }
    });
  }

  // OAuth Modal settings events
  if (oauthUI.btnSettings) {
    oauthUI.btnSettings.addEventListener("click", () => {
      const savedId = localStorage.getItem("google_oauth_client_id") || "";
      oauthUI.clientIdInput.value = savedId;
      oauthUI.modal.classList.remove("is-hidden");
    });
  }
  if (oauthUI.closeBtn) {
    oauthUI.closeBtn.addEventListener("click", () => {
      oauthUI.modal.classList.add("is-hidden");
    });
  }
  if (oauthUI.saveBtn) {
    oauthUI.saveBtn.addEventListener("click", () => {
      const clientId = oauthUI.clientIdInput.value.trim();
      if (clientId) {
        localStorage.setItem("google_oauth_client_id", clientId);
        oauthUI.modal.classList.add("is-hidden");
        alert("Google OAuth Client ID saved successfully! Page reloading to apply...");
        window.location.reload();
      } else {
        alert("Please enter a valid Client ID.");
      }
    });
  }
  if (oauthUI.clearBtn) {
    oauthUI.clearBtn.addEventListener("click", () => {
      localStorage.removeItem("google_oauth_client_id");
      oauthUI.clientIdInput.value = "";
      oauthUI.modal.classList.add("is-hidden");
      alert("Google OAuth Client ID cleared. Page reloading...");
      window.location.reload();
    });
  }

  // Google OAuth GSI Initializer
  const oauthId = localStorage.getItem("google_oauth_client_id") || "69112486306-t7mofej13egi7ape3t2cgs5l19tg6sp7.apps.googleusercontent.com";
  if (oauthId && oauthUI.loginSection) {
    oauthUI.loginSection.classList.remove("is-hidden");
    
    // GSI Global Handler
    window.handleGoogleCredentialResponse = (response) => {
      try {
        const payload = JSON.parse(atob(response.credential.split(".")[1]));
        const email = payload.email || "";
        
        // Locked to nu.ac.th Naresuan University
        if (!email.toLowerCase().endsWith("@nu.ac.th")) {
          alert("ACCESS DENIED: Google Sign-In is locked to Naresuan University accounts (@nu.ac.th).");
          return;
        }

        state.playerName = payload.name || "STUDENT";
        state.googleUserEmail = email;

        // Auto-extract Student ID from email prefix if format: 660601XXXX@nu.ac.th
        const studentIdMatch = email.match(/^(\d{10})@/);
        if (studentIdMatch) {
          state.studentId = studentIdMatch[1];
        } else {
          state.studentId = "STAFF/INSTRUCTOR";
        }

        // Auto Login
        initializeGame();
      } catch (err) {
        console.error("JWT credential parse error", err);
        alert("Failed to parse Google sign-in payload.");
      }
    };

    // Render button
    setTimeout(() => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: oauthId,
          callback: window.handleGoogleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          oauthUI.googleBtn,
          { theme: "outline", size: "large", width: 280 }
        );
      }
    }, 800);
  }

  // Form submit
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    initializeGame();
  });

  // Next button click
  gameUI.nextButton.addEventListener("click", () => {
    advanceGame();
  });

  // Restart trigger
  resultUI.restartButton.addEventListener("click", () => {
    showScreen("start");
  });

  // Certificate modals
  resultUI.showCertButton.addEventListener("click", openCertificate);
  certUI.closeCertButton.addEventListener("click", closeCertificate);
  certUI.dismissButton.addEventListener("click", closeCertificate);
  certUI.printButton.addEventListener("click", () => window.print());

  // Hint toggle
  gameUI.hintButton.addEventListener("click", () => {
    gameUI.hintPanel.classList.toggle("is-hidden");
  });

  // Stride Vector selection buttons listeners
  document.querySelectorAll(".stride-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (state.isQuestionLocked) return;
      document.querySelectorAll(".stride-btn").forEach(b => b.classList.remove("active"));
      state.selectedStride = btn.getAttribute("data-stride");
      btn.classList.add("active");
      checkValidationTrigger();
    });
  });

  // Submit button
  gameUI.submitAuditBtn.addEventListener("click", () => {
    verifyAuditReport();
  });

  // Keyboard mapping
  document.addEventListener("keydown", handleKeyDown);
});

// Switch screen helper
function showScreen(screenId) {
  Object.keys(screens).forEach(key => {
    if (key === screenId) {
      screens[key].classList.remove("is-hidden");
    } else {
      screens[key].classList.add("is-hidden");
    }
  });
}

// Reset state values
function initializeGame() {
  const nameEl = document.getElementById("player-name");
  const idEl = document.getElementById("student-id");
  if (nameEl) state.playerName = nameEl.value.trim() || "ANALYST";
  if (idEl) state.studentId = idEl.value.trim() || "N/A";
  state.currentLevelIdx = 0;
  state.threatIndex = 0;
  state.score = 0;
  state.lives = 3;
  state.timeStart = Date.now();
  state.strideScores = {
    S: { correct: 0, total: 2 },
    T: { correct: 0, total: 2 },
    R: { correct: 0, total: 1 },
    I: { correct: 0, total: 1 },
    D: { correct: 0, total: 1 },
    E: { correct: 0, total: 2 }
  };
  state.isQuestionLocked = false;

  topbar.playerDisplayName.textContent = state.playerName.toUpperCase();
  topbar.playerBadge.classList.remove("is-hidden");

  // Timer intervals
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timeElapsed = Math.floor((Date.now() - state.timeStart) / 1000);
  }, 1000);

  showScreen("game");
  loadThreatEvent();
}

// Load current threat scenario details
function loadThreatEvent() {
  state.isQuestionLocked = false;
  state.selectedNodeId = null;
  state.selectedStride = null;
  state.selectedControl = null;

  gameUI.hintPanel.classList.add("is-hidden");
  gameUI.feedbackPanel.classList.add("is-hidden");
  gameUI.selectedNodeDisplay.textContent = "[CLICK ON DIAGRAM NODE]";
  gameUI.selectedNodeDisplay.classList.remove("active");

  document.querySelectorAll(".stride-btn").forEach(b => b.classList.remove("active"));
  gameUI.submitAuditBtn.disabled = true;

  const level = LEVELS[state.currentLevelIdx];
  const threat = level.threats[state.threatIndex];
  state.threatTimeStart = Date.now();

  // Set side info
  gameUI.levelBadge.textContent = `LEVEL ${level.id}`;
  gameUI.levelName.textContent = level.name;
  gameUI.scoreDisplay.textContent = state.score.toString().padStart(4, "0");
  updateLivesDisplay();

  // Dynamic progress meters
  const totalThreats = 9;
  const currentNum = (state.currentLevelIdx * 3) + state.threatIndex + 1;
  const progressRatio = (currentNum / totalThreats) * 100;
  gameUI.progressPercent.textContent = `${Math.round(progressRatio)}%`;
  gameUI.progressBarFill.style.width = `${progressRatio}%`;
  gameUI.progressText.textContent = `Threat event ${currentNum} of ${totalThreats}`;

  // Description and hints
  gameUI.threatPrompt.textContent = threat.description;
  gameUI.hintText.textContent = threat.hint;

  // Render SVG DFD Architecture
  drawDfd(level, threat);

  // Render control buttons
  renderMitigationControls(threat);
}

// Update strike point icons
function updateLivesDisplay() {
  gameUI.livesDisplay.innerHTML = "";
  for (let i = 1; i <= 3; i++) {
    const lifeSpan = document.createElement("span");
    lifeSpan.className = `life-point ${i <= state.lives ? "active" : ""}`;
    lifeSpan.textContent = "🔐";
    lifeSpan.setAttribute("aria-label", `Firewall integrity node ${i}`);
    gameUI.livesDisplay.appendChild(lifeSpan);
  }
}

// Draw DFD dynamically inside the SVG viewport
function drawDfd(level, threat) {
  const svg = gameUI.dfdSvg;
  
  // Clear and setup markers definitions
  svg.innerHTML = `
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
      </marker>
    </defs>
  `;

  const svgNamespace = "http://www.w3.org/2000/svg";

  // 1. Draw trust boundary lines
  level.boundaries.forEach(b => {
    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("x1", b.x1);
    line.setAttribute("y1", b.y1);
    line.setAttribute("x2", b.x2);
    line.setAttribute("y2", b.y2);
    line.setAttribute("class", "dfd-boundary-line");
    svg.appendChild(line);

    const txt = document.createElementNS(svgNamespace, "text");
    txt.setAttribute("x", b.x1 + 6);
    txt.setAttribute("y", b.y1 + 10);
    txt.setAttribute("class", "dfd-boundary-lbl");
    txt.textContent = b.label.toUpperCase();
    svg.appendChild(txt);
  });

  // 2. Draw data flow lines
  level.flows.forEach(f => {
    const fromNode = level.nodes.find(n => n.id === f.from);
    const toNode = level.nodes.find(n => n.id === f.to);
    if (!fromNode || !toNode) return;

    // Draw straight flow lines
    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("x1", fromNode.x);
    line.setAttribute("y1", fromNode.y);
    line.setAttribute("x2", toNode.x);
    line.setAttribute("y2", toNode.y);
    line.setAttribute("class", "dfd-flow-path");
    line.setAttribute("marker-end", "url(#arrow)");
    svg.appendChild(line);

    // Flow labels middle location
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2 - 8;
    const txt = document.createElementNS(svgNamespace, "text");
    txt.setAttribute("x", midX);
    txt.setAttribute("y", midY);
    txt.setAttribute("class", "dfd-flow-lbl");
    txt.textContent = f.label.toLowerCase();
    svg.appendChild(txt);
  });

  // 3. Draw DFD components
  level.nodes.forEach(n => {
    const g = document.createElementNS(svgNamespace, "g");
    // Pulse highlight target node if active
    let classVal = "dfd-node";
    if (threat.targetNode === n.id) {
      classVal += " pulse-warning";
    }
    g.setAttribute("class", classVal);
    g.setAttribute("id", `node-${n.id}`);

    // Click event handler
    g.addEventListener("click", () => {
      if (state.isQuestionLocked) return;
      
      // Select node
      document.querySelectorAll(".dfd-node").forEach(el => el.classList.remove("selected"));
      g.classList.add("selected");
      state.selectedNodeId = n.id;

      // Update control step display text
      gameUI.selectedNodeDisplay.textContent = `TARGET: ${n.label.toUpperCase()}`;
      gameUI.selectedNodeDisplay.classList.add("active");

      checkValidationTrigger();
    });

    if (n.type === "entity") {
      // Entity rectangle
      const rect = document.createElementNS(svgNamespace, "rect");
      rect.setAttribute("x", n.x - 50);
      rect.setAttribute("y", n.y - 25);
      rect.setAttribute("width", 100);
      rect.setAttribute("height", 50);
      rect.setAttribute("class", "dfd-node-rect");
      g.appendChild(rect);
    } else if (n.type === "process") {
      // Process circle
      const circle = document.createElementNS(svgNamespace, "circle");
      circle.setAttribute("cx", n.x);
      circle.setAttribute("cy", n.y);
      circle.setAttribute("r", 30);
      circle.setAttribute("class", "dfd-node-circle");
      g.appendChild(circle);
    } else if (n.type === "store") {
      // Data Store parallel lines
      const line1 = document.createElementNS(svgNamespace, "line");
      line1.setAttribute("x1", n.x - 50);
      line1.setAttribute("y1", n.y - 20);
      line1.setAttribute("x2", n.x + 50);
      line1.setAttribute("y2", n.y - 20);
      line1.setAttribute("class", "dfd-node-store-line");

      const line2 = document.createElementNS(svgNamespace, "line");
      line2.setAttribute("x1", n.x - 50);
      line2.setAttribute("y1", n.y + 20);
      line2.setAttribute("x2", n.x + 50);
      line2.setAttribute("y2", n.y + 20);
      line2.setAttribute("class", "dfd-node-store-line");

      g.appendChild(line1);
      g.appendChild(line2);

      // Store transparent click-catch backing box
      const rect = document.createElementNS(svgNamespace, "rect");
      rect.setAttribute("x", n.x - 50);
      rect.setAttribute("y", n.y - 20);
      rect.setAttribute("width", 100);
      rect.setAttribute("height", 40);
      rect.setAttribute("fill", "transparent");
      g.appendChild(rect);
    }

    // Text labels inside nodes
    const label = document.createElementNS(svgNamespace, "text");
    label.setAttribute("x", n.x);
    label.setAttribute("y", n.y + 4);
    label.setAttribute("class", "dfd-node-text");
    label.textContent = n.label;
    g.appendChild(label);

    svg.appendChild(g);
  });
}

// Render vertical radio-like list options of mitigations
function renderMitigationControls(threat) {
  const container = gameUI.controlsListContainer;
  container.innerHTML = "";

  threat.controls.forEach((ctrl, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "control-opt";
    btn.id = `control-opt-${idx + 1}`;
    btn.textContent = ctrl;
    
    btn.addEventListener("click", () => {
      if (state.isQuestionLocked) return;
      document.querySelectorAll(".control-opt").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.selectedControl = ctrl;
      checkValidationTrigger();
    });

    container.appendChild(btn);
  });
}

// Unlock verify button if all 3 steps completed
function checkValidationTrigger() {
  const isReady = state.selectedNodeId !== null && state.selectedStride !== null && state.selectedControl !== null;
  gameUI.submitAuditBtn.disabled = !isReady;
}

// Audit verification trigger
function verifyAuditReport() {
  if (state.isQuestionLocked) return;
  state.isQuestionLocked = true;

  const level = LEVELS[state.currentLevelIdx];
  const threat = level.threats[state.threatIndex];

  // Validation rules
  const nodeMatches = state.selectedNodeId === threat.targetNode;
  const strideMatches = state.selectedStride === threat.stride;
  const controlMatches = state.selectedControl === threat.mitigation;

  const isSuccess = nodeMatches && strideMatches && controlMatches;
  const elapsed = Math.floor((Date.now() - state.threatTimeStart) / 1000);

  if (isSuccess) {
    const pts = calculateScore(threat.points || 100, elapsed);
    state.score += pts;
    state.strideScores[threat.stride].correct++;
    
    // Highlight correct configurations
    gameUI.feedbackPanel.className = "feedback-panel correct";
    gameUI.feedbackTitle.textContent = "AUDIT ANALYSIS VERIFIED [OK]";
    gameUI.feedbackIcon.textContent = "✅";
  } else {
    state.lives--;
    gameUI.feedbackPanel.className = "feedback-panel incorrect";
    gameUI.feedbackTitle.textContent = "AUDIT FAILED - INTRUSION REPORTED [WARN]";
    gameUI.feedbackIcon.textContent = "⚠️";
  }

  // Generate detailed response message based on what was wrong
  let detailMsg = threat.explanation;
  if (!isSuccess) {
    let errors = [];
    if (!nodeMatches) errors.push(`Target Node should be ${threat.targetNode.toUpperCase()}`);
    if (!strideMatches) errors.push(`STRIDE category should be ${threat.stride}`);
    if (!controlMatches) errors.push(`Mitigation control should be "${threat.mitigation}"`);
    detailMsg = `Mismatch detected: ${errors.join(", ")}. <br><br> ${threat.explanation}`;
  }

  gameUI.feedbackText.innerHTML = detailMsg;
  gameUI.feedbackPanel.classList.remove("is-hidden");
  gameUI.scoreDisplay.textContent = state.score.toString().padStart(4, "0");
  updateLivesDisplay();

  if (state.lives <= 0) {
    gameUI.nextButton.textContent = "ABORT DIAGNOSTICS & VIEW REPORT [ENTER]";
  }
}

// Step to next scenario
function advanceGame() {
  if (state.lives <= 0) {
    endSimulation();
    return;
  }

  if (state.threatIndex < 2) {
    state.threatIndex++;
    loadThreatEvent();
  } else {
    // Level completed, go to next
    if (state.currentLevelIdx < 2) {
      state.currentLevelIdx++;
      state.threatIndex = 0;
      loadThreatEvent();
    } else {
      endSimulation();
    }
  }
}

// End simulation clocks and show reports
function endSimulation() {
  if (state.timerInterval) clearInterval(state.timerInterval);

  showScreen("result");

  const outcome = evaluateThreatOutcome(state.strideScores);

  resultUI.evalName.textContent = state.playerName.toUpperCase();
  resultUI.evalId.textContent = state.studentId;
  resultUI.evalBadge.textContent = outcome.badge;
  resultUI.evalTitle.textContent = outcome.title;
  resultUI.evalDesc.textContent = outcome.description;
  resultUI.evalScore.textContent = state.score.toString().padStart(4, "0");

  const minutes = Math.floor(state.timeElapsed / 60).toString().padStart(2, "0");
  const seconds = (state.timeElapsed % 60).toString().padStart(2, "0");
  resultUI.evalTime.textContent = `${minutes}:${seconds}`;

  // Stat rows updates
  const setBar = (vector, idVal, idBar, total) => {
    const correct = state.strideScores[vector].correct;
    document.getElementById(idVal).textContent = `${correct}/${total}`;
    document.getElementById(idBar).style.width = `${(correct / total) * 100}%`;
  };

  setBar("S", "stat-s-val", "stat-s-bar", 2);
  setBar("T", "stat-t-val", "stat-t-bar", 2);
  setBar("R", "stat-r-val", "stat-r-bar", 1);
  setBar("I", "stat-i-val", "stat-i-bar", 1);
  setBar("D", "stat-d-val", "stat-d-bar", 1);
  setBar("E", "stat-e-val", "stat-e-bar", 2);

  // Write high score cached
  const best = parseInt(localStorage.getItem("stride_best_score") || "0");
  if (state.score > best) {
    localStorage.setItem("stride_best_score", state.score);
    topbar.bestScore.textContent = state.score.toString().padStart(4, "0");
  }
}

// Keyboard hooks
function handleKeyDown(e) {
  const key = e.key;

  if (key === "Enter") {
    if (!screens.game.classList.contains("is-hidden")) {
      if (state.isQuestionLocked) {
        advanceGame();
      } else if (!gameUI.submitAuditBtn.disabled) {
        verifyAuditReport();
      }
    }
    return;
  }

  // STRIDE selections shortcuts mapping: keys [s, t, r, i, d, e] or [1-6]
  if (!screens.game.classList.contains("is-hidden") && !state.isQuestionLocked) {
    const keyLower = key.toLowerCase();
    if (["s", "t", "r", "i", "d", "e"].includes(keyLower)) {
      const btn = document.querySelector(`.stride-btn[data-stride="${keyLower.toUpperCase()}"]`);
      if (btn) btn.click();
    } else if (["1", "2", "3", "4"].includes(key)) {
      // Key mapping 1-4 for security control cards selections
      const optBtn = document.getElementById(`control-opt-${key}`);
      if (optBtn) optBtn.click();
    }
  }
}

// Open Certificate Modal
function openCertificate() {
  certUI.recipientName.textContent = state.playerName.toUpperCase();
  let idText = state.studentId !== "N/A" && state.studentId.length > 0 ? `Student ID: ${state.studentId}` : "";
  if (state.googleUserEmail) {
    idText += ` | Account: ${state.googleUserEmail}`;
  }
  certUI.recipientId.textContent = idText;

  const today = new Date().toISOString().split("T")[0];
  certUI.date.textContent = today;

  // Verify code hashing mock based on name, score, id, email, and date
  const rawHash = `${state.playerName}_${state.score}_${state.studentId}_${state.googleUserEmail || ""}_${today}_STRIDE`;
  let val = 0;
  for (let i = 0; i < rawHash.length; i++) {
    val = (val << 5) - val + rawHash.charCodeAt(i);
    val |= 0;
  }
  certUI.hash.textContent = `SHA256_${Math.abs(val).toString(16).toUpperCase()}_STRIDE_NU`;

  certUI.certModal.classList.remove("is-hidden");
}

function closeCertificate() {
  certUI.certModal.classList.add("is-hidden");
}
