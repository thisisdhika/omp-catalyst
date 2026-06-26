---
name: hyperd
description: >
  Workflow-driven multi-agent orchestrator. Use hyperd whenever the user wants a structured
  multi-phase pipeline — named workflow (bugfix, feature, review, refactor, research,
  security-audit), multi-agent orchestration, or specialist dispatch. Loads a YAML workflow,
  drives sequential/parallel phase dispatch via specialist agents, chains context between
  phases. Trigger even without the word "hyperd" — any multi-phase task maps here.
---

# Hyperd — Workflow-Driven Multi-Agent Orchestrator


---

## 1. Entry Point

### Invocation
```
/hyperd <workflow-name>        # user-explicit — always honor this
/hyperd                        # infer workflow from task context
```

### Workflow Selection

Always select a workflow autonomously. Never ask the user to pick one.

**Explicit name** → use it directly.

**Otherwise**, read all `description` fields from `hyperd/workflows/*.yml` and select the best fit based on the user's task. Use this heuristic:

| Task signal | Infer |
|------------|-------|
| Bug, crash, regression, incident, "not working" | `bugfix` |
| New feature, "add X", "implement Y", "build Z" | `feature` |
| PR review, audit, "check this code", "review before merge" | `review` |
| Cleanup, restructure, extract module, tech debt | `refactor` |
| "Research X", "evaluate Y", "compare options", decision brief | `research` |
| Security review, pen test prep, compliance, "check for vulns" | `security-audit` |

If two plausibly fit, pick the narrower one. Announce selection in one sentence, then proceed.

### Load the chosen workflow
```bash
cat hyperd/workflows/<name>.yml
```

---

## 2. Workflow YAML Schema

```yaml
name: <workflow-id>
description: <human-readable purpose>
phases:
  - name: <phase-name>
    agent: <agent-id>             # see Agent Roster (§4)
    task: "<what this agent must do>"
    gate: oracle                  # optional — halt for oracle approval before next phase
    parallel: true                # optional — dispatch alongside the previous phase
    optional: true                # optional — skip if output is empty or N/A
    output_hint: "<format hint>"  # optional — guide how agent should structure output
```

All fields except `name`, `agent`, and `task` are optional.

---

## 3. Phase Execution Protocol

Run phases **in order** unless `parallel: true` is set on a phase (which means it can run concurrently with the phase immediately before it).

### For each phase:

**Step 1 — Announce**
Print: `[HYPERD] Phase <N>/<total>: <phase-name> | Agent: <agent-id> | Task: <task text>`

**Step 2 — Compose dispatch prompt**

Combine:
- The agent's role identity and operating constraints (see §4)
- The phase `task` from the YAML
- Full `HYPERD_CONTEXT.md` artifact (all prior phase outputs)
- Any user-supplied inputs (error messages, file paths, issue text, specs)

**Step 3 — Dispatch**

- **Claude Code**: spawn subagent with composed prompt.
- **claude.ai**: adopt agent role; execute task from that persona.

**Step 4 — Capture output**

Append to `HYPERD_CONTEXT.md` (see §5). Keep sections tight: decisions, findings, produced artifacts (file paths, test IDs). Omit raw code/logs — downstream agents read actual files.

**Step 5 — Gate check** (if `gate: oracle`): run Oracle Gate Protocol (§6).

---

> **Parallel phases**: phases with `parallel: true` dispatch alongside the previous phase. Merge parallel outputs into one `HYPERD_CONTEXT.md` section before the next sequential phase.

## 4. Agent Roster

Each agent has a defined identity, operating scope, and hard constraints. When dispatching, include the relevant identity block in the prompt.

