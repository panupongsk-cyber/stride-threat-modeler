/**
 * STRIDE-lite Threat Modeler - Application logic & SVG Engine controller
 */

// State Control
let state = {
  playerName: "GUEST",
  studentId: "N/A",
  currentLevelIdx: 0,
  threatIndex: 0,
  score: 0,
  lives: 3,
  strideScores: {
    S: { correct: 0, total: 2 },
    T: { correct: 0, total: 2 },
    R: { correct: 0, total: 1 },
    I: { correct: 0, total: 1 },
    D: { correct: 0, total: 1 },
    E: { correct: 0, total: 2 }
  },
  checkpointIndex: 0,
  checkpointScores: { correct: 0, total: 0 },
  selectedCheckpointOption: null,
  selectedCheckpointParts: {},
  checkpointLocked: false,
  didRunDfdAudit: false,
  selectedNodeId: null,
  selectedStride: null,
  selectedControl: null,
  isQuestionLocked: false
};

// Format summary dates from the browser's local calendar, not a UTC timestamp.
function formatLocalSummaryDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// DOM References
const screens = {
  start: document.getElementById("start-screen"),
  brief: document.getElementById("brief-screen"),
  game: document.getElementById("game-screen"),
  checkpoint: document.getElementById("checkpoint-screen"),
  result: document.getElementById("result-screen")
};

const topbar = {
  playerDisplayName: document.getElementById("player-display-name"),
  playerBadge: document.getElementById("player-badge"),
  bestScore: document.getElementById("best-score")
};

const scanlineToggleBtn = document.getElementById("scanline-toggle-btn");

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

const checkpointUI = {
  mlo: document.getElementById("checkpoint-mlo"),
  progress: document.getElementById("checkpoint-progress"),
  title: document.getElementById("checkpoint-title"),
  prompt: document.getElementById("checkpoint-prompt"),
  options: document.getElementById("checkpoint-options"),
  score: document.getElementById("checkpoint-score"),
  submitButton: document.getElementById("submit-checkpoint-btn"),
  feedbackPanel: document.getElementById("checkpoint-feedback"),
  feedbackIcon: document.getElementById("checkpoint-feedback-icon"),
  feedbackTitle: document.getElementById("checkpoint-feedback-title"),
  feedbackText: document.getElementById("checkpoint-feedback-text"),
  nextButton: document.getElementById("next-checkpoint-btn")
};

const resultUI = {
  evalName: document.getElementById("eval-name"),
  evalId: document.getElementById("eval-id"),
  evalBadge: document.getElementById("eval-badge"),
  evalTitle: document.getElementById("eval-title"),
  evalDesc: document.getElementById("eval-desc"),
  evalScore: document.getElementById("eval-score"),
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
  statEBar: document.getElementById("stat-e-bar"),
  dfdAuditSummary: document.getElementById("dfd-audit-summary")
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

  // Form submit
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    initializeGame();
  });

  document.getElementById("start-checkpoints-btn").addEventListener("click", initializeChapterTwoPractice);

  // Next button click
  gameUI.nextButton.addEventListener("click", () => {
    advanceGame();
  });

  // Chapter 2 reasoning checkpoint controls
  checkpointUI.submitButton.addEventListener("click", verifyChapterTwoCheckpoint);
  checkpointUI.nextButton.addEventListener("click", advanceChapterTwoCheckpoint);

  // Brief screen: begin audit button
  document.getElementById("start-game-btn").addEventListener("click", initializeGame);

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

// Reset state values shared by the independent Chapter 2 checkpoint route and
// the optional legacy DFD audit route.
function initializePracticeSession(didRunDfdAudit) {
  const nameEl = document.getElementById("player-name");
  const idEl = document.getElementById("student-id");
  if (nameEl) state.playerName = nameEl.value.trim() || "ANALYST";
  if (idEl) state.studentId = idEl.value.trim() || "N/A";
  state.currentLevelIdx = 0;
  state.threatIndex = 0;
  state.score = 0;
  state.lives = 3;
  state.strideScores = {
    S: { correct: 0, total: 2 },
    T: { correct: 0, total: 2 },
    R: { correct: 0, total: 1 },
    I: { correct: 0, total: 1 },
    D: { correct: 0, total: 1 },
    E: { correct: 0, total: 2 }
  };
  state.checkpointIndex = 0;
  state.checkpointScores = { correct: 0, total: CHAPTER_TWO_CHECKPOINTS.length };
  state.selectedCheckpointOption = null;
  state.selectedCheckpointParts = {};
  state.checkpointLocked = false;
  state.didRunDfdAudit = didRunDfdAudit;
  state.isQuestionLocked = false;
  gameUI.nextButton.textContent = "LOAD NEXT INCIDENT [ENTER]";

  topbar.playerDisplayName.textContent = state.playerName.toUpperCase();
  topbar.playerBadge.classList.remove("is-hidden");

}

// Preserve the original DFD experience as an optional extension.
function initializeGame() {
  initializePracticeSession(true);
  showScreen("game");
  loadThreatEvent();
}

