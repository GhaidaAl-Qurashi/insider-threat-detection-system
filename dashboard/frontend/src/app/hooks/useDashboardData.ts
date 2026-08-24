import { useEffect, useState } from "react";

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  riskScore: number;
  prevScore: number;
  triggers: string[];
  lastActivity: string;
  status: "active" | "inactive";
}

export interface Alert {
  id: string;
  time: string;
  agentId: string;
  agentName: string;
  mitreTechnique: string;
  mitreTactic: string;
  description: string;
  level: number;
  ruleId: string;
  riskScore: number;
}

export interface CorrelationTrigger {
  label: string;
  detail: string;
  timestamp: string;
}

export interface CorrelationRule {
  id: string;
  name: string;
  description: string;
  ruleId: string;
  severity: "critical" | "high" | "medium";
  matchTime: string;
  result: string;
  triggers: CorrelationTrigger[];
}

export interface RiskHistoryPoint {
  time: string;
  score: number;
}

export interface RecentEvent {
  time: string;
  event: string;
  host: string;
  level: "critical" | "high" | "medium" | "low";
}

export interface TacticSlice {
  name: string;
  value: number;
  color: string;
}

export interface Stat {
  label: string;
  value: string;
  color: string;
}

export interface DashboardData {
  generatedAt: string;
  employees: Employee[];
  alerts: Alert[];
  correlations: Record<string, CorrelationRule[]>;
  riskHistory: Record<string, RiskHistoryPoint[]>;
  recentEvents: Record<string, RecentEvent[]>;
  tacticsBreakdown: TacticSlice[];
  stats: Stat[];
}

export function useDashboardData(url = "/dashboard_data.json", pollIntervalMs = 0) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = () => {
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`فشل تحميل البيانات: ${res.status}`);
          return res.json();
        })
        .then((json: DashboardData) => {
          if (!cancelled) setData(json);
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    fetchData();

    if (pollIntervalMs > 0) {
      const id = setInterval(fetchData, pollIntervalMs);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [url, pollIntervalMs]);

  return { data, loading, error };
}
