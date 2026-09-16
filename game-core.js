/**
 * STRIDE-lite Threat Modeler - Core Logic & Scenarios Database
 * written in English for the CPE & IIE Programs at Naresuan University
 */

const LEVELS = [
  {
    id: 1,
    name: "Level 1: Student Project Portal",
    description: "Audit the basic web system where students submit project proposals and retrieve grading details.",
    nodes: [
      { id: "student", label: "Student", type: "entity", x: 80, y: 150, desc: "External Entity: Student browser or user client." },
      { id: "web_portal", label: "Web Portal", type: "process", x: 260, y: 150, desc: "Process: Main web server processing requests." },
      { id: "db", label: "Database", type: "store", x: 440, y: 80, desc: "Data Store: Database storing credentials and grades metadata." },
      { id: "file_storage", label: "File Storage", type: "store", x: 440, y: 220, desc: "Data Store: File storage for PDF proposal uploads." }
    ],
    flows: [
      { id: "flow_s_wp", from: "student", to: "web_portal", label: "HTTPS / HTTP Request" },
      { id: "flow_wp_db", from: "web_portal", to: "db", label: "SQL Queries" },
      { id: "flow_wp_fs", from: "web_portal", to: "file_storage", label: "File Upload / Retrieval" }
    ],
    boundaries: [
      { id: "boundary_1", label: "Internet Trust Boundary", type: "line", x1: 170, y1: 30, x2: 170, y2: 270 }
    ],
    threats: [
      {
        id: "T1",
        title: "Syllabus Tampering",
        description: "An unauthorized user bypasses the Web Portal application layer, logging directly into the file server, and modifies the 'grading_scheme.csv' file inside File Storage.",
        stride: "T", // Tampering
        targetNode: "file_storage",
        mitigation: "File Integrity Monitoring (FIM) & SHA-256 Hashing",
        controls: [
          "File Integrity Monitoring (FIM) & SHA-256 Hashing",
          "Prepared Statements / Parameterized SQL Queries",
          "HTTPS / TLS Transport Layer Network Encryption",
          "WAF Filtering Rules & Application Inspection"
        ],
        hint: "This threat involves the unauthorized modification of files at rest. Cryptographic hashing verifies if files have changed.",
        explanation: "Tampering represents unauthorized modifications of data. Applying cryptographic hash checksums (like SHA-256) and File Integrity Monitoring allows the system to detect changes instantly."
      },
      {
        id: "T2",
        title: "Credential Sniffing",
        description: "An attacker intercepts the raw student logins flowing over the network between the Student browser and the Web Portal.",
        stride: "I", // Information Disclosure
        targetNode: "student",
        mitigation: "HTTPS / TLS Network Transit Encryption",
        controls: [
          "HTTPS / TLS Network Transit Encryption",
          "Session ID Rotation & Salted Passwords",
          "Input Sanitization & Bounds Checking",
          "Multi-Factor Authentication (MFA) Check"
        ],
        hint: "This threat leaks confidential credentials over an unencrypted channel in transit.",
        explanation: "Information Disclosure represents data leakage to unauthorized eyes. Using HTTPS (TLS) encrypts data in transit, preventing network sniffers from reading sensitive credentials."
      },
      {
        id: "T3",
        title: "Administrative Privilege Bypass",
        description: "A guest user crafts an HTTP cookie parameter to the Web Portal, bypasses registration verification checks, and gains registrar administrative access.",
        stride: "E", // Elevation of Privilege
        targetNode: "web_portal",
        mitigation: "Server-side Access Validation & RBAC",
        controls: [
          "Server-side Access Validation & RBAC",
          "Strict Rate Limiting & Captcha Check",
          "Audit Trail Logs & Cryptographic Signatures",
          "Symmetric AES Database Encryption"
        ],
        hint: "The threat event represents a user obtaining a higher access tier (admin privileges) than allowed.",
        explanation: "Elevation of Privilege occurs when an attacker obtains more rights than authorized. To prevent this, role-Based Access Control (RBAC) must be enforced on the server-side, never trusting client parameters."
      }
    ]
  },
  {
    id: 2,
    name: "Level 2: E-Tuition Payment System",
    description: "Audit the university payment workflow, integrating student tuition records and external banking endpoints.",
    nodes: [
      { id: "student", label: "Student", type: "entity", x: 80, y: 150, desc: "External Entity: Student browser or client device." },
      { id: "payment_gateway", label: "Payment Gateway", type: "process", x: 260, y: 150, desc: "Process: Core application handling payment handshakes." },
      { id: "bank_api", label: "Bank API", type: "entity", x: 440, y: 80, desc: "External Entity: Third party banking webhook api endpoint." },
      { id: "audit_logs", label: "Audit Logs", type: "store", x: 440, y: 220, desc: "Data Store: Append-only transaction audit logging vault." }
    ],
    flows: [
      { id: "flow_s_pg", from: "student", to: "payment_gateway", label: "Payment Requests" },
      { id: "flow_pg_b", from: "payment_gateway", to: "bank_api", label: "API Callback Checks" },
      { id: "flow_pg_al", from: "payment_gateway", to: "audit_logs", label: "Audit Log writes" }
    ],
    boundaries: [
      { id: "boundary_1", label: "Campus Perimeter Boundary", type: "line", x1: 170, y1: 30, x2: 170, y2: 270 },
      { id: "boundary_2", label: "Third-Party Banking Boundary", type: "line", x1: 370, y1: 30, x2: 370, y2: 140 }
    ],
    threats: [
      {
        id: "T4",
        title: "Bank API Spoofing",
        description: "An attacker intercepts banking routes and sets up a mock server, sending forged successful transaction callbacks to the Payment Gateway to acquire free credits.",
        stride: "S", // Spoofing
        targetNode: "bank_api",
        mitigation: "API Token Signatures & TLS Mutual Auth",
        controls: [
          "API Token Signatures & TLS Mutual Auth",
          "Automated DB Backups & Offsite Vaults",
          "Audit Trail Logs with SHA-256 Hashing",
          "Web Application Firewall Filtering Rules"
        ],
        hint: "The threat represents an entity pretending to be someone else (the genuine Bank API) to establish fake trust.",
        explanation: "Spoofing represents acting as a fake identity. Securing machine-to-machine APIs requires mutual authentication (mTLS) and cryptographically signed headers/tokens to verify origin validity."
      },
      {
        id: "T5",
        title: "Transaction Repudiation",
        description: "A student performs a payment transfer but later disputes it, claiming the request was never made. The payment system lacks protected audit evidence to support investigation of the recorded action.",
        stride: "R", // Repudiation
        targetNode: "audit_logs",
        mitigation: "Cryptographically Protected Audit Logging",
        controls: [
          "Cryptographically Protected Audit Logging",
          "AES-256 Symmetric Database Row Encryption",
          "Strict Input Validation & Escaping Filters",
          "Mutual TLS Network Transport Verification"
        ],
        hint: "This threat involves a user denying an action because the system lacks protected evidence to assess the disputed record.",
        explanation: "Repudiation represents denying actions. Protected, tamper-evident audit records can strengthen evidence linking a recorded action to an account or service and a time when identity binding, key custody, record integrity, clocks, and policy evidence are adequate. They do not alone prove that a specific human acted or establish non-repudiation in every setting."
      },
      {
        id: "T6",
        title: "Tuition DDoS Attack",
        description: "An attacker employs a malicious botnet to flood the Payment Gateway with millions of invalid requests, crashing the portal during tuition deadlines.",
        stride: "D", // Denial of Service
        targetNode: "payment_gateway",
        mitigation: "Rate Limiting, Load Balancer & WAF",
        controls: [
          "Rate Limiting, Load Balancer & WAF",
          "Format Preserving Encryption & Masking",
          "Asymmetric Private Key Digital Signature",
          "Server-side AES-256 Database Encryption"
        ],
        hint: "This threat aims to exhaust CPU/Network capacity, making the service unavailable for legitimate students.",
        explanation: "Denial of Service (DoS) aims to block system availability. Mitigation involves rate limiting, deploying load balancers to share capacity, and configuring Web Application Firewalls (WAF)."
      }
    ]
  },
  {
    id: 3,
    name: "Level 3: Campus Active Directory & SSO",
    description: "Audit the central identity system managing single sign-on authentication and access tokens for campus-wide services.",
    nodes: [
      { id: "user", label: "User Client", type: "entity", x: 80, y: 150, desc: "External Entity: Student/Staff requesting central authentication." },
      { id: "sso_authenticator", label: "SSO Authenticator", type: "process", x: 260, y: 150, desc: "Process: Verification engine parsing credentials and signing tokens." },
      { id: "token_store", label: "Session State Store", type: "store", x: 440, y: 80, desc: "Data Store: Server-side session state and token-validation evidence." },
      { id: "campus_service", label: "Campus Service", type: "process", x: 440, y: 220, desc: "Process: Secondary resource server (e.g. HR console, Exam server) relying on SSO tokens." }
    ],
    flows: [
      { id: "flow_u_sso", from: "user", to: "sso_authenticator", label: "Login Credentials" },
      { id: "flow_sso_ts", from: "sso_authenticator", to: "token_store", label: "Session-State Storage / Validation" },
      { id: "flow_sso_cs", from: "sso_authenticator", to: "campus_service", label: "Redirect with JWT Token" }
    ],
    boundaries: [
      { id: "boundary_1", label: "SSO Authentication Trust Boundary", type: "line", x1: 190, y1: 30, x2: 190, y2: 270 }
    ],
    threats: [
      {
        id: "T7",
        title: "Session Token Hijacking",
        description: "An attacker intercepts a victim's active SSO session token and replays it to the Authenticator to gain access to their account.",
        stride: "S", // Spoofing / Session Spoofing
        targetNode: "user",
        mitigation: "MFA & Token Expiration / Binding",
        controls: [
          "MFA & Token Expiration / Binding",
          "SHA-256 File Hash Checksums",
          "SQL Query Parameterization",
          "SSO Portal Rate Limiting"
        ],
        hint: "This threat involves an attacker masquerading as an authenticated student using stolen cookies or tokens.",
        explanation: "Spoofing identity via session hijacking is mitigated by enforcing short token expirations, binding tokens to client IP fingerprint attributes, and requiring Multi-Factor Authentication (MFA) for key resource access."
      },
      {
        id: "T8",
        title: "Active Token Tampering",
        description: "An attacker gains internal write access to the server-side session-state store and injects fake active administrator session data.",
        stride: "T", // Tampering
        targetNode: "token_store",
        mitigation: "Least-Privilege Session-Store Write Access & Server-side Validation",
        controls: [
          "Least-Privilege Session-Store Write Access & Server-side Validation",
          "Mutual TLS Cryptographic Authentication",
          "Application Layer WAF Protection Rules",
          "Scrubbing Center BGP Anycast Routing"
        ],
        hint: "This threat represents the modification of active data stores, inserting unauthorized records.",
        explanation: "Tampering with session state is addressed by restricting and auditing writes, using least-privileged service accounts, and validating session or token evidence at the server. Encryption at rest can reduce disclosure from storage theft, but it does not stop a writer from altering state or forging session data."
      },
      {
        id: "T9",
        title: "SSO Buffer Overflow",
        description: "A malicious student sends a crafted, oversized payload input to the SSO Authenticator process, causing it to crash and execute malicious code with root-level OS permissions.",
        stride: "E", // Elevation of Privilege
        targetNode: "sso_authenticator",
        mitigation: "Input Bounds Verification & Memory-Safe Coding",
        controls: [
          "Input Bounds Verification & Memory-Safe Coding",
          "Server-side AES-256 Database Encryption",
          "PKI Asymmetric Digital Signature Keys",
          "Offline Cryptographic Database Backups"
        ],
        hint: "This threat represents exploiting software bugs to elevate an unauthenticated guest to full system administrative shell execution.",
        explanation: "Elevation of Privilege (EoP) via buffer overflows is prevented by enforcing strict bounds validation on input string lengths, using memory-safe programming languages, and running processes with low-privileged service accounts."
      }
    ]
  }
];