// Chapter 2 outcomes can be practiced without completing the later DFD audit.
function initializeChapterTwoPractice() {
  initializePracticeSession(false);
  startChapterTwoCheckpoints();
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

  if (isSuccess) {
    const pts = threat.points || 100;
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
    gameUI.nextButton.textContent = "CONTINUE TO CHAPTER 2 CHECKPOINTS [ENTER]";
  }
}

// Step to next scenario
function advanceGame() {
  if (state.lives <= 0) {
    startChapterTwoCheckpoints();
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
      startChapterTwoCheckpoints();
    }
  }
}

// Keep Chapter 2's complementary frameworks as separately scored formative
// checkpoints rather than treating them as prerequisites for a later topic.
function startChapterTwoCheckpoints() {
  state.checkpointIndex = 0;
  state.selectedCheckpointOption = null;
  state.selectedCheckpointParts = {};
  state.checkpointLocked = false;
  state.checkpointScores = { correct: 0, total: CHAPTER_TWO_CHECKPOINTS.length };
  showScreen("checkpoint");
  loadChapterTwoCheckpoint();
}

function loadChapterTwoCheckpoint() {
  const checkpoint = CHAPTER_TWO_CHECKPOINTS[state.checkpointIndex];
  state.selectedCheckpointOption = null;
  state.selectedCheckpointParts = {};
  state.checkpointLocked = false;

  checkpointUI.mlo.textContent = checkpoint.mlo;
  checkpointUI.progress.textContent = `CHECKPOINT ${state.checkpointIndex + 1} OF ${CHAPTER_TWO_CHECKPOINTS.length}`;
  checkpointUI.title.textContent = checkpoint.title;
  checkpointUI.prompt.textContent = checkpoint.prompt;
  checkpointUI.score.textContent = `CHECKPOINT SCORE: ${state.checkpointScores.correct}/${state.checkpointScores.total}`;
  checkpointUI.submitButton.disabled = true;
  checkpointUI.nextButton.textContent = state.checkpointIndex === CHAPTER_TWO_CHECKPOINTS.length - 1
    ? "VIEW PRACTICE RESULT [ENTER]"
    : "LOAD NEXT CHECKPOINT [ENTER]";
  checkpointUI.feedbackPanel.className = "checkpoint-feedback is-hidden";
  checkpointUI.options.classList.remove("checkpoint-builder");
  checkpointUI.options.innerHTML = "";

  if (Array.isArray(checkpoint.parts)) {
    renderStructuredBuilder(checkpoint);
    return;
  }

  checkpoint.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.id = `checkpoint-option-${index + 1}`;
    button.className = "checkpoint-option";
    button.dataset.optionId = option.id;
    button.textContent = `${index + 1}. ${option.text}`;
    button.addEventListener("click", () => {
      if (state.checkpointLocked) return;
      checkpointUI.options.querySelectorAll(".checkpoint-option").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      state.selectedCheckpointOption = option.id;
      checkpointUI.submitButton.disabled = false;
    });
    checkpointUI.options.appendChild(button);
  });
}

function renderStructuredBuilder(checkpoint) {
  checkpointUI.options.classList.add("checkpoint-builder");

  if (checkpoint.diagram) {
    const diagram = document.createElement("div");
    diagram.className = "checkpoint-component-diagram";
    diagram.setAttribute("role", "img");
    diagram.setAttribute("aria-label", checkpoint.diagram.summary);

    const title = document.createElement("p");
    title.className = "checkpoint-component-diagram-title";
    title.textContent = checkpoint.diagram.title;
    diagram.appendChild(title);

    const summary = document.createElement("p");
    summary.className = "checkpoint-component-diagram-summary";
    summary.textContent = checkpoint.diagram.summary;
    diagram.appendChild(summary);

    const flow = document.createElement("div");
    const isContextOnly = checkpoint.diagram.layout === "context-cards";
    flow.className = isContextOnly
      ? "checkpoint-component-flow checkpoint-component-context"
      : "checkpoint-component-flow";
    checkpoint.diagram.nodes.forEach((node, index) => {
      const nodeLabel = document.createElement("span");
      nodeLabel.className = "checkpoint-component-node";
      nodeLabel.textContent = node;
      flow.appendChild(nodeLabel);

      if (!isContextOnly && index < checkpoint.diagram.nodes.length - 1) {
        const arrow = document.createElement("span");
        arrow.className = "checkpoint-component-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        flow.appendChild(arrow);
      }
    });
    diagram.appendChild(flow);
    checkpointUI.options.appendChild(diagram);
  }

  checkpoint.parts.forEach((part) => {
    const group = document.createElement("fieldset");
    group.className = "checkpoint-builder-group";

    const legend = document.createElement("legend");
    legend.className = "checkpoint-builder-label";
    legend.textContent = part.label;
    group.appendChild(legend);

    const choices = document.createElement("div");
    choices.className = "checkpoint-builder-options";
    choices.setAttribute("aria-label", part.label);

    part.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "checkpoint-option checkpoint-builder-option";
      button.dataset.partId = part.id;
      button.dataset.optionId = option.id;
      button.setAttribute("aria-pressed", "false");
      button.textContent = option.text;
      button.addEventListener("click", () => {
        if (state.checkpointLocked) return;

        choices.querySelectorAll(".checkpoint-builder-option").forEach((item) => {
          item.classList.remove("selected");
          item.setAttribute("aria-pressed", "false");
        });
        button.classList.add("selected");
        button.setAttribute("aria-pressed", "true");
        state.selectedCheckpointParts[part.id] = option.id;
        checkpointUI.submitButton.disabled = !checkpoint.parts.every((requiredPart) => (
          state.selectedCheckpointParts[requiredPart.id]
        ));
      });
      choices.appendChild(button);
    });

    group.appendChild(choices);
    checkpointUI.options.appendChild(group);
  });
}

