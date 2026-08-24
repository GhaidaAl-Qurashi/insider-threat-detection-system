import json
import time
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict


ALERTS_LOG_PATH = "/var/ossec/logs/alerts/alerts.json"
OUTPUT_PATH = "dashboard_data.json"
PREVIOUS_OUTPUT_PATH = "dashboard_data.json"
ACTIVE_WINDOW_HOURS = 8

BEHAVIOR_RULES = {
    "off_hours_access": {
        "rule_ids": [100101, 100102, 100103, 100104],
        "weight": 10,
        "label": "Off-hours access",
        "mitre_technique": "T1078",
        "mitre_tactic": "Initial Access, Persistence",
    },
    "mass_file_copy": {
        "rule_ids": [100105],
        "weight": 20,
        "label": "Mass file copy",
        "mitre_technique": "T1048",
        "mitre_tactic": "Exfiltration",
    },
    "steganography": {
        "rule_ids": [100020],
        "weight": 25,
        "label": "Steganography exfiltration",
        "mitre_technique": "T1027",
        "mitre_tactic": "Defense Evasion",
    },
    "removable_media": {
        "rule_ids": [100021],
        "weight": 15,
        "label": "Removable media use",
        "mitre_technique": "T1025",
        "mitre_tactic": "Collection",
    },
    "log_tampering": {
        "rule_ids": [63103, 63104],
        "weight": 30,
        "label": "Log tampering",
        "mitre_technique": "T1070",
        "mitre_tactic": "Defense Evasion",
    },
}

RULE_ID_TO_BEHAVIOR = {
    rid: bname for bname, cfg in BEHAVIOR_RULES.items() for rid in cfg["rule_ids"]
}


CORRELATION_PATTERNS = [
    {
        "rule_id": "ITM-CORR-001",
        "name": "Insider Data Exfiltration Pattern",
        "description": "Sequential correlation of off-hours access, mass file copy, "
                        "and audit log tampering indicates active data exfiltration attempt.",
        "behaviors": ["off_hours_access", "mass_file_copy", "log_tampering"],
        "window_minutes": 15,
        "severity": "critical",
        "result": "CRITICAL ALERT — Isolate endpoint & initiate IR",
    },
    {
        "rule_id": "ITM-CORR-007",
        "name": "Covert Exfiltration via Removable Media",
        "description": "Removable media use paired with steganography-based file hiding.",
        "behaviors": ["removable_media", "steganography"],
        "window_minutes": 30,
        "severity": "high",
        "result": "HIGH ALERT — Inspect removable media contents",
    },
]

TACTIC_COLORS = ["#3b82f6", "#1e40af", "#eab308", "#14b8a6", "#22c55e", "#a78bfa"]