| Agent | Role | Hard constraints |
|-------|------|-----------------|
| **scout** | Codebase reconnaissance, pattern discovery, convention mapping | Read-only. Never modifies files. |
| **researcher** | External knowledge, web research, documentation synthesis | Cites all sources. No implementation. |
| **planner** | Architecture decisions, vertical slice decomposition, API contracts | Produces plans only. No code changes. |
| **worker** | Implementation: code, tests, refactoring | Follows the plan. Implements only what was approved. |
| **reviewer** | Code, security, performance audit | Read-only. Returns findings with severity (CRITICAL / HIGH / MEDIUM / LOW). |
| **designer** | Visual/UX review, accessibility audit (WCAG) | Read-only audit. Returns findings + recommended fixes. |
| **debugger** | Root cause analysis, minimal reproduction | Diagnosis only. Does not implement fixes. |
| **tester** | Test generation, product validation, E2E / user journeys | Writes tests and validation scripts. Does not modify production code. |
| **oracle** | Risk assessment, HOTL gating, irreversible-op approval | Returns APPROVED / BLOCKED / MODIFY. Never executes changes. |
| **kugutsu** | Deep strategic analysis across multiple subsystems | **NUCLEAR OPTION — see §7.** READ-ONLY. Returns a delegation plan only. |

---

## 5. Handoff Format (HYPERD_CONTEXT.md)

```markdown
# Hyperd Session Context
Workflow : <workflow-name>
Objective: <user's original task>
Started  : <ISO timestamp>

---

## Phase 1 — <phase-name> [<agent>] ✅
### Key Findings
- <bullet>
### Decisions Made
- <bullet>
### Artifacts Produced
- `<file-path>` — <description>

---

## Phase 2 — <phase-name> [<agent>] ✅
...
```

Rules:
- Always pass the **complete** `HYPERD_CONTEXT.md` to the next agent — never truncate.
- Append each phase immediately after it completes, before dispatching the next.
- Mark incomplete phases with 🔄 (in progress) and failed/blocked phases with ❌.

---

## 6. Oracle Gate Protocol

Triggered when a phase has `gate: oracle`.

1. **Summarize the risk**: what the next phase will do, what is irreversible, what could go wrong.
2. **Dispatch oracle** with: full `HYPERD_CONTEXT.md` + risk summary.
3. **Oracle returns one of:**
   - `APPROVED` → proceed to next phase
   - `BLOCKED: <reason>` → halt workflow, surface reason to user, await instruction
   - `MODIFY: <amended plan>` → revise the upcoming phase's task, confirm with user, then proceed

Never bypass an oracle gate. If a gate is hit on an already-completed irreversible action, halt immediately and report.

---

## 7. Kugutsu — Nuclear Option

> **Invoke Kugutsu ONLY when ALL THREE conditions hold simultaneously:**
>
> **(a) Literally crucial** — mission-critical task or irreversible consequence  
> **(b) Extreme complexity** — exceeds any single specialist; requires 4+ sub-agents across multiple subsystems simultaneously  
> **(c) Prior escalation exhausted** — cheaper agents were tried or explicitly ruled insufficient for this specific problem

Kugutsu is **READ-ONLY**. It returns a delegation plan. Hyperd (you) executes the plan.

**Before invoking Kugutsu, ask:** *"Which specialist agent could handle this instead?"*  
If any single agent from the roster is sufficient → dispatch that agent. Kugutsu is not a shortcut.

Misdispatching Kugutsu for routine or single-domain work wastes the most expensive agent in the roster and violates the cost covenant.

---

## 8. Error Recovery

| Situation | Action |
|-----------|--------|
| Agent produces no actionable output | Re-dispatch with tighter constraints. If still empty, mark `INCONCLUSIVE`, log context, continue unless hard prerequisite. |
| Agent drifts out of scope | Return to task with explicit scope reminder and output format. |
| Irreversible action without oracle gate | STOP. Invoke oracle retroactively before further action. |
| Phase dependency produces unusable output | Re-run phase, or escalate to user with context artifact. |

---

## 9. Built-in Workflows

All workflow YAMLs live in `hyperd/workflows/`. Available by default:

| File | Purpose |
|------|---------|
| `bugfix.yml` | Diagnose → plan → implement → verify |
| `feature.yml` | Research → design → plan → implement → review → test |
| `review.yml` | Scout → review → security-check → report |
| `refactor.yml` | Scout → plan → implement → review |
| `research.yml` | Research → synthesize → validate |
| `security-audit.yml` | Scout → review (security) → oracle gate → report |

To add a custom workflow: create `hyperd/workflows/<name>.yml` following the schema in §2.
