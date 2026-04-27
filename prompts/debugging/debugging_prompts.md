# Debugging Prompts

> Prompts used for diagnosing errors, tracing bugs, analyzing logs, and fixing issues across the stack.

---

<!-- Add your debugging prompts below. Use the format:
## [Prompt Title]
**Context:** Brief description of when to use this.
**Prompt:**
```
[Your prompt text here]
```
-->

---

## Full Code Lookover & Finish Unfinished Parts

**Context:** Use after a feature push or before declaring a phase complete to sweep the entire codebase for unfinished parts, broken traces, or trace-integrity issues across the service chain.
**Prompt:**

```
Do a full lookover of all the code and code all the unfinished parts. Make sure all of
the flows and traces are proper and intact and ready to work.
```
