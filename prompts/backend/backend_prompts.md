# Backend Prompts

> Prompts used for backend development — APIs, databases, services, infrastructure, and server-side logic.

---

<!-- Add your backend prompts below. Use the format:
## [Prompt Title]
**Context:** Brief description of when to use this.
**Prompt:**
```
[Your prompt text here]
```
-->

---

## FHIR Transformer / Mapper Layer Design

**Context:** Use when designing the data transformation step that converts raw FHIR bundles into clean, frontend-friendly JSON.
**Prompt:**

```
The FHIR data I get is very nested and hard to show and make it understand to users
in the frontend.

I need a transformer layer that converts raw FHIR Patient, Condition, and Observation
data into a simple format.

Can you show me how to structure this transformation step in a simple way?
```

**Result:** Designed `fhirMapper.ts` with three pure transformer functions, handling FHIR nesting, optional fields, and safe fallbacks.

---

## AI Summary Feature Design — Groq + Rule-Based Fallback

**Context:** Use when designing an AI-generated summary layer on top of clinical data, with a graceful fallback.
**Prompt:**

```
I want to add a simple AI summary feature for this patient dashboard.
It should take conditions and observations and generate a 2-3 sentence summary
using the Groq API (key will be provided).
If the API fails, it should fall back to a rule-based summary.
Can you help me design this logic?
```

**Result:** Designed `summaryService.ts` with Groq-first, rule-based fallback pattern. Summary added to dashboard response.

---

## Rule-Based Risk Flagging Feature Design

**Context:** Use when adding clinical risk indicators based on threshold rules, strictly without AI.
**Prompt:**

```
I also wanted to add risk flagging features as well for clinical conditions like high
blood pressure. This should be strictly rule-based, not AI generated.
Can you help me define simple rules and how to structure this in code?
```

**Result:** Designed `riskFlagEngine.ts` as a pure utility with typed flags (severity + message). Flags added to `DashboardResponse`.
