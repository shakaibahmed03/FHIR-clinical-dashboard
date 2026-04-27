# Planning Prompts

> Prompts used for project planning, architecture decisions, roadmap design, and sprint scoping.

---

<!-- Add your planning prompts below. Use the format:
## [Prompt Title]
**Context:** Brief description of when to use this.
**Prompt:**
```
[Your prompt text here]
```
-->

---

## Environment Initialization

**Context:** Use at the very start of a new project to verify the development environment and set up version control.
**Prompt:**

```
check the node, npm and git version. initialize git and create .gitignore file
```

**Result:** Node.js v24.13.0 · npm 11.6.2 · Git 2.50.1 · Repo initialized at `/Users/shakaib/Documents/layer health`

---

## Backend Architecture Design — Clinical Dashboard

**Context:** Use when starting a new backend service to establish structure before writing any code.
**Prompt:**

```
I am building a small clinical dashboard.

I want a simple backend that fetches patient data from the HAPI FHIR test server
and sends it to a React frontend.

Can you help me design a simple backend structure for this?
I only need Patient, Condition, and Observation data for now.

[Instruction: Do not code anything now, just design the architecture]
```

**Result:** Node.js/Express proxy architecture designed. See `backend_architecture_plan.md` artifact.

---

## Refined Backend Architecture — TypeScript + Aggregation Endpoint

**Context:** Use to lock in the tech stack and endpoint design before implementation begins.
**Prompt:**

```
1) Implement the backend in Node, Express, TypeScript.
2) One aggregation endpoint only: GET /api/patients/:id/dashboard
   Backend collects data from multiple sources and returns a unified response.
3) Fetch data from HAPI FHIR and return a clean JSON response for the frontend.
4) Suggest a simple folder structure and how the request flow should work.

[Instruction: Do not code until commanded to]
```

**Result:** TypeScript structure designed with routes → controller → fhirService → fhirMapper pattern.
Parallel Promise.all fetching for Patient + Condition + Observation. See updated `backend_architecture_plan.md`.

---

## Simplified Backend Folder Structure

**Context:** Use to flatten an over-engineered folder structure for a small single-endpoint backend.
**Prompt:**

```
I feel like my backend folder structure is a little complicated.
My preferred layout:
- backend/src/index.ts (entry point)
- backend/src/routes/patients.ts
- backend/src/services/fhirClient.ts, transformer.ts, riskRules.ts, summary.ts
  (summary.ts should also contain rule-based fallback if Groq fails)
- backend/src/types/fhir.ts (raw FHIR types) and dashboard.ts (clean output types)
```

**Result:** Simplified to 3-folder flat layout — no controllers, no utils. Service chain: fhirClient → transformer → riskRules → summary.
