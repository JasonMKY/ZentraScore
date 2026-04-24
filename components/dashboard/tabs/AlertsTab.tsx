"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { AlertPrefs, DashboardAlert } from "@/types";
import { alertDotColor, defaultPrefs } from "../shared";

interface Props {
  initialAlerts: DashboardAlert[];
  initialPrefs: AlertPrefs | null;
  onUnreadCountChange: (n: number) => void;
}

export default function AlertsTab({
  initialAlerts,
  initialPrefs,
  onUnreadCountChange,
}: Props) {
  const [alerts, setAlerts] = useState<DashboardAlert[]>(initialAlerts);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<AlertPrefs | null>(initialPrefs);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts?limit=50");
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.alerts ?? []);
        onUnreadCountChange(json.unreadCount ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  async function markAllRead() {
    const res = await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    if (res.ok) loadAlerts();
  }

  async function updatePref(key: keyof AlertPrefs, value: boolean | number) {
    const next = { ...(prefs ?? defaultPrefs()), [key]: value } as AlertPrefs;
    setPrefs(next);
    await fetch("/api/alerts/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
  }

  const prefList: { key: keyof AlertPrefs; title: string; desc: string }[] = [
    {
      key: "scoreChangeEnabled",
      title: "Score change alerts",
      desc: `Notify when score changes by more than ${prefs?.scoreChangeDelta ?? 20} points`,
    },
    {
      key: "liquidationEnabled",
      title: "Liquidation risk warnings",
      desc: `Notify when collateral health factor drops below ${prefs?.liquidationHF ?? 1.3}`,
    },
    {
      key: "newEligibility",
      title: "New eligibility",
      desc: "Notify when you become eligible for a new protocol",
    },
    {
      key: "weeklyDigestEnabled",
      title: "Weekly score digest",
      desc: "Email summary every Monday",
    },
  ];

  return (
    <>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold text-cs-ink tracking-tight mb-1">
            Alerts
          </h1>
          <p className="text-[13px] text-cs-ink4 font-mono">
            Score notifications &amp; settings
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-semibold text-cs-ink2 bg-white border-[1.5px] border-cs-border rounded-lg px-3.5 py-1.5 hover:border-cs-ink3 transition"
        >
          Mark all read
        </button>
      </div>
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6 mb-4">
        {loading ? (
          <p className="text-[13px] text-cs-ink3 py-6 text-center">Loading…</p>
        ) : alerts.length === 0 ? (
          <p className="text-[13px] text-cs-ink3 py-6 text-center">No alerts yet.</p>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 py-3.5 border-b border-[#f5f5f5] last:border-none"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                style={{ background: alertDotColor(a.type) }}
              />
              <span
                className={`text-[13.5px] leading-[1.55] flex-1 ${
                  a.read ? "text-cs-ink2" : "font-semibold text-cs-ink"
                }`}
              >
                <strong className="text-cs-ink">{a.title}</strong>
                {a.message ? ` — ${a.message}` : ""}
              </span>
              <span className="text-[11px] text-cs-ink4 font-mono shrink-0">
                {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-[18px] font-mono">
          Alert preferences
        </p>
        {prefList.map((pref) => {
          const on = (prefs?.[pref.key] as boolean | undefined) ?? false;
          return (
            <div
              key={pref.key}
              className="flex justify-between items-center py-3.5 border-b border-[#f5f5f5] last:border-none"
            >
              <div>
                <p className="text-sm font-semibold text-cs-ink">{pref.title}</p>
                <p className="text-xs text-cs-ink3 mt-0.5">{pref.desc}</p>
              </div>
              <label className="relative inline-block w-[42px] h-6 shrink-0">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => updatePref(pref.key, e.target.checked)}
                  className="opacity-0 w-0 h-0 peer"
                />
                <span className="absolute cursor-pointer inset-0 bg-[#ddd] rounded-full transition-colors peer-checked:bg-cs-green before:absolute before:content-[''] before:h-[18px] before:w-[18px] before:left-[3px] before:bottom-[3px] before:bg-white before:rounded-full before:transition-transform before:shadow-[0_1px_4px_rgba(0,0,0,.2)] peer-checked:before:translate-x-[18px]" />
              </label>
            </div>
          );
        })}
      </div>
    </>
  );
}
