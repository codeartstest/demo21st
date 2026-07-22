# SDLC Agentic Pipeline — Huawei Cloud CodeArts Agent Skill

A multi-agent SDLC orchestration skill that drives an entire software delivery
lifecycle — from requirements to deployment — using **Huawei Cloud CodeArts Agent**.
Six agents collaborate asynchronously through Jira comments as a message bus,
enforcing quality gates, error throwback, and human-in-the-loop checkpoints.

> Trigger this skill when the user asks to start an agentic flow, SDLC pipeline,
> agentic DevOps pipeline, multi-agent development workflow, or any prompt related
> to initiating the end-to-end agentic software delivery lifecycle.

---

## Architecture

```
+---------------------------------------------------------------------------+
|                    SDLC AGENTIC PIPELINE - 7 AGENTS                       |
+---------------------------------------------------------------------------+
|                                                                           |
|  +-------------+   +--------------+   +---------------+                   |
|  | PM Agent    |   | Backend Agent|   | Frontend Agent|                   |
|  | (orchestr.) |   | (server code)|   | (UI code)     |                   |
|  | READ-ONLY   |   | GIT WRITE    |   | GIT WRITE     |                   |
|  | repo access |   | owns clone,  |   | owns clone,   |                   |
|  | (minimal    |   | commit,push, |   | commit,push,  |                   |
|  |  GitHub MCP)|   | branch, PR,  |   | branch, PR    |                   |
|  | NEVER git   |   | create_repo, |   |               |                   |
|  |             |   | PR MERGE     |   | PR MERGE      |                   |
|  |             |   | (primary     |   | (when sole    |                   |
|  |             |   |  when both)  |   |  developer)   |                   |
|  +------+------+   +------+-------+   +-------+-------+                   |
|         |                 |                   |                           |
|         |   Jira comments = inter-agent message bus                        |
|         |                 |                   |                           |
|  +------v------+   +------v-------+   +-------v-------+                   |
|  | Code        |   | Tester Agent |   | DevOps Agent  |                   |
|  | Reviewer    |   | (Playwright) |   | (CI/CD+JFrog) |                   |
|  | (PR Review) |   +--------------+   | GIT WRITE     |                   |
|  +-------------+                      | (infra only)  |                   |
|                                       | NO PR create  |                   |
|                                       | NO PR merge   |                   |
|                                       +---------------+                   |
|                                                                           |
|  +-------------------+                                                    |
|  | Design-Architecture|  (Step 0.DA, conditional)                        |
|  | (DDD/SDD/TDD)     |  Task classification, methodology execution        |
|  +-------------------+  Curated handoff to implementation                 |
|                                                                           |
+---------------------------------------------------------------------------+
```

---

## The Pipeline (9 Steps + Design Phase)

```
+---------------------------------------------------------------------------+
|  STEP  AGENT(S)            ACTION                                         |
+---------------------------------------------------------------------------+
|   0    PM + Frontend/Backend/DevOps  Onboarding: auto-provision agents,  |
|                                       Opt A (existing repo) or            |
|                                       Opt B (new repo, parallel build)    |
| 0.DA  Design-Architecture  Design phase: classify task, research,        |
|                             DDD/SDD/TDD methodology execution, handoff    |
|   1    PM                  Requirement breakdown, PRD, batch Jira tasks  |
|   1b   Frontend/Backend    Requirement review (PARALLEL via Jira async)  |
|   2    PM + Developer      Sprint start + SDD setup                      |
|   3    Frontend/Backend    Code dev (PARALLEL), Semgrep pre-scan, PR     |
|   4    Code Reviewer       PR review (batch), secret scanning, approval  |
|   5    Tester + PM + Dev   E2E testing + auto-merge feature PRs         |
|   6    DevOps              CI/CD (auto-triggered) + JFrog + SonarCloud   |
|   7    PM + Developer      Release review + merge (dev -> main)          |
|   8    PM + DevOps         Deploy auth + execution (Huawei Cloud ECS)    |
|   9    PM + Developer      Sprint close, retro, HTML report              |
+---------------------------------------------------------------------------+
```

> Step 0.DA is conditional: it runs only if methodology tools (SDD/TDD/DDD)
> are selected during onboarding. See
> `references/agents/design-architecture-agent.md`.

---

## Agents

| Agent | File | Steps | Key Responsibility |
|-------|------|-------|--------------------|
| PM | `references/agents/pm-agent.md` | 0, 1, 1b, 2, 5, 7, 8, 9 | Orchestration, PRD, batch Jira ops, sprint mgmt, release auth, retro |
| Backend | `references/agents/backend-agent.md` | 0, 1b, 2, 3, 5, 7, 9 | Server code, APIs, DB, API tests, repo creation, PR operations (primary) |
| Frontend | `references/agents/frontend-agent.md` | 0, 1b, 2, 3, 5, 7, 9 | UI code, components, unit tests, PR operations (when sole developer) |
| Code Reviewer | `references/agents/code-reviewer-agent.md` | 4 | Batch PR review, batch secret scanning, approval sign-off |
| Tester | `references/agents/tester-agent.md` | 5 | Playwright E2E, bug reporting, coverage |
| DevOps | `references/agents/devops-agent.md` | 0, 6, 8 | CI/CD, JFrog verify, SonarCloud QG, deployment (NO PR operations) |
| Design-Architecture | `references/agents/design-architecture-agent.md` | 0.DA | Task classification, DDD/SDD/TDD methodology execution, curated handoff |