// Chapter 2 reasoning checkpoints. These are deliberately separate from the
// DFD audit rounds: the chapter introduces several complementary lenses, and
// none of the later chapters is a prerequisite for answering them.
const CHAPTER_TWO_CHECKPOINTS = [
  {
    id: "C2-1",
    mlo: "MLO2.1",
    title: "Attack surface and attacker-model scope",
    type: "scope-builder",
    prompt: "Use the system context to construct a scoped note. Select one card in every field to inventory the attack surface, bound a hypothetical attacker model, distinguish those from a vulnerability or allegation, and state what evidence or constraint remains to check.",
    diagram: {
      title: "System context",
      layout: "context-cards",
      summary: "The synthetic Student Project Portal accepts project uploads, uses an email-provider dependency, and gives instructor accounts access to grading-related functions.",
      nodes: ["Student browser", "Project-upload API", "Email-provider dependency", "Instructor account portal"]
    },
    parts: [
      {
        id: "attack-surface",
        label: "1. Attack-surface inventory",
        options: [
          { id: "interaction-points", text: "Group the file-upload interface as an exposed application/API surface, the email provider as an external dependency, and instructor accounts as an identity/authorization surface to investigate." },
          { id: "confirmed-vulnerabilities", text: "List only components that are already confirmed vulnerabilities." },
          { id: "proved-compromise", text: "Treat every system flow as proof that a compromise occurred." },
          { id: "real-identity", text: "Identify a real person who must be responsible for every component." }
        ]
      },
      {
        id: "attacker-model",
        label: "2. Bounded attacker model",
        options: [
          { id: "bounded-hypothesis", text: "Describe a hypothetical actor's stated starting access, limits, and assumptions; do not attribute actions to a real person." },
          { id: "certain-actor", text: "Name the person who definitely intends to misuse the portal." },
          { id: "unlimited-access", text: "Assume the actor already has every privilege, without recording limits." },
          { id: "no-assumptions", text: "Omit assumptions because an attacker model proves a vulnerability by itself." }
        ]
      },
      {
        id: "claim-boundary",
        label: "3. Vulnerability or allegation boundary",
        options: [
          { id: "conditional-question", text: "Record a conditional question about a control or exposure; the inventory and model do not confirm a vulnerability, incident, or allegation." },
          { id: "component-is-vulnerability", text: "Call each listed component a confirmed vulnerability." },
          { id: "model-proves-allegation", text: "Use the hypothetical model as proof that a named person caused an incident." },
          { id: "flow-is-evidence", text: "Treat a normal component flow as sufficient evidence of malicious intent." }
        ]
      },
      {
        id: "evidence-constraint",
        label: "4. Evidence or constraint still needed",
        options: [
          { id: "check-controls-and-scope", text: "Check upload validation, dependency integration/configuration, account role policy, and relevant records; note the missing evidence and scope limits." },
          { id: "skip-evidence", text: "Skip system evidence because the model and inventory already establish the conclusion." },
          { id: "public-accusation", text: "Publish an allegation before checking the component configuration or records." },
          { id: "unbounded-conclusion", text: "State that every interaction point has the same risk without considering controls or constraints." }
        ]
      }
    ],
    correctParts: {
      "attack-surface": "interaction-points",
      "attacker-model": "bounded-hypothesis",
      "claim-boundary": "conditional-question",
      "evidence-constraint": "check-controls-and-scope"
    },
    feedback: {
      correct: "Correct. The scoped note groups exposed surfaces, bounds a hypothetical actor, separates those from a vulnerability or allegation, and identifies evidence still needed. Neither the inventory nor the model alone proves a weakness, an event, or a person's intent.",
      incorrect: "Revisit the distinctions: an interaction point is not automatically a vulnerability, an attacker model records bounded assumptions rather than a real identity, and the next step is to check relevant controls and evidence."
    }
  },
  {
    id: "C2-2",
    mlo: "MLO2.2",
    title: "STRIDE threat scenario",
    type: "scenario-builder",
    prompt: "Use the component diagram to construct a cautious STRIDE scenario. Select one card in every field so that the scenario names the system element, STRIDE category, conditional effect, and evidence still needed.",
    diagram: {
      title: "Component diagram source",
      summary: "A grading-related notification moves from a grade record through the Portal notification service to a course recipient group.",
      nodes: ["Grade record", "Portal notification service", "Course recipient group"]
    },
    parts: [
      {
        id: "element",
        label: "1. System element",
        options: [
          { id: "notification-service", text: "Portal notification service" },
          { id: "student-browser", text: "Student browser" },
          { id: "grade-database", text: "Grade database" },
          { id: "bank-api", text: "External bank API" }
        ]
      },
      {
        id: "stride",
        label: "2. STRIDE category",
        options: [
          { id: "information-disclosure", text: "Information Disclosure" },
          { id: "spoofing", text: "Spoofing" },
          { id: "denial-of-service", text: "Denial of Service" },
          { id: "repudiation", text: "Repudiation" }
        ]
      },
      {
        id: "condition-effect",
        label: "3. Conditional effect",
        options: [
          { id: "broad-recipients", text: "If the recipient policy or grouping is broader than needed, grading-related information could appear to unrelated people." },
          { id: "confirmed-impersonation", text: "The service definitely impersonated a student." },
          { id: "dependency-unavailable", text: "Every external dependency is unavailable by definition." },
          { id: "proven-improper-message", text: "The observation proves an instructor already sent an improper message." }
        ]
      },
      {
        id: "evidence",
        label: "4. Evidence still needed",
        options: [
          { id: "check-policy", text: "Check the recipient policy, recipient list, and message content." },
          { id: "no-further-evidence", text: "No further evidence is needed because the event is already proved." },
          { id: "attribute-person", text: "Identify the individual responsible before checking the system evidence." },
          { id: "assume-impact", text: "Assume the highest impact without checking the recipient scope." }
        ]
      }
    ],
    correctParts: {
      element: "notification-service",
      stride: "information-disclosure",
      "condition-effect": "broad-recipients",
      evidence: "check-policy"
    },
    feedback: {
      correct: "Correct. The constructed scenario names an element, a conditional confidentiality effect, and the evidence still needed. STRIDE is a question framework, not proof that an incident occurred.",
      incorrect: "A useful STRIDE scenario connects an element or data flow, a condition, a possible effect on an asset, and an uncertainty to check. It should not turn an initial observation into a confirmed incident."
    }
  },
  {
    id: "C2-3",
    mlo: "MLO2.3",
    title: "Cyber Kill Chain as a conceptual sequence",
    prompt: "A synthetic narrative contains a message claiming to be Portal support, credentials entered by a user, a recorded account-use attempt, and a broad file-list request. What is the best conceptual Cyber Kill Chain reading?",
    options: [
      {
        id: "A",
        text: "The narrative proves a complete attack and identifies the actor's intent."
      },
      {
        id: "B",
        text: "One control, such as an audit log, necessarily stops every stage of the narrative."
      },
      {
        id: "C",
        text: "Read the observations as a broad sequence, ask where identity verification could interrupt account use, and ask where account and authorization records could support later analysis; neither point proves the whole story."
      },
      {
        id: "D",
        text: "ATT&CK requires every event to follow one fixed Kill Chain sequence."
      }
    ],
    correctOption: "C",
    feedback: {
      correct: "Correct. The Kill Chain is a broad temporal lens for finding possible interruption, detection, and impact-limiting points. A control has a bounded role and the observations still require context.",
      incorrect: "Use the Kill Chain to reason about a broad sequence and possible points to interrupt or observe it. It is not proof of an attack, a fixed script for every event, or a guarantee that one control stops all stages."
    }
  },
  {
    id: "C2-4",
    mlo: "MLO2.4",
    title: "MITRE ATT&CK tactic reasoning",
    prompt: "An account makes requests to list many student documents it can access. Which high-level ATT&CK tactic is a defensible conditional label for the observation?",
    options: [
      {
        id: "A",
        text: "Credential Access, because any account request proves credentials were obtained improperly."
      },
      {
        id: "B",
        text: "Discovery may be relevant, because the question concerns learning what resources are available; the observation alone does not establish intent, a technique, or a malicious actor."
      },
      {
        id: "C",
        text: "Impact, because listing documents necessarily changed or damaged them."
      },
      {
        id: "D",
        text: "Technique, because tactic and technique are the same level of description."
      }
    ],
    correctOption: "B",
    feedback: {
      correct: "Correct. A tactic names a high-level goal (here, potentially learning available resources); a technique would describe how. One observation does not establish intent, identity, or a technique without more context.",
      incorrect: "Keep the levels distinct: a tactic is the possible high-level goal, while a technique is how it might be pursued. An observation is not, by itself, proof of intent, identity, or a technique."
    }
  },
  {
    id: "C2-5",
    mlo: "MLO2.5",
    title: "Qualitative risk prioritization",
    prompt: "Scenario A is a renamed public announcement file on an ordinary day with another communication channel. Scenario B is a grade-change role whose access may be broader than needed; role policy, approvals, and logs are not yet known. Which provisional priority is best supported?",
    options: [
      {
        id: "A",
        text: "Always prioritize A, because any public-file change has maximum likelihood and impact."
      },
      {
        id: "B",
        text: "Prioritize B provisionally: its impact could be high for grade integrity, while likelihood remains conditional; verify the role matrix, approvals, and records, and revisit A if a key date or no fallback channel changes its impact."
      },
      {
        id: "C",
        text: "Treat both as confirmed incidents, so qualitative likelihood and impact are unnecessary."
      },
      {
        id: "D",
        text: "Assign precise numerical probabilities without documenting assumptions, because numbers remove uncertainty."
      }
    ],
    correctOption: "B",
    feedback: {
      correct: "Correct. Qualitative prioritization connects likelihood and impact to known conditions, records uncertainty, and can change when evidence such as approvals, role limits, or fallback channels changes.",
      incorrect: "A qualitative priority is provisional and reasoned: state the conditions behind likelihood and impact, name what is unknown, and identify evidence that could change the order."
    }
  }
];

