# Insider Threat Simulation and Detection System

KAUST Academy Cybersecurity Training project. A simulated corporate
network generating both normal and malicious insider activity, monitored
end-to-end with Wazuh, using a mix of built-in and custom detection rules.

**Team:** Ghaida, Abrar, Shoujoon

## Architecture

![Architecture diagram](docs/architecture.png)

Two Windows endpoint agents report to one Wazuh manager:

- **Employee-Insider** — plays "Employee A, Finance Dept" in Scenario 1
- **Employee-Normal** — plays "HR Employee" in Scenario 2

A Kali Linux VM acts as the external attacker in Scenario 2 (no Wazuh
agent — it's the adversary infrastructure, not something we monitor).

## Scenario 1 — Insider Threat (Employee-Insider)

Six-stage escalating-employee narrative: off-hours access, access
outside job role, mass file copy, steganography, USB media, log
tampering. Full stage-by-stage detection mapping and debugging history
is in the team's engineering notebook, Section 15.

## Scenario 2 — External Attacker via Stolen Credentials (Employee-Normal)

An attacker uses phished credentials to RDP in, stage sensitive HR
files, and exfiltrate them over SMB to a Kali-hosted listener. Verified
live, 19 Aug 2026 — commands and expected evidence in
[`simulation/scenario2-commands.md`](simulation/scenario2-commands.md).

## Rule reference

| Rule ID | Scenario / Stage | Trigger | MITRE |
|---|---|---|---|
| 100103–104 | S1 Stage 1 | Off-hours / weekend login | — |
| 63103–63104 | S1 Stage 6 (default rules) | Log cleared | — |
| 100105 | S1 Stage 3 | Mass file copy (FIM frequency match) | T1074 |
| 100020 | S1 Stage 4 | Steganography (image entropy) | T1027.003 |
| 100021 | S1 Stage 5 | USB storage connected | T1092 |
| 100026 | S2 | RDP logon from attacker-net IP | T1021.001 |
| 100027 | S2 | Explicit-credential logon (net use) | T1078 |
| 100028 | S2 | Outbound SMB connection to attacker | T1048.002 |

## Repo layout

```
rules/       local_rules.xml — all custom detection rules
config/      per-agent syscheck blocks (FIM configuration)
simulation/  exact commands used to trigger each scenario
dashboard/   stretch-goal risk-scoring dashboard (React + Python)
docs/        architecture diagram
```

## Setup

1. Install Wazuh manager + indexer + dashboard (Ubuntu 24.04.4 LTS).
2. Enroll Windows agents, named `Employee-Insider` and `Employee-Normal`.
3. Copy `rules/local_rules.xml` to `/var/ossec/etc/rules/` on the manager,
   then `sudo systemctl restart wazuh-manager`.
4. On each agent, add the corresponding block from `config/` to that
   agent's own `ossec.conf` `<syscheck>` section, then restart the agent.
5. Run the commands in `simulation/` to reproduce each scenario.

## Known gaps (being filled in by the team before final submission)

- [ ] `config/employee-insider-syscheck.xml` — Abrar to confirm real content
- [ ] `config/employee-normal-syscheck.xml` — Shoujoon to confirm real content
- [ ] `simulation/scenario1-commands.md` — needs the actual Stage 1–6 commands
- [x] `dashboard/backend/` — added; see `dashboard/README.md` for known issues (deliberately not fixed for this submission — documented, not hidden)
- [x] `dashboard/frontend/` — added (Vite + React + Radix/shadcn, confirmed wired to backend's data shape)

**Note on scope:** this repo reflects the intended, documented state of
the rules (100101/100102 dropped, realistic time window). The live
Wazuh manager may not be updated to match yet — that's being reconciled
separately and doesn't block this submission.
