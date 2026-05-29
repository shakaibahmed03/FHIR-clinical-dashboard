## Clinical Dashboard Prototype

A lightweight clinical dashboard for primary care physicians. The clinician enters a patient ID and gets a unified view of the patient's demographics, conditions, recent observations, an AI-generated clinical summary, and color-coded risk flags grounded in real clinical guidelines.

Built as a take-home assignment for the Solutions Engineer Co-op role at Layer Health.

---

## Quick Demo

Three example patient IDs cover the demo space:

| Patient ID | Patient | What they demonstrate |
|---|---------|----------------------|
| `demo-001` | Sarah Mitchell (33F) | Stable patient with normal vitals — clean baseline view, no risk flags |
| `demo-002` | James Carter (57M) | Multiple moderate-severity risk flags (active hypertension + type 2 diabetes, elevated BP 132/86) |
| `demo-003` | Maria Rodriguez (70F) | Critical case with high-severity flags (active MI + COPD, BP 156/98, HR 108, SpO₂ 88, fever 38.7°C) |

Type any of these IDs into the search bar to load that patient.

---

## Setup and Running Locally

You need:
- Node.js v20 or higher
- npm v10 or higher

### 1. Clone the repo

```bash
git clone https://github.com/shakaibahmed03/layer-health-takehome.git
cd "layer health"
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following:

```bash
PORT=3001
USE_MOCK_DATA=true
FHIR_BASE_URL=https://hapi.fhir.org/baseR4
GROQ_API_KEY=gsk_your_groq_key_here
```

`GROQ_API_KEY` is optional — if you don't have one (or it fails), the app uses a deterministic rule-based summary fallback. Everything still works without the key. `USE_MOCK_DATA=true` reads patient data from the bundled FHIR-shaped JSON files; setting it to `false` switches to live HAPI FHIR.

Then start the server:

```bash
npm run dev
```

The backend now runs on `http://localhost:3001`. You can verify with:

```bash
curl http://localhost:3001/health
```

You should see `{"status":"ok"}`.

### 3. Set up the frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`. Open that URL in your browser, type one of the demo patient IDs (`demo-001`, `demo-002`, or `demo-003`) into the search bar, and you'll see the dashboard load. (If port 5173 is already in use, Vite will pick the next free port — check the terminal for the exact URL.)

### 4. Stopping

`Ctrl+C` in each terminal stops the respective server.

---

## What's In Each Folder

```
layer health/
├── backend/              Node + Express + TypeScript API server (port 3001)
│   └── src/mock-data/    FHIR R4 demo patients, conditions, observations
├── frontend/             React + Vite + Tailwind dashboard (port 5173)
├── prompts/              AI tool conversations from while building
├── ARCHITECTURE.md       Detailed architecture notes
├── IMPLEMENTATION_PLAN.md  Build plan + verification steps
└── README.md             This file
```

---

## Design Decisions

I'm a student building this in a tight time budget, so every decision below is about trading complexity for time without giving up the things that matter — clean architecture, real clinical reasoning, and a working demo.

### Tech stack

**React + Vite + Tailwind for the frontend.** Vite spins up instantly and Tailwind lets me style without writing custom CSS. Both are widely used and fast for prototyping. I picked them because I've used them in school projects and at my current internship, so I could move fast.

**Node + Express + TypeScript for the backend.** Express is minimal, gets out of the way, and lets me focus on the logic. TypeScript gives me type safety on the data shapes, which matters a lot when you're transforming messy healthcare data. I considered NestJS (which I use at my current internship at Steady State Health) but decided it was overkill for a 3-hour prototype — the framework's boilerplate would have eaten 30+ minutes I could spend on the actual features.

**No database.** Patient data is read on-demand from FHIR-shaped JSON files. In production, you'd swap the file reads for FHIR API calls (more on that below). I deliberately didn't add a caching layer for the prototype — the file reads are already in-process, so caching them buys nothing. Production would put Redis in front of real FHIR endpoints, where the latency actually matters.

**Groq (`llama-3.1-8b-instant`) for the AI summary** with a deterministic rule-based fallback. Groq is cheap, very fast (sub-second), and good enough for short clinical narratives. The fallback exists because I shouldn't trust an external service to never fail — if Groq is down, rate-limited, or no API key is configured, the dashboard still works with a slightly less elegant summary. The summary service is wrapped so it never throws.

