---
name: one-on-one
description: "Adversarial 1-on-1 debate via IRC between Presenter and Griller. Use when a plan, design, implementation, or decision needs stress-testing before committing."
condition: "stress-test, grill, challenge, devil's advocate, red-team, sanity-check, second opinion, adversarial review"
---

# One-on-One: Agent-vs-Agent Grill

Adversarial stress-test for plans, designs, implementations, or decisions. NOT for routine review, collaborative design, or information gathering.

# Named Pairs

| Grill | Presenter | Griller | Focus |
|-------|-----------|---------|-------|
| **Assumptions** | Planner | Oracle | Hidden assumptions, second-order effects, drift |
| **Implementation** | Worker | Reviewer | Correctness, security, performance, product quality |
| **Coverage** | Tester | Debugger | Untested paths, flaky tests, missing reproductions |
| **Visual fidelity** | Worker | Designer | UX friction, accessibility, design system violations |
| **Context** | Scout | Planner | Missing patterns, wrong scope, overlooked journeys |

Match the pair to what needs stress-testing; if none fits, use the two most relevant specialists.

# Protocol

1. **Spawn pair** via `task` — Presenter and Griller. Include artifact/plan/code in BOTH assignments.
2. **State the cap** — default 6 exchanges, max 12 for high-risk. Strict.
3. **Griller opens** — first challenge based on the artifact.
4. **Each message** contains: specific challenge, why it matters, skeptical hypothesis, resolution criteria.
5. **Presenter answers** with: evidence-backed response, or concession + revised position.
6. **Griller decides**: resolved → next branch. Unresolved → push deeper (max 2 pushes per branch, then log unresolved).
7. **After cap** — BOTH produce a Grill Report (all 5 fields: Resolved Decisions, Unresolved Assumptions, Open Risks, Confidence, Recommendation).
8. **Harvest** — read both reports, synthesize, state decision (proceed / revise / escalate) with evidence.

# Cap Enforcement

- After cap exchanges, both MUST produce their Grill Report. No extensions.
- Max 2 pushes per branch. Unresolved after two → log and move on.
- Concession = resolution. Do not re-open conceded points.
- Stalemate after 3 exchanges → Griller declares stalemate, logs unresolved, moves on.
- Timeout safety: if either agent hasn't reported after cap + 1, harvest whatever exists.

# Escalation Prefixes

Prefix grill responses when applicable:
- `ambiguous:` — challenge or position unclear
- `blocked:` — missing evidence needed to evaluate
- `risk:` — unresolved assumption with material impact
- `too-big:` — grill scope too broad; recommend narrower focus

# Rules

- **Steelman first.** Griller steelmans the position before attacking — no strawmen.
- **Cite evidence.** Griller must cite specific code, plan text, or data.
- **No hand-waving.** Presenter answers with specifics or explicitly "I don't know."
- **Grill output is evidence, not a decision.** Orchestrator decides.
- **One question at a time.** Each message is one branch.

# Anti-Patterns

- Griller re-asking an already-answered question.
- Both agents agreeing too quickly — Griller's job is to push.
- Orchestrator stepping in mid-grill — let agents work, harvest at end.

# Output Format

Each agent produces at the end:

### Grill Report

**Role**: [Presenter/Griller]
**Topic**: [what was grilled]
**Rounds**: [actual count / cap]

#### Resolved Decisions
- [decision]: [evidence/conclusion]

#### Unresolved Assumptions
- [assumption] — Risk: [high/medium/low] — [why unresolved]

#### Open Risks
- [risk]: [impact if realized]

#### Confidence: [0-100]%

#### Recommendation: proceed | revise | abort
[one-line reasoning]
