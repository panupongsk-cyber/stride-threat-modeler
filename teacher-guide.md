# Instructor Guide: STRIDE-lite Threat Modeler

This guide outlines the learning objectives, game mechanics, and classroom recommendations for using the **STRIDE-lite Threat Modeler** in cybersecurity courses.

---

## 1. Educational Alignment

The game is designed for undergraduate computer engineering and information security students (e.g., Naresuan University, CPE & IIE English Programs: `305331/316331 Computer & Information Security`).

### Learning Outcomes (CLOs)
After completing this simulation, learners will be able to:
1. **Understand Data Flow Diagrams (DFDs)**: Identify DFD nodes (Processes, Data Stores, External Entities), network flows, and trust boundaries.
2. **Classify Threats (STRIDE-lite)**: Map system anomalies and vulnerabilities to the correct STRIDE-lite category (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).
3. **Deploy Security Controls**: Select the appropriate engineering safeguard (e.g., Prepared queries to prevent Tampering, TLS encryption to prevent Info Disclosure, Digital Signatures to prevent Repudiation, WAF & Load Balancing to prevent DoS) to secure system architecture components.

---

## 2. Technical Setup & Deployment

The simulator is built with client-side Vanilla HTML5, CSS3 (including inline SVGs), and ES6 JavaScript. It runs locally with no external dependencies.

### How to Run Locally
Instructors and students can launch the game instantly.

1. Navigate to the game folder and start a lightweight Python web server:
   ```bash
   python3 -m http.server 8000
   ```
2. Open a web browser and go to:
   `http://localhost:8000`

---

## 3. Simulator Structure & Mechanics

The game consists of **3 progressively complex systems (Levels)** representing different system topologies.

### Level 1: Student Project Portal
* **Topologies**: Student User Client, Web Server Process, Database SQL Store, and Local File Storage (Proposal PDFs).
* **Vulnerabilities**: Direct file access tampering (grading lists), raw credential sniffing over plain network routes, and admin privilege bypass via client cookies parameters.

### Level 2: E-Tuition Payment System
* **Topologies**: Student Client, Core Payment Gateway process, third-party Banking API webhook, and transaction Audit Logs.
* **Vulnerabilities**: Bank API callback Spoofing, customer payment transaction Repudiation, and deadline network traffic flood (Denial of Service).

### Level 3: Campus Active Directory & Single Sign-On (SSO)
* **Topologies**: User Client, central SSO authenticator process, session Token memory store, and HR/Exam Campus Service server.
* **Vulnerabilities**: Session token hijacking/replay spoofing, active DB token tampering, and SSO authentication process buffer overflows (Elevation of Privilege).

---

## 4. Game Controls & Interactive HUD

* **Interactive DFD Viewer**: Students inspect a dynamically rendered SVG network diagram. Click on nodes to select them as target audit elements. Target nodes pulse with red warning indicators when threats are active.
* **Auditing HUD**: A 3-step checklist:
  - **Step 1**: Click the vulnerable component in the DFD.
  - **Step 2**: Choose the correct STRIDE category (S, T, R, I, D, E buttons).
  - **Step 3**: Select the matching control card.
* **Keyboard Shortcuts**: Map to key characters:
  - `S`, `T`, `R`, `I`, `D`, `E` keypress to select STRIDE vector.
  - `1`, `2`, `3`, `4` keys to select control choices.
  - `ENTER` key to verify audit config and proceed to next threat.

---

## 5. Classroom Integration Strategies

### Activity Option A: DFD Auditing Lab (30 Minutes)
- **Activity**: Before starting the lab, review the symbols of DFD (Process: circle, Entity: box, Store: open lines, Flow: arrows, Boundary: dashed line).
- **Execution**: Students open the game and analyze the 3 levels.
- **Reporting**: Students must note why each threat maps to that specific node and why the selected control mitigates the threat.

### Activity Option B: Formative Assessment Submission
- **Assessment**: Students complete the 9 threat scenarios. On the results dashboard, they click **"Generate Certificate"** which renders a custom certificate detailing:
  - Analyst name and ID.
  - Verification code hash.
  - Accuracy metrics breakdown for Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege.
- **Evidence**: Students print or save the certificate as PDF and upload it to the LMS (Canvas/Moodle) as evidence of CLO achievement.