The PM Agent is the orchestrator (`mode: all`); all others run as subagents
(`mode: subagent`).

---

## Methodology Skills (Multi-Tool Selection)

During Step 0.0.5, the PM Agent presents **4 grouped multiselect questions**.
The user selects which tools to enable. Everything downstream — onboarding,
config generation, agent permissions, pipeline steps — is conditional on selections.

### Question 1 — MCP Servers & Services

| Tool | Description | Config Output |
|------|-------------|---------------|
| GitHub | Repo access, branches, PRs | `mcp_settings.json`, `.env` |
| Jira (Atlassian) | Task tracking, sprints, messaging | `mcp_settings.json`, `.env` |
| SonarCloud | Code quality gate, coverage | `mcp_settings.json`, `sonar-project.properties`, `.env` |
| Semgrep | Local static analysis, security | `mcp_settings.json`, `.env` |
| JFrog Artifactory | Docker image storage, artifact verify | `.env`, GitHub secrets |
| Huawei Cloud ECS | Deployment target (SSH, Docker) | `.env`, `add_ssh_key.py` |

### Question 2 — SDD (Spec-Driven Development)

| Tool | Status | Description | Granted To |
|------|--------|-------------|------------|
| SDD Toolkit (Huawei Built-in) | Available | Spec, design, tasks docs | PM, Backend, Frontend, Design-Architecture |
| OpenSpec | Planned | Alternative spec methodology | PM, Backend, Frontend, Design-Architecture |


> First selected = PRIMARY; others = SUPPLEMENTARY.

### Question 3 — TDD (Test-Driven Development)

| Tool | Status | Layer | Description | Granted To |
|------|--------|-------|-------------|------------|
| Playwright CLI | Available | E2E | Browser testing | Tester |
| Postman Skill | Available | API | API testing via MCP | Backend, Design-Architecture |
| Newman | Available | API | Postman collections via CLI/CI | Backend |
| Jest | Available | Unit | JavaScript/TypeScript | Backend, Frontend |
| Pytest | Available | Unit | Python | Backend |
| JUnit | Available | Unit | Java (JUnit 5) | Backend |
| Vitest | Available | Unit | JS/TS (Vite-based) | Backend, Frontend |

> Each tool owns its own test layer. All selected layers must pass.

### Question 4 — DDD (Domain-Driven Design)

| Tool | Status | Description | Granted To |
|------|--------|-------------|------------|
| Context Mapper | Available | Bounded contexts DSL | Design-Architecture |
| EventStorming | Available | Domain discovery workshop | Design-Architecture |
| Structurizr | Available | C4-model architecture DSL | Design-Architecture |

> First selected = PRIMARY (approval artifact); others = SUPPLEMENTARY.
> Domain model designed ONCE, then re-expressed in each supplementary format.

### Built-in Utility Skills (always on, not selectable)

`ide-tool`, `doc-expert`, `pptx`, `data-analysis`, `prd`, `frontend-design`, `i18n-integration`

---

## Directory Structure

```
sdlc-agentic-pipeline/
├── SKILL.md                              # Skill entry point + pipeline overview
└── references/
    ├── setup/
    │   ├── service-onboarding.md         # Step 0: service + methodology tool onboarding
    │   └── multi-tool-selection-plan.md   # Step 0.0.5: multi-tool selection plan
    ├── agents/
    │   ├── pm-agent.md                   # Orchestrator, PRD, sprint mgmt, release auth
    │   ├── backend-agent.md              # Server code, APIs, DB, PR operations (primary)
    │   ├── frontend-agent.md             # UI code, components, PR operations (sole dev)
    │   ├── code-reviewer-agent.md        # Batch PR review, secret scanning, approval
    │   ├── tester-agent.md               # Playwright E2E, bug reporting, coverage
    │   ├── devops-agent.md               # CI/CD, JFrog, SonarCloud, deployment
    │   └── design-architecture-agent.md   # Step 0.DA: DDD/SDD/TDD methodology execution
    ├── pipeline.md                       # Per-step orchestration reference
    ├── skill-registry.json               # Methodology skill registry (v2)
    └── templates/
        ├── mcp-settings.json             # MCP server config (conditional)
        ├── ci-cd.yml                     # GitHub Actions workflow template
        ├── sonar-project.properties      # SonarCloud project config
        ├── env-template.env              # Environment variables template
        ├── set-secrets.js                # GitHub Actions secrets/variables setup
        ├── add_ssh_key.py                # Add SSH key to Huawei Cloud ECS
        ├── SKILL.md                      # Postman MCP skill definition (TDD: API layer)
        ├── apply-tool-selections.ps1     # Windows: update agent permissions from selections
        ├── apply-tool-selections.sh      # macOS/Linux: same as above
        └── sprint-scripts/
            ├── sprint-start.ps1          # Windows: create/start Jira sprint
            ├── sprint-start.sh           # macOS/Linux: same as above
            ├── sprint-close.ps1          # Windows: close Jira sprint
            ├── sprint-close.sh           # macOS/Linux: same as above
            └── README.md                 # Sprint scripts usage guide
```