def read_alerts(log_path: str):
    path = Path(log_path)
    if not path.exists():
        raise FileNotFoundError(f" couldnt found the alerts: {log_path}")

    relevant = []
    with path.open("r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                alert = json.loads(line)
            except json.JSONDecodeError:
                continue

            try:
                rule_id = int(alert.get("rule", {}).get("id"))
            except (TypeError, ValueError):
                continue

            if rule_id in RULE_ID_TO_BEHAVIOR:
                relevant.append(alert)

    relevant.sort(key=lambda a: a.get("timestamp", ""))
    return relevant


def extract_user(alert: dict) -> dict:
    data = alert.get("data", {})
    agent = alert.get("agent", {})

    if "win" in data:
        win_data = data["win"].get("eventdata", {})
        user = win_data.get("targetUserName") or win_data.get("subjectUserName")
        if user:
            return {"id": agent.get("id", user), "name": user}

    if "srcuser" in data:
        return {"id": agent.get("id", data["srcuser"]), "name": data["srcuser"]}

    return {"id": agent.get("id", "unknown"), "name": agent.get("name", "unknown_user")}


def parse_ts(ts: str) -> datetime:
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return datetime.now(timezone.utc)


def load_previous_scores() -> dict:
    path = Path(PREVIOUS_OUTPUT_PATH)
    if not path.exists():
        return {}
    try:
        with path.open("r", encoding="utf-8") as f:
            prev = json.load(f)
        return {emp["id"]: emp["riskScore"] for emp in prev.get("employees", [])}
    except (json.JSONDecodeError, KeyError):
        return {}


def process_alerts(alerts: list, previous_scores: dict):
    per_user_score = defaultdict(int)
    per_user_triggers = defaultdict(list)
    per_user_last_ts = {}
    per_user_history = defaultdict(list)
    per_user_events = defaultdict(list)
    per_user_alerts = defaultdict(list)
    names = {}

    alerts_out = []
    now = datetime.now(timezone.utc)
    latest_ts = None

    for a in alerts:
        rule_id = int(a["rule"]["id"])
        behavior = RULE_ID_TO_BEHAVIOR[rule_id]
        cfg = BEHAVIOR_RULES[behavior]
        user = extract_user(a)
        emp_id, emp_name = user["id"], user["name"]
        names[emp_id] = emp_name

        ts_raw = a.get("timestamp", "")
        ts = parse_ts(ts_raw)
        latest_ts = ts if latest_ts is None else max(latest_ts, ts)

        per_user_score[emp_id] += cfg["weight"]
        if cfg["label"] not in per_user_triggers[emp_id]:
            per_user_triggers[emp_id].append(cfg["label"])
        per_user_last_ts[emp_id] = ts_raw

        per_user_history[emp_id].append({
            "time": ts.strftime("%H:%M"),
            "score": per_user_score[emp_id],
        })

        level = a.get("rule", {}).get("level", 0)
        per_user_events[emp_id].append({
            "time": ts.strftime("%H:%M:%S"),
            "event": a.get("rule", {}).get("description", cfg["label"]),
            "host": a.get("agent", {}).get("name", emp_id),
            "level": classify_event_level(level),
        })

        alerts_out.append({
            "id": a.get("id", f"a{len(alerts_out) + 1}"),
            "time": ts.strftime("%b %d, %Y @ %H:%M:%S.%f")[:-3],
            "agentId": emp_id,
            "agentName": emp_name,
            "mitreTechnique": cfg["mitre_technique"],
            "mitreTactic": cfg["mitre_tactic"],
            "description": a.get("rule", {}).get("description", cfg["label"]),
            "level": level,
            "ruleId": str(rule_id),
            "riskScore": per_user_score[emp_id],
            "_behavior": behavior,
            "_ts": ts,
        })

        per_user_alerts[emp_id].append({"behavior": behavior, "ts": ts})

    return {
        "per_user_score": per_user_score,
        "per_user_triggers": per_user_triggers,
        "per_user_last_ts": per_user_last_ts,
        "per_user_history": per_user_history,
        "per_user_events": per_user_events,
        "per_user_alerts": per_user_alerts,
        "names": names,
        "alerts_out": alerts_out,
        "latest_ts": latest_ts or now,
    }


def classify_event_level(level: int) -> str:
    if level >= 12:
        return "critical"
    if level >= 9:
        return "high"
    if level >= 6:
        return "medium"
    return "low"


def classify_risk(score: int) -> str:
    if score >= 80:
        return "critical"
    elif score >= 60:
        return "high"
    elif score >= 40:
        return "medium"
    elif score > 0:
        return "low"
    return "none"



def detect_correlations(per_user_alerts: dict, names: dict) -> dict:
    correlations = defaultdict(list)

    for emp_id, events in per_user_alerts.items():
        for pattern in CORRELATION_PATTERNS:
            needed = set(pattern["behaviors"])
            matches = {}
            for ev in events:
                if ev["behavior"] in needed:
                    matches[ev["behavior"]] = ev["ts"]

            if needed.issubset(matches.keys()):
                timestamps = list(matches.values())
                window = (max(timestamps) - min(timestamps)).total_seconds() / 60
                if window <= pattern["window_minutes"]:
                    triggers = [
                        {
                            "label": BEHAVIOR_RULES[b]["label"],
                            "detail": BEHAVIOR_RULES[b]["label"],
                            "timestamp": matches[b].strftime("%H:%M:%S"),
                        }
                        for b in pattern["behaviors"]
                    ]
                    correlations[emp_id].append({
                        "id": f"C-{pattern['rule_id']}",
                        "name": pattern["name"],
                        "description": pattern["description"],
                        "ruleId": pattern["rule_id"],
                        "severity": pattern["severity"],
                        "matchTime": max(timestamps).strftime("%Y-%m-%d %H:%M:%S"),
                        "result": pattern["result"],
                        "triggers": triggers,
                    })

    return correlations


def build_tactics_breakdown(alerts_out: list) -> list:
    counts = defaultdict(int)
    for a in alerts_out:
        tactic = a["mitreTactic"].split(",")[0].strip()
        counts[tactic] += 1

    total = sum(counts.values()) or 1
    breakdown = []
    for i, (tactic, count) in enumerate(sorted(counts.items(), key=lambda x: -x[1])):
        breakdown.append({
            "name": tactic,
            "value": round(count / total * 100),
            "color": TACTIC_COLORS[i % len(TACTIC_COLORS)],
        })
    return breakdown


def build_stats(employees: list, alerts_out: list) -> list:
    critical_count = sum(1 for e in employees if e["riskScore"] >= 80)
    active_count = sum(1 for e in employees if e["status"] == "active")
    return [
        {"label": "Total events", "value": str(len(alerts_out)), "color": "#1d6fa4"},
        {"label": "Critical risk employees", "value": str(critical_count), "color": "#e53e3e"},
        {"label": "Suspicious activities", "value": str(len(alerts_out)), "color": "#e53e3e"},
        {"label": "Active sessions", "value": str(active_count), "color": "#2d9cdb"},
    ]


def build_employees(processed: dict, previous_scores: dict) -> list:
    employees = []
    now = processed["latest_ts"]

    for emp_id, score in processed["per_user_score"].items():
        last_ts_raw = processed["per_user_last_ts"][emp_id]
        last_dt = parse_ts(last_ts_raw)
        hours_since = (now - last_dt).total_seconds() / 3600

        employees.append({
            "id": emp_id,
            "name": processed["names"].get(emp_id, emp_id),
            "department": "Unknown",
            "role": "Unknown",
            "riskScore": score,
            "prevScore": previous_scores.get(emp_id, 0),
            "triggers": processed["per_user_triggers"][emp_id],
            "lastActivity": last_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "status": "active" if hours_since <= ACTIVE_WINDOW_HOURS else "inactive",
        })

    employees.sort(key=lambda e: -e["riskScore"])
    return employees



def main():
    previous_scores = load_previous_scores()
    alerts = read_alerts(ALERTS_LOG_PATH)
    processed = process_alerts(alerts, previous_scores)

    employees = build_employees(processed, previous_scores)
    correlations = detect_correlations(processed["per_user_alerts"], processed["names"])

    clean_alerts = [
        {k: v for k, v in a.items() if not k.startswith("_")}
        for a in processed["alerts_out"]
    ]

    output = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "employees": employees,
        "alerts": clean_alerts,
        "correlations": dict(correlations),
        "riskHistory": dict(processed["per_user_history"]),
        "recentEvents": dict(processed["per_user_events"]),
        "tacticsBreakdown": build_tactics_breakdown(clean_alerts),
        "stats": build_stats(employees, clean_alerts),
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Processed {len(alerts)} alerts for {len(employees)} employees.")
    print(f"Output saved to {OUTPUT_PATH} — containing: employees, alerts, correlations, riskHistory, recentEvents, tacticsBreakdown, stats.")


if __name__ == "__main__":
    main()
