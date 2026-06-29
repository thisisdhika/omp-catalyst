# omp-catalyst

Catalyst Squad orchestrator for oh-my-pi

## What It Is

omp-catalyst is a HOTL-native (Human-on-The-Loop) multi-agent orchestrator for oh-my-pi. It ships specialized subagents that work together under a unified coordination model: define criteria upfront, run autonomously, and escalate exceptions only when confidence drops or risk requires a human gate.

Catalyst is installed as native OMP prompt and rule files. `APPEND_SYSTEM.md` gives the main agent a compact, always-on identity as a pure delegator; `RULES.md` supplies the hard constraints. The main agent reads context, dispatches subagents, verifies gates, and talks to the human. It does not write code directly.
## Karpathy's 4 Principles

The agent prompts embed Andrej Karpathy's four coding principles:

1. **Think Before Coding** -- Every agent prompt includes a dedicated section requiring explicit assumption-stating, alternative-presentation, and confusion-naming before any action. Scouts and Planners must surface hidden complexity; Workers must state assumptions before writing code.
2. **Simplicity First** -- Workers are instructed to refuse unrequested features, avoid speculative abstractions, and evaluate every line against "would a senior engineer call this overcomplicated?" Designers apply the same lens to UI.
3. **Surgical Changes** -- Workers touch only what the plan requires, match existing style, clean up their own orphans, and trace every changed line back to a plan requirement. Debuggers diagnose but never fix.
4. **Goal-Driven Execution** -- Every plan step uses the format `[Step] -> verify: [checkable criterion]`. No step exists without a verifiable success criterion. All agents execute toward explicit, testable goals.

## HOTL Patterns

The orchestrator implements four HOTL patterns:

- **Progressive Autonomy** -- Agents run autonomously within defined criteria. The human does not approve every action, only strategic phase boundaries.
- **Exception-Based Escalation** -- Confidence below 70% triggers escalation. Ambiguous plans, high-risk findings, and agent disagreements all route to a human with full context.
- **Strategic Human Gates** -- The human reviews the plan before execution and the results before deployment. Intermediate steps are autonomous.
- **Oracle as Gatekeeper** -- The Oracle defines evaluation criteria before any Worker executes. Reviewer and Tester evaluate against those criteria. Only exceptions reach the human.

## Prompt Design

Catalyst is optimized for cross-model reliability, including weaker or free models:

- **Compact always-on prompt** — keep identity and hard rules short so user/task context still fits.
- **One rule per concept** — avoid repeating the same instruction in multiple phrasings.
- **Forceful delegation** — the main agent must route implementation, investigation, testing, and review through subagents.
- **Anti-rationalization guard** — "just reading", "just a small fix", or "delegation is slower" are treated as failure signals.
- **No fake tools** — prompts only mention capabilities that actually exist in the OMP environment.

## Agent Roster

| Agent | Role | Tools | Model |
|-------|------|-------|-------|
| **Scout** | Fast codebase reconnaissance and deep context assembly | read, bash, grep, find, ls | pi/smol |
| **Researcher** | Deep external knowledge and product research | read, bash, grep, find, ls | pi/smol |
| **Planner** | Implementation planning and high-level design | read, bash, grep, find, ls | pi/plan |
| **Worker-Basic** | Simple, well-defined, single-file implementation | read, write, edit, bash, grep, find, ls | pi/task |
| **Worker-Expert** | Complex multi-file implementation, refactoring, nuanced domain work | read, write, edit, bash, grep, find, ls | pi/task |
| **Worker-Hyper** | Mission-critical, high-stakes, or coordination-heavy implementation | read, write, edit, bash, grep, find, ls | pi/task |
| **Reviewer** | Code, security, performance, and product review | read, bash, grep, find, ls | pi/task |
| **Tester** | Test generation, validation, and product testing | read, write, edit, bash, grep, find, ls | pi/task |
| **Designer** | Visual design, UI/UX review, and vision multimodal debugging | read, bash, grep, find, ls | pi/vision |
| **Debugger** | Root cause analysis and product behavior debugging | read, bash, grep, find, ls | pi/default |
| **Oracle** | Risk assessment, design review, and HOTL gatekeeper | read, bash, grep, find, ls | pi/slow |

All specialist prompts now include:

- a clear **Scope** boundary
- standard escalation prefixes: `ambiguous:`, `blocked:`, `risk:`, `too-big:`
- a concise **Output Contract** so downstream agents get predictable, low-noise reports

## Installation

```bash
omp plugin install omp-catalyst
catalyst init
```

The `catalyst init` command presents an interactive prompt to select which agents to install and configure rules. Agents are copied to `~/.omp/agent/agents/`. Rules and system prompt are installed to `~/.omp/agent/`, where OMP loads them natively on startup.

## CLI Commands

| Command | Description |
|---------|-------------|
| `catalyst init` | Interactive setup — select agents and configure rules |
| `catalyst add <target>` | Add components: subagents, rules, prompts, or all |
| `catalyst remove <target>` | Remove installed components |
| `catalyst status` | Show what is installed vs available |
| `catalyst mode [mode]` | Set or view agent model mode (free, low, mid, high, hyper, default) |

Target values for `add` and `remove`: `subagents`, `rules`, `prompts`, `all`.

## File Placement

| Source | Destination | Purpose |
|--------|-------------|---------|
| `agents/*.md` | `~/.omp/agent/agents/*.md` | Installed subagent definitions |
| `rules/RULES.md` | `~/.omp/agent/RULES.md` | Always-on hard rules |
| `prompts/APPEND_SYSTEM.md` | `~/.omp/agent/APPEND_SYSTEM.md` | Always-on Catalyst identity prompt |
| `skills/one-on-one/SKILL.md` | Auto-discovered from the plugin directory | Optional adversarial grill workflow |

OMP loads `APPEND_SYSTEM.md` and `RULES.md` natively, so Catalyst does not need a runtime extension to inject prompts.

## The One-on-One Grilling Skill

This plugin includes a `one-on-one` skill that runs adversarial debates between two specialist agents. A Presenter and a Griller alternate challenges via IRC with a hard round cap (default 6 exchanges, max 12 for high-risk). Named pairs cover assumptions (Planner vs Oracle), implementation quality (Worker vs Reviewer), coverage (Tester vs Debugger), visual fidelity (Worker vs Designer), and context completeness (Scout vs Planner). The orchestrator harvests both agents' outputs and decides whether to proceed, revise, or escalate to a human.

## Workflow Patterns

| Pattern | Flow |
|---------|------|
| Trivial Fix | Scout -> Worker (implement + test) -> Reviewer |
| Feature | Scout -> Planner -> Oracle (criteria) -> Worker (TDD) -> Reviewer/Tester/Designer |
| Bug Investigation | Scout -> Debugger -> Oracle (if structural) -> Planner -> Worker -> Reviewer/Tester |
| UI/UX Issue | Scout -> Designer (visual) -> Debugger (if code) -> Planner -> Worker -> Reviewer/Designer |
| Design Review | Scout -> Designer -> Planner -> Worker -> Reviewer/Tester |
| Greenfield | Scout -> Researcher -> Oracle -> Planner -> Worker -> Reviewer/Tester |

## License

MIT