function verifyChapterTwoCheckpoint() {
  const checkpoint = CHAPTER_TWO_CHECKPOINTS[state.checkpointIndex];
  const isStructuredCheckpoint = Array.isArray(checkpoint.parts);
  const response = isStructuredCheckpoint
    ? state.selectedCheckpointParts
    : state.selectedCheckpointOption;
  const hasResponse = isStructuredCheckpoint
    ? checkpoint.parts.every((part) => response[part.id])
    : response !== null;
  if (state.checkpointLocked || !hasResponse) return;

  const isCorrect = isCheckpointResponseCorrect(checkpoint, response);
  state.checkpointLocked = true;
  checkpointUI.submitButton.disabled = true;
  checkpointUI.options.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });

  if (isCorrect) {
    state.checkpointScores.correct++;
    state.score += checkpoint.points || 100;
    checkpointUI.feedbackPanel.className = "checkpoint-feedback correct";
    checkpointUI.feedbackIcon.textContent = "✅";
    checkpointUI.feedbackTitle.textContent = "REASONING CHECK VERIFIED [OK]";
    checkpointUI.feedbackText.textContent = checkpoint.feedback.correct;
  } else {
    checkpointUI.feedbackPanel.className = "checkpoint-feedback incorrect";
    checkpointUI.feedbackIcon.textContent = "↻";
    checkpointUI.feedbackTitle.textContent = "REVIEW THE REASONING [RETRY NEXT]";
    checkpointUI.feedbackText.textContent = checkpoint.feedback.incorrect;
  }

  checkpointUI.score.textContent = `CHECKPOINT SCORE: ${state.checkpointScores.correct}/${state.checkpointScores.total}`;
}

function advanceChapterTwoCheckpoint() {
  if (!state.checkpointLocked) return;

  if (state.checkpointIndex < CHAPTER_TWO_CHECKPOINTS.length - 1) {
    state.checkpointIndex++;
    loadChapterTwoCheckpoint();
  } else {
    endSimulation();
  }
}

// End simulation and show reports.
function endSimulation() {
  showScreen("result");

  const dfdOutcome = evaluateThreatOutcome(state.strideScores);
  const checkpointOutcome = evaluateCheckpointOutcome(state.checkpointScores);

  resultUI.evalName.textContent = state.playerName.toUpperCase();
  resultUI.evalId.textContent = state.studentId;
  resultUI.evalBadge.textContent = checkpointOutcome.badge;
  resultUI.evalTitle.textContent = checkpointOutcome.title;
  resultUI.evalDesc.textContent = checkpointOutcome.description;
  resultUI.evalScore.textContent = `${state.checkpointScores.correct}/${state.checkpointScores.total}`;

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
  resultUI.dfdAuditSummary.textContent = state.didRunDfdAudit
    ? `${dfdOutcome.title}. ${dfdOutcome.description}`
    : "Not attempted in this session. This optional DFD audit extension is not part of the Chapter 2 checkpoint outcome.";

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

  if (!screens.checkpoint.classList.contains("is-hidden")) {
    if (key === "Enter") {
      if (state.checkpointLocked) {
        advanceChapterTwoCheckpoint();
      } else if (!checkpointUI.submitButton.disabled) {
        verifyChapterTwoCheckpoint();
      }
      return;
    }

    if (!state.checkpointLocked && ["1", "2", "3", "4"].includes(key)) {
      const optionButton = document.getElementById(`checkpoint-option-${key}`);
      if (optionButton) optionButton.click();
    }
    return;
  }

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

// Open local practice-summary modal
function openCertificate() {
  certUI.recipientName.textContent = state.playerName.toUpperCase();
  const idText = state.studentId !== "N/A" && state.studentId.length > 0 ? `Student ID: ${state.studentId}` : "";
  certUI.recipientId.textContent = idText;

  const today = formatLocalSummaryDate();
  certUI.date.textContent = today;

  certUI.hash.textContent = "BROWSER-GENERATED — NOT VERIFIABLE";

  certUI.certModal.classList.remove("is-hidden");
}

function closeCertificate() {
  certUI.certModal.classList.add("is-hidden");
}
