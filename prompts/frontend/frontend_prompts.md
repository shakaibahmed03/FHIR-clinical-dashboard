# Frontend Prompts

> Prompts used for frontend development — UI components, styling, user flows, and client-side logic.

---

<!-- Add your frontend prompts below. Use the format:
## [Prompt Title]
**Context:** Brief description of when to use this.
**Prompt:**
```
[Your prompt text here]
```
-->

---

## Frontend Scaffold

**Context:** Use to spin up the React frontend that talks to the backend dashboard endpoint.
**Prompt:**

```
scaffold a frontend in /frontend with Vite + React + TypeScript + Tailwind. one page: a search bar for patient ID and panels rendering the DashboardResponse from
GET /api/patients/:id/dashboard.
```

---

## Dashboard Panels

**Context:** Use when building the UI components for each section of the dashboard.
**Prompt:**

```
build components for each panel: SearchBar, DemographicsPanel, ConditionsList, ObservationsList, AISummaryBox, RiskFlagsSection. App.tsx owns the state and passes props down.
```
