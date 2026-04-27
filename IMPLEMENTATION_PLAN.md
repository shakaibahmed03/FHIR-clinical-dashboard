# Implementation Plan \u2014 Layer Health Clinical Dashboard

## Coding Principles

> [!IMPORTANT]
> **Minimum diff policy:** When implementing a feature or fixing a bug, only make the minimum code changes required. Never modify code that is unrelated to the current task. Before every change, verify that the implementation won\u2019t break any other part of the program.

---

## Build Order

### Phase 1 \u2014 Backend Foundation

| Step | File                                     | Action                                          | Depends on     |
| ---- | ---------------------------------------- | ----------------------------------------------- | -------------- |
| 1    | `backend/package.json` + `tsconfig.json` | Init project, install deps                      | \u2014         |
| 2    | `src/types/fhir.ts`                      | Define raw FHIR resource interfaces             | \u2014         |
| 3    | `src/types/dashboard.ts`                 | Define clean output types + `DashboardResponse` | Step 2         |
| 4    | `src/services/fhirClient.ts`             | Implement parallel HAPI FHIR calls              | Steps 2\u20133 |
| 5    | `src/services/transformer.ts`            | Map raw FHIR \u2192 clean types                 | Steps 2\u20133 |
| 6    | `src/services/riskRules.ts`              | Rule-based risk evaluation                      | Step 3         |
| 7    | `src/services/summary.ts`                | Groq AI + rule-based fallback                   | Step 3         |
| 8    | `src/routes/patients.ts`                 | Wire up GET `/api/patients/:id/dashboard`       | Steps 4\u20137 |
| 9    | `src/index.ts`                           | Express app, cors, mount routes, start server   | Step 8         |
| 10   | `.env`                                   | Set `FHIR_BASE_URL`, `PORT`, `GROQ_API_KEY`     | \u2014         |

**Checkpoint:** `npm run dev` \u2192 hit `GET /api/patients/:id/dashboard` \u2192 get full JSON response.

---

### Phase 2 \u2014 Frontend

| Step | File                                   | Action                             | Depends on       |
| ---- | -------------------------------------- | ---------------------------------- | ---------------- |
| 11   | `frontend/`                            | Scaffold Vite + React + TS project | \u2014           |
| 12   | `src/types/dashboard.ts`               | Mirror backend output types        | Backend Step 3   |
| 13   | `src/services/api.ts`                  | `fetchDashboard(id)` function      | Step 12          |
| 14   | `src/components/SearchBar.tsx`         | ID input + submit                  | \u2014           |
| 15   | `src/components/DemographicsPanel.tsx` | Patient info card                  | Step 12          |
| 16   | `src/components/ConditionsList.tsx`    | Conditions table                   | Step 12          |
| 17   | `src/components/ObservationsList.tsx`  | Observations table                 | Step 12          |
| 18   | `src/components/AISummaryBox.tsx`      | Summary display                    | Step 12          |
| 19   | `src/components/RiskFlagsSection.tsx`  | Flag cards with severity           | Step 12          |
| 20   | `src/App.tsx`                          | Compose all components, state mgmt | Steps 13\u201319 |

**Checkpoint:** Run frontend, search a patient ID, see full dashboard render.

---

## Trace Integrity Checklist

Before declaring any phase complete, verify:

- [ ] **Type flow:** `fhir.ts` \u2192 `fhirClient.ts` return types match raw FHIR shapes
- [ ] **Transform flow:** `transformer.ts` input types = `fhir.ts`, output types = `dashboard.ts`
- [ ] **Risk flow:** `riskRules.ts` input = `dashboard.ts` clean types, output = `RiskFlag[]`
- [ ] **Summary flow:** `summary.ts` input = `dashboard.ts` clean types, output = `string`
- [ ] **Route assembly:** `patients.ts` calls chain in order: fhirClient \u2192 transformer \u2192 riskRules \u2192 summary
- [ ] **Response shape:** Final JSON matches `DashboardResponse` exactly
- [ ] **Frontend types:** `frontend/types/dashboard.ts` mirrors `backend/types/dashboard.ts`
- [ ] **CORS:** Backend allows requests from frontend dev port

---

## Verification Plan

### Automated (Backend)

```bash
# 1. Start backend
cd backend && npm run dev

# 2. Test with a known HAPI FHIR patient ID
curl http://localhost:5000/api/patients/592924/dashboard | jq .

# 3. Verify response shape has all 5 fields
# Expected: { patient, conditions, observations, summary, flags }

# 4. Test with invalid ID
curl http://localhost:5000/api/patients/INVALID/dashboard
# Expected: error response, not a crash
```

### Automated (Frontend)

```bash
# 1. Start frontend
cd frontend && npm run dev

# 2. Open browser to localhost (Vite port)
# 3. Search a patient ID \u2192 verify all 6 panels render
```

### Manual

1. Search patient ID `592924` \u2192 confirm demographics, conditions, observations load
2. Verify AI summary appears (or rule-based fallback if no Groq key)
3. Verify risk flags appear with correct severity colours
4. Search an invalid ID \u2192 confirm error message appears, no crash
