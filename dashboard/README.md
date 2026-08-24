# Risk Dashboard (stretch goal)

## Backend — `backend/`

`risk_scorer.py` reads `/var/ossec/logs/alerts/alerts.json`, scores each
"employee" based on which behaviors they've triggered, and writes
`dashboard_data.json`. `cors_server.py` serves that JSON over HTTP with
CORS enabled so the frontend can fetch it.

## Frontend — `frontend/`

Vite + React + Radix/shadcn UI. Key components confirm it's wired to
the backend's actual output shape: `SecurityAlertsTable.tsx`,
`TopEmployeesPanel.tsx`, `EmployeeRiskPanel.tsx`,
`EmployeeDetailPanel.tsx`, `AlertsEvolutionChart.tsx`.

To run locally: `pnpm install` (or `npm install`) then `pnpm dev` (or
`npm run dev`) from inside `frontend/`. `node_modules/` is intentionally
not included — it's fully regenerated from `package.json`.

## Known issues in `backend/risk_scorer.py` (found during review)

1. **Stale rule IDs**: `BEHAVIOR_RULES["off_hours_access"]["rule_ids"]`
   still includes `100101, 100102`, which were dropped from
   `local_rules.xml` (see `rules/local_rules.xml` comments). Harmless
   at runtime, but should be updated to `[100103, 100104]` for accuracy.

2. **MITRE tags disagree with the rule file**:
   - Rule 100105 is `T1074` / Collection in `local_rules.xml`, but
     `T1048` / "Exfiltration" here.
   - Rule 100021 is `T1092` in `local_rules.xml`, but `T1025` here
     (arguably `T1025` — "Data from Removable Media" — is the more
     accurate one; `T1092` is specifically about C2 communication).
   Team should pick one mapping and make both files agree.

3. **Employee attribution can fragment across Scenario 2's rules.**
   `extract_user()` picks whichever Windows username field is present
   per-event:
   - Rule 100026 → `targetUserName` = "Shjoon Almutairi" (correct)
   - Rule 100027 → `targetUserName` = "kali" (the attacker's own
     credential name from `net use`) — gets attributed to an
     "employee" named kali, not Shjoon
   - Rule 100028 (event 5156) has no username fields at all → falls
     back to `agent.name` = "Employee-Normal"

   Net effect: one attack session can fragment across three different
   "employee" identities instead of accumulating under one, which
   undercuts the scenario's whole point (everything should show up
   under Shjoon's name). Likely untested against Scenario 2 data
   specifically, since Scenario 2 postdates the "confirmed working"
   note for this dashboard.

   **Decision (24 Aug 2026): not fixed for this submission**, given
   time constraints — documented here as a known limitation rather
   than silently left broken. Suggested fix if revisited: group by
   `agent.id`/`agent.name` as the primary key, keep the Windows
   username as secondary display info rather than the grouping key.
