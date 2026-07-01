# STRIDE-lite Threat Modeler

An interactive web-based cybersecurity learning game designed for students to explore the **STRIDE-lite** threat modeling framework (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) on visual Data Flow Diagrams (DFDs).

Developed for the Naresuan University Computer Engineering (CPE) & Intelligent Innovation Engineering (IIE) English Programs.

## Features

- **Interactive SVG DFDs**: Inspect system architectures visually. Nodes representing Processes, Stores, and Entities dynamically highlight vulnerabilities, respond to clicks, and update trust boundaries.
- **Three Topology Levels**: Audit the *Student Project Portal* (Level 1), the *E-Tuition Payment System* (Level 2), and the *Campus Active Directory SSO* (Level 3).
- **HUD Audit checklist**: A step-by-step auditing dashboard requiring users to match threat events with target DFD nodes, STRIDE categories, and mitigation safeguards.
- **Keyboard Shortcuts**: Select STRIDE categories with keys `[S]`, `[T]`, `[R]`, `[I]`, `[D]`, `[E]`, choose controls with keys `[1]`-`[4]`, and submit with `[ENTER]`.
- **Outcome Metrics**: Dynamic reporting detailing accuracy breakdowns per STRIDE vector, high scores synced in `localStorage`, and printable training certificates.

## Structure

```
stride-threat-modeler/
├── index.html        # Main page containing login, SVG workspace, and reports
├── styles.css        # Carbon theme stylesheet, SVG animations, and print layouts
├── game-core.js      # Core level settings, threat databases, and score evaluator
├── app.js            # Main controller rendering SVGs and handling state loops
├── game-core.test.js # Unit test verifying logic mappings
└── teacher-guide.md  # Instructor guides and classroom activity checklists
```

## How to Play

1. Run the local Python server:
   ```bash
   python3 -m http.server 8000
   ```
2. Navigate to `http://localhost:8000` in your web browser.

## Run Tests

Verify model evaluations and score mechanics:
```bash
node game-core.test.js
```