function evaluateThreatOutcome(scores) {
  const correct = scores.S.correct + scores.T.correct + scores.R.correct + scores.I.correct + scores.D.correct + scores.E.correct;
  const total = scores.S.total + scores.T.total + scores.R.total + scores.I.total + scores.D.total + scores.E.total;
  const accuracy = total > 0 ? (correct / total) * 100 : 0;

  let title = "Practice band: below 45%";
  let badge = "🔍";
  let description = "This local practice set identifies concepts to revisit; it does not certify threat-modeling competence.";

  if (accuracy >= 90) {
    title = "Practice band: 90–100%";
    badge = "🏆";
    description = "High accuracy in this local practice set; it does not certify threat-modeling competence or secure a real boundary.";
  } else if (accuracy >= 70) {
    title = "Practice band: 70–89%";
    badge = "🛡️";
    description = "Strong local-practice performance; revisit the scenario assumptions and evidence limits before applying concepts elsewhere.";
  } else if (accuracy >= 45) {
    title = "Practice band: 45–69%";
    badge = "💻";
    description = "This practice set shows a developing grasp; revisit DFD nodes and the difference between Spoofing and Elevation of Privilege.";
  }

  return {
    accuracy,
    title,
    badge,
    description
  };
}

function evaluateCheckpointOutcome(scores) {
  const total = scores.total || 0;
  const correct = scores.correct || 0;
  const accuracy = total > 0 ? (correct / total) * 100 : 0;

  let title = "Revisit the Chapter 2 reasoning checkpoints";
  let badge = "🔍";
  let description = "Use the feedback to revisit the distinction between observations, assumptions, possible effects, and evidence still needed.";

  if (accuracy === 100) {
    title = "All Chapter 2 reasoning checkpoints correct";
    badge = "🏆";
    description = "This local result shows accurate answers in this practice set; it does not certify threat-modeling competence or secure a real system.";
  } else if (accuracy >= 60) {
    title = "Chapter 2 reasoning is developing";
    badge = "📘";
    description = "Review the feedback for the missed checkpoint before applying the concepts to a different system or evidence set.";
  }

  return {
    accuracy,
    title,
    badge,
    description
  };
}

function isCheckpointResponseCorrect(checkpoint, response) {
  if (!checkpoint || response === null || response === undefined) return false;

  if (Array.isArray(checkpoint.parts) && checkpoint.correctParts) {
    return checkpoint.parts.every((part) => response[part.id] === checkpoint.correctParts[part.id]);
  }

  return response === checkpoint.correctOption;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    LEVELS,
    CHAPTER_TWO_CHECKPOINTS,
    evaluateThreatOutcome,
    evaluateCheckpointOutcome,
    isCheckpointResponseCorrect
  };
}
