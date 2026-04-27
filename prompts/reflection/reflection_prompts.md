# Reflection Prompts

> Prompts used for sprint retrospectives, code reviews, lessons learned, and improvement analysis.

---

<!-- Add your reflection prompts below. Use the format:
## [Prompt Title]
**Context:** Brief description of when to use this.
**Prompt:**
```
[Your prompt text here]
```
-->

---

## Full Architecture Review Before Implementation

**Context:** Use before starting any coding to ensure the architecture plan is internally consistent.
**Prompt:**

```
Do a full lookover over the backend architecture plan. Make sure all of the
flows and traces are proper and intact and ready to work. When implementing a feature
or fixing a bug, make sure the implementation isn't breaking any other part of
the program. Do only minimum code differential required for the task.
```

**Result:** Found and fixed 4 inconsistencies — stale diagram names, missing riskRules step, missing flags in response, wrong types header. Added `cors` dep. Saved ARCHITECTURE.md and IMPLEMENTATION_PLAN.md to project root.
