# MIT AI Engineering Calculus Tutor — Architecture & Setup

## Overview
A curriculum-aware, mathematically verified AI Engineering Calculus Tutor initially targeting first-year Computer Science and Engineering (CSE) students at Madras Institute of Technology (MIT), Anna University (Chromepet Campus) for **MA3151: Matrices and Calculus (Regulation 2021)**.

---

## 1. Five Core Learning Modes

### Mode A — Learn a Concept
- **Pedagogy**: Prerequisite diagnosis, intuitive physical/geometric explanations before formal notation, and closing independent application problems.
- **Adaptive Policy**: Deterministically selects teaching actions (`explain_concept`, `give_intuitive_example`, `ask_diagnostic_question`, `show_graph_representation`, `explain_misconception`).
- **Interactive Checkpoints**: Embedded diagnostic questions testing mathematical reasoning.

### Mode B — Generate Standard Problems
- **Syllabus-Aligned Filtering**: Unit, topic, objective, difficulty (foundational, standard, challenging, advanced), problem format (computational, conceptual, derivation, visualization, application), and assessment style (practice, timed mock test, topic revision).
- **Quality Control Pipeline**: Every generated candidate is verified through deterministic symbolic and Simpson quadrature algorithms before presentation.
- **Practice Set Builder**: Compile multi-problem revision sets.

### Mode C — Guided Solutions
- **5-Stage Progression**:
  1. *Understand the Problem* (Givens, constraints, mathematical objectives).
  2. *Select a Strategy* (Method justification and alternative representations).
  3. *Derive the Solution* (Step-by-step transformations with mathematical justifications).
  4. *Diagnose Errors* (Intermediate student step checking with algebraic/geometric error classification).
  5. *Verify Understanding* (Independent checkpoint problem solving).
- **Pedagogical Action Buttons**: "Give me a hint", "Explain why", "Show next step", "Check my step", "Reveal complete solution", and "Give me a similar problem".

### Mode D — Interactive Mathematical Whiteboard
- **High-Performance 2D SVG Rendering**: Cartesian coordinate grid, axis ticks, and function curves.
- **Double Integral Region Analysis**: Interactive toggle between vertical slices ($dy\,dx$) and horizontal slices ($dx\,dy$), with position slider showing boundary curve entries and exits.
- **Dynamic Parameter Sliders**: Change coefficients and observe boundary shifts in real time.

### Mode E — Live Voice Tutor
- **Hybrid Voice & Text**: Web Speech Recognition and Web Speech Synthesis.
- **Synchronized Visuals**: Mathematical formulas and whiteboard update alongside speech.
- **Interruption Support**: Dedicated interruption button to pause speech and ask follow-ups.

---

## 2. Mathematical Verification Engine
Located in `src/math/math-engine.ts`:
1. `verifyExpressionEquivalence`: Symbolic string normalization and multi-point numerical sampling in domain.
2. `verifyDerivative`: Central finite difference quadrature testing $f'(x) \approx \frac{f(x+h) - f(x-h)}{2h}$.
3. `numericalIntegrate`: Composite Simpson's 1/3 rule.
4. `numericalDoubleIntegrate`: Nested composite Simpson 2D quadrature.
5. `verifyReversedOrderOfIntegration`: Dual area and non-symmetric test function integration to verify that reversed bounds describe the identical 2D region.
6. `checkStudentStep`: Normalizes student algebraic input and checks against required transformations.

---

## 3. Syllabus Intelligence & Curriculum Management
- **Official Fixture**: `MA3151 - Matrices and Calculus` (Regulation 2021, University Departments, Anna University / MIT Campus).
- **Ingestion Pipeline**: Ingests raw syllabus text or OCR outputs, extracts units and topics, checks for missing headers, and tags drafts.
- **Approval Workflow**: Only authorized reviewers can mark a curriculum as approved.

---

## 4. Automated Testing
Run all unit tests:
```bash
npm test
```
Tests cover:
- Mathematical verification (symbolic equivalence, central difference derivatives, Simpson quadrature, order of integration reversal).
- Curriculum manager (ingestion, draft approval, versioning).
- Adaptive teaching engine (evidence level state machine, hints tracking, misconception catalog).
- Problem generator (parameterized problem variations, quadrature verification).