### How the components communicate

The frontend makes one HTTP request to the backend (`GET /api/patients/:id/dashboard`) and gets one consolidated JSON response back. The backend orchestrates everything internally — it fetches patient data, conditions, and observations, runs them through a transformer to clean up the FHIR shapes, computes risk flags, generates the AI summary, and bundles it all into one clean response.

This is sometimes called the **adapter pattern** or **backend-for-frontend** pattern. The whole point is that the frontend never has to know what FHIR looks like or where the data comes from. If we swapped the data source from mock files to a real EHR's FHIR API tomorrow, the frontend code wouldn't change at all.

### Mock data instead of live HAPI FHIR

I originally planned to use the [HAPI FHIR public test server](https://hapi.fhir.org/baseR4) — a free, public FHIR server commonly used for demos. I even wrote a script to score patients on the server by how much clinical data they had. But the public server is unreliable: slow response times, intermittent downtime, and patient records get wiped on a schedule. I didn't want a broken HAPI server to break my demo.

So I generated **mock data in valid FHIR R4 format** — the same `Bundle` structure HAPI returns, with real LOINC and SNOMED codes. The transformer layer does the same FHIR adaptation work it would do against live HAPI. The switch is already wired in: `fhirClient.ts` checks the `USE_MOCK_DATA` env flag and dispatches to either the mock fetcher (file read) or the live HAPI fetcher (`axios.get`). The rest of the pipeline is unchanged either way.

I designed three patients to cover the demo space: a stable patient (no flags), a moderate-severity patient (multiple flags fire), and a critical patient (high-severity flags). This way the demo shows the full range of what the system can do.

---

## Clinical Logic

The target user is a **primary care physician** seeing a patient in a 15–20 minute visit. They need to understand who the patient is and what's clinically concerning in the first 30 seconds. Everything in the dashboard is laid out around that need.

### Why these specific data points

| Section | Why it's there |
|---------|----------------|
| **Patient header** (name, age, gender, ID) | Confirms identity. The doctor needs to know who they're looking at before anything else makes sense. Age is computed from `birthDate` so age-dependent thresholds are easy to add later. |
| **AI summary** at the top | A 2–3 sentence narrative that tells the doctor "here's what matters" before they scan the rest. Mimics how a colleague would brief them in 10 seconds. |
| **Risk flags** with color coding | Visual triage — red is urgent, amber is "needs attention this visit," green means under control. Lets the eye land on what's wrong without reading. |
| **Active conditions** | What chronic problems is this person managing? Drives the entire conversation. Filtered to active only — resolved diagnoses are noise. |
| **Recent observations** | Latest vitals — BP, heart rate, O₂ saturation, temperature. The doctor needs to know what's current, not a six-month history. |

### The risk-flag rules

Risk flags are **deterministic** (rule-based, not AI). Clinical decision support has to be reliable and auditable — you can't have an LLM hallucinating that a patient has hypertension. So the rules are simple `if/else` thresholds in `riskRules.ts`, keyed by the LOINC and SNOMED codes the transformer extracts.

**Observation thresholds** (LOINC-coded vitals):

| Vital | LOINC | HIGH | MEDIUM | Source |
|---|---|---|---|---|
| Systolic BP | `8480-6` | > 140 mmHg | 120–140 mmHg | ACC/AHA 2017 Hypertension Guidelines (Stage 2 ≥140) |
| Heart rate | `8867-4` | > 100 bpm | < 60 bpm | Standard adult vitals reference |
| O₂ saturation | `2708-6` | < 90% | < 95% | Standard pulse oximetry reference (severe hypoxemia <90%) |
| Body temperature | `8310-5` | — | > 38.5 °C | Standard fever threshold |

**Active condition flags** (SNOMED-coded; only fires if `clinicalStatus = active`):

| Condition | SNOMED | Severity |
|---|---|---|
| Myocardial infarction | `22298006` | HIGH |
| Hypertension | `38341003` | MEDIUM |
| Type 2 diabetes mellitus | `44054006` | MEDIUM |
| Diabetes mellitus | `73211009` | MEDIUM |
| COPD | `13645005` | MEDIUM |

> Resolved conditions are intentionally excluded from flagging — `riskRules.checkConditions` filters on `status === "active"` so a patient with historical (treated) hypertension doesn't generate a current flag.

The AI summary, on the other hand, is allowed to be flexible — it generates plain-English narrative that summarizes everything for the doctor. But because it's an LLM, it's labeled as AI-generated and the deterministic rules are what the doctor can actually trust.

### What I deliberately left out

A real PCP would also want medications, allergies, lab results (HbA1c, eGFR, lipids), recent encounters, and overdue preventive screenings. I scoped those to "future work" because the architecture cleanly supports adding them — they're just additional FHIR resources flowing through the same adapter, plus matching threshold rules in `riskRules.ts` (e.g. HbA1c > 9.0% from ADA Standards of Care, eGFR < 60 from KDIGO). The list is short and well-defined; the work is in the data plumbing, not the design.

---

## Architecture

### Current architecture (the prototype)

```
┌──────────────────────┐
│  React Frontend      │
│  (port 5173)         │
└──────────┬───────────┘
           │ One HTTP request:
           │ GET /api/patients/:id/dashboard
           ▼
┌──────────────────────────────────────────────┐
│  Express Backend (port 3001)                 │
│                                              │
│  routes/patients.ts  (orchestrator)          │
│   ├─ services/fhirClient.ts   (mock or HAPI) │
│   ├─ services/transformer.ts  (clean shapes) │
│   ├─ services/riskRules.ts    (risk flags)   │
│   └─ services/summary.ts      (Groq + fallback)
│                                              │
└──────────────────┬───────────────────────────┘
                   │
        ┌──────────┴──────────────┐
        ▼                         ▼
┌────────────────────┐   ┌────────────────────┐
│  Mock FHIR R4      │   │  Groq API          │
│  JSON (default)    │   │  llama-3.1-8b-     │
│  or live HAPI      │   │  instant           │
│  (USE_MOCK_DATA)   │   │                    │
└────────────────────┘   └────────────────────┘
```

### How this would scale to thousands of clinicians

If this were a real product serving thousands of physicians across many hospitals, the architecture would extend in fairly standard ways. I haven't built any of this in the prototype — it's intentionally out of scope — but here's how the same shape grows up:

**Frontend layer**
- Static frontend assets served from a CDN (CloudFront, Vercel, etc.) close to clinicians for fast loads
- The frontend code itself wouldn't change — same React app, just deployed to a CDN instead of `npm run dev`

**Backend layer**
- The Express backend runs as **stateless containers** behind a load balancer
- Container orchestration (Kubernetes, AWS ECS) handles scaling — more pods spin up under load, fewer pods scale down at off-hours
- "Stateless" matters here: any pod can serve any request, because no per-user state lives in memory. The current backend already has this property — there's nothing to undo.

**Caching layer**
- A **Redis cluster** in front of the FHIR client, shared across all backend pods, keyed by patient ID
- All pods read from and write to the same Redis, so a cache hit on one pod helps every other pod
- TTLs are configurable per care setting — much shorter for ICU contexts (where data must be fresh), longer for routine outpatient
- I left this out of the prototype on purpose: caching in-process file reads is pointless. Caching only earns its complexity once you're paying real network cost for FHIR.

**Data layer (real EHR integration)**
- The mock FHIR JSON files get replaced with real EHR FHIR endpoints (Epic, Cerner, etc.)
- Authentication uses **SMART on FHIR / OAuth2** — when the clinician logs in, the app gets a scoped access token tied to their identity and their permissions
- The `fhirClient.ts` adapter pattern means this swap is mostly contained — the rest of the backend doesn't change

**Authentication and authorization**
- Single sign-on with the hospital's identity provider (Okta, Azure AD)
- Role-based access control — different clinicians see different views (PCPs see comprehensive, specialists see filtered)
- Short idle timeouts (15 minutes is standard for clinical contexts)

**Audit and compliance**
- Every patient access logged to a **PostgreSQL audit database** with clinician ID, patient ID, timestamp, accessed fields, and IP
- HIPAA requires this — you have to be able to answer "who looked at this patient's record on which date?"
- All traffic over TLS, all data at rest encrypted, all infrastructure on HIPAA-eligible cloud services with a Business Associate Agreement (BAA)

**Resilience**
- Retries with exponential backoff on FHIR calls (not in the prototype — would be added)
- **Circuit breakers** — if a downstream EHR is failing repeatedly, stop hammering it for a cooldown period
- **Stale-while-revalidate** caching — serve stale cached data with a warning if the live source is down, rather than failing the whole dashboard
- Switch from `Promise.all` to `Promise.allSettled` so one failed sub-fetch (e.g. observations) doesn't kill the whole dashboard

**Observability**
- Structured logging from every backend pod → centralized log aggregator (Datadog, CloudWatch)
- Metrics on cache hit rate, FHIR latency, AI summary failure rate
- Alerts on anomalies (sudden spike in FHIR errors, Groq failures crossing a threshold)

The prototype carries the *shape* of these patterns even where it doesn't implement the production version — the AI summary fallback is real, the type-safe contract between backend and frontend is real, the safe FHIR field-access patterns in the transformer are real. The hardening (cache, retries, circuit breakers, partial-failure tolerance) is what gets added at the edges. The clinical logic underneath stays the same.

---

## Trade-offs and What I'd Do Next

I want to be honest about what I cut and why.

**Cut for time:**
- Authentication / authorization (a real product needs SMART-on-FHIR, RBAC, audit logging — but that's hours of work for a 3-hour prototype)
- Medications, allergies, procedures (the architecture supports them; just more FHIR resources flowing through the same adapter)
- USPSTF preventive screening rules (colon, breast, cervical) — these need encounter and procedure history, which I didn't fetch
- Streaming AI summary (would feel snappier in production, but adds complexity I didn't need for a demo)
- Tests (a real codebase needs unit tests for the transformer and risk rules, integration tests for the routes)
- Production-quality error handling (the prototype handles the common cases but isn't bulletproof)

**What I'd do with another day:**
- Add medications and allergies — both are critical clinical context I'd want in front of a doctor
- HbA1c and eGFR observations + matching risk rules (ADA, KDIGO citations) — the rule engine and transformer already accept new LOINC codes; just need the data and two more `OBSERVATION_RULES` entries
- A real cache layer (in-memory with TTL is fine to start) for when `USE_MOCK_DATA=false` — file reads don't need it, but live HAPI calls do
- Switch from `Promise.all` to `Promise.allSettled` in `fhirClient.ts` so one failed sub-fetch doesn't tank the whole dashboard
- Unit tests for risk rules with sample observation inputs (these are pure functions, trivial to test)
- Role-specific dashboards — a cardiologist's view filtered to cardiac data, a hospitalist's view emphasizing the last 24 hours

**What I'd do with a real engineering team:**
- Proper SMART-on-FHIR auth flow against a sandboxed Epic instance
- Streaming AI summary with Server-Sent Events
- Real-time alerts for critical lab values (push notifications when something crosses a threshold)
- Integration with the hospital's EHR write-back so a clinician can mark something as reviewed

---

## AI Tooling Disclosure

I built this with significant help from AI tools. The full conversations are in the `/prompts` folder.

**Cursor** was my primary IDE. I set up a `.cursorrules` file at the project root with the project context (architecture, tech stack, code style, what's in scope) so Cursor had persistent context across every prompt. This was the single highest-leverage decision in the whole build — without it, I would have spent the first sentence of every prompt re-explaining the project.

**My workflow looked like this:** vague exploratory prompt → see what Cursor wrote → run it → fix what was broken or weird → ask follow-up questions about anything I didn't understand → iterate. Some of my best prompt-log entries are from debugging — pasting an error and asking "why is this happening?" The AI tools accelerated my coding speed maybe 3–4x, but I had to override their suggestions in real ways: they sometimes invented FHIR field names that didn't exist, sometimes proposed structures that didn't match my project's pattern, and sometimes were just wrong about clinical thresholds (I cross-checked everything against the real ADA / ACC/AHA / KDIGO guidelines).

The reflection in `prompts/reflection/reflection_prompts.md` goes into more detail on what worked and what didn't.

---

## A Note On Where This Prototype Stops

This is a **prototype**, not production code. It doesn't have authentication, HIPAA controls, real EHR integration, or test coverage. I made these omissions deliberately because the take-home is 2–3 hours of work and the goal is demonstrating engineering judgment on architecture, clinical reasoning, and AI collaboration — not building a hospital-grade product.

If an engineer wanted to extend this into something real, the boundaries are clean: the adapter pattern in the backend means data sources can be swapped without touching the frontend, the risk-rules module is pure functions easy to unit-test and extend, and the AI summary has both a real-LLM path and a fallback so it's never a single point of failure.

Thanks for reviewing this.
