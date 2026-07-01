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
        description: "A student performs a payment transfer but later disputes it, claiming the request was never made. The payment system has no non-repudiation audit trails logged.",
        stride: "R", // Repudiation
        targetNode: "audit_logs",
        mitigation: "Cryptographically Signed Audit Logging",
        controls: [
          "Cryptographically Signed Audit Logging",
          "AES-256 Symmetric Database Row Encryption",
          "Strict Input Validation & Escaping Filters",
          "Mutual TLS Network Transport Verification"
        ],
        hint: "This threat involves a user denying an action they performed because the system has no secure evidence to prove otherwise.",
        explanation: "Repudiation represents denying actions. This is mitigated by writing system records to cryptographically signed, immutable logs, proving exactly when and who initiated transactions."
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
      { id: "token_store", label: "Token Store", type: "store", x: 440, y: 80, desc: "Data Store: Active session keys memory database." },
      { id: "campus_service", label: "Campus Service", type: "process", x: 440, y: 220, desc: "Process: Secondary resource server (e.g. HR console, Exam server) relying on SSO tokens." }
    ],
    flows: [
      { id: "flow_u_sso", from: "user", to: "sso_authenticator", label: "Login Credentials" },
      { id: "flow_sso_ts", from: "sso_authenticator", to: "token_store", label: "Token Storage / Verification" },
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
        description: "An attacker gains internal write access to the Token Store memory database and injects fake active administrator session keys directly into memory.",
        stride: "T", // Tampering
        targetNode: "token_store",
        mitigation: "Secure Database Config & Prepared Queries",
        controls: [
          "Secure Database Config & Prepared Queries",
          "Mutual TLS Cryptographic Authentication",
          "Application Layer WAF Protection Rules",
          "Scrubbing Center BGP Anycast Routing"
        ],
        hint: "This threat represents the modification of active data stores, inserting unauthorized records.",
        explanation: "Tampering with databases or token stores is prevented by locking down database network access rules, using prepared queries to block injection routes, and encrypting tokens at rest."
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

// Helper calculations
function calculateScore(basePoints, timeElapsedSeconds, maxTimeSeconds = 60) {
  if (timeElapsedSeconds >= maxTimeSeconds) {
    return Math.floor(basePoints * 0.5);
  }
  const ratio = (maxTimeSeconds - timeElapsedSeconds) / maxTimeSeconds;
  return basePoints + Math.floor(basePoints * 0.5 * ratio);
}

function evaluateThreatOutcome(scores) {
  const correct = scores.S.correct + scores.T.correct + scores.R.correct + scores.I.correct + scores.D.correct + scores.E.correct;
  const total = scores.S.total + scores.T.total + scores.R.total + scores.I.total + scores.D.total + scores.E.total;
  const accuracy = total > 0 ? (correct / total) * 100 : 0;

  let title = "Novice Threat Modeler";
  let badge = "🔍";
  let description = "You understand threat concepts. Play again to improve accuracy and identify systemic flaws.";

  if (accuracy >= 90) {
    title = "Elite Threat Modeling Architect";
    badge = "🏆";
    description = "Masterful mapping! You successfully secured the boundaries and classified threats according to STRIDE.";
  } else if (accuracy >= 70) {
    title = "Systems Security Auditor";
    badge = "🛡️";
    description = "Strong analytical skills. You correctly identified most trust boundaries and vulnerabilities.";
  } else if (accuracy >= 45) {
    title = "AppSec Analyst";
    badge = "💻";
    description = "Good baseline. Pay close attention to DFD nodes and the differences between Spoofing vs Elevation of Privilege.";
  }

  return {
    accuracy,
    title,
    badge,
    description
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    LEVELS,
    calculateScore,
    evaluateThreatOutcome
  };
}