---

## MCP Servers Required

> Conditional: MCP servers are configured only for selected tools.
> If a tool is not selected, its MCP entry is omitted from `mcp_settings.json`.
> JFrog is configured as a service (REST API) in `.env` + GitHub secrets, not as
> an MCP server.

| MCP Server | Purpose | Auth |
|------------|---------|------|
| `atlassian-rovo-mcp` | Jira tasks, sprints, comments, transitions | Basic (Base64 `email:token`) |
| `github` | Repos, branches, PRs, reviews, workflow dispatch | Bearer PAT |
| `sonarqube` | Quality gate, issues, coverage, hotspots | Bearer token |
| `semgrep` | Local static analysis, security scanning | App token env |

---

## Quick Start

1. **Install the skill** — copy `sdlc-agentic-pipeline/` into your project's
   `.codeartsdoer/skills/` directory.
2. **Enable it** — append `sdlc-agentic-pipeline=true` to
   `.codeartsdoer/skills/ProjectSkillStatus.txt`.
3. **Run Step 0 (Service Onboarding)** — the PM Agent presents 4 multiselect
   questions (Integrations, SDD, TDD, DDD), then walks you through configuring
   only the selected services. Configs are generated from templates in
   `references/templates/`.
4. **Start the pipeline** — say "start agentic flow" and the 9-step pipeline
   runs end-to-end.

---

## Branch Strategy (GitFlow)

```
main  (production-ready)
 └── dev  (integration branch)
       ├── feature/<agent>/<short-description>
       ├── fix/<agent>/<short-description>
       └── docs/sdd-<feature_name>
```

---

## Jira Status Lifecycle

```
To Do ---> In Progress ---> In Review ---> In Testing ---> Done
(created)   (dev starts)    (PR ready)     (E2E testing)  (PM release)
```

Tasks are routed to agents via **Jira labels** (not assignee):
`agent:frontend`, `agent:backend`, `agent:code-reviewer`,
`agent:devops`, `agent:tester`, `agent:pm`.

All inter-agent communication happens via Jira comments:
`@agent:<target-agent> <message>`.

---

## PR Merge Gate

A feature PR may only be merged into `dev` when ALL of the following are satisfied:

1. Code Reviewer Agent sign-off comment exists on Jira task
2. Tester Agent E2E sign-off comment exists on Jira task
3. Human approval (via PM Agent question tool)

> CI green and SonarCloud QG are gates for the **release merge** (`dev` -> `main`)
> in Step 7, not for the feature PR merge.

---

## Critical Setup Warnings

> [!WARNING]
> 1. **SonarCloud Automatic Analysis conflict** — MUST be disabled before any
>    CI/CD run. If left enabled alongside the GitHub Actions scan, the pipeline
>    crashes. Requires Project Administrator permissions.
> 2. **Jira direct REST API 401** — Direct calls to `{site}.atlassian.net` with
>    Basic auth return 401. Use the Atlassian API gateway
>    (`api.atlassian.com/ex/jira/{cloudUuid}/rest/...`). Discover the cloud UUID
>    via `atlassian-rovo-mcp_getVisibleJiraProjects`.
> 3. **Jira sprint name length** — must be shorter than 30 characters or the API
>    returns 400.
> 4. **Sprint field value type** — `customfield_10020` must be a number, NOT an
>    array.
> 5. **Manual integrations required** — GitHub<->Jira, GitHub<->SonarCloud, and
>    GitHub<->Semgrep links must be configured manually in each platform's UI.
> 6. **Jira 'In Testing' status required** — This status does NOT exist by
>    default. Must be manually added to the workflow.
> 7. **Never push directly to main** — All changes must go through a
>    feature/docs branch and PR targeting `dev`.

---

## Execution Notes

- The PM Agent is the only agent that can authorize deployment and close sprints.
- PM Agent is READ-ONLY with the repository — never clones, commits, or pushes.
- DevOps Agent does NOT create or merge PRs — PR operations routed to developer agents.
- Tester Agent exclusively owns E2E/Playwright tests; Frontend/Backend own unit
  and component tests.
- SonarCloud MCP only reads remote analysis results — use Semgrep MCP for local
  scanning.
- CI/CD is **auto-triggered** on push to `dev` (not manual).
- All SDD documents are pushed to GitHub via a docs branch + PR targeting `dev`.
- Pipeline degrades gracefully — steps that depend on unselected tools are
  skipped, not errored.
