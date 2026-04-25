"use client";

import { useEffect, useMemo, useState } from "react";
import type { SubscriptionPlan } from "@/types";

type ApiKeyMeta = {
  id: string;
  name: string | null;
  prefix: string;
  active: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

interface Props {
  plan: SubscriptionPlan;
}

const ELIGIBLE_PLANS: SubscriptionPlan[] = ["PROTOCOL", "ANALYTICS"];

export default function APIKeysTab({ plan }: Props) {
  const [keys, setKeys] = useState<ApiKeyMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eligible = useMemo(() => ELIGIBLE_PLANS.includes(plan), [plan]);

  const loadKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/api-keys", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Failed to load API keys.");
        setKeys([]);
      } else {
        setKeys(data.keys ?? []);
      }
    } catch {
      setError("Network error while loading API keys.");
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eligible) {
      void loadKeys();
    } else {
      setLoading(false);
      setKeys([]);
    }
  }, [eligible]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setCreatedKey(null);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Failed to create API key.");
      } else {
        setCreatedKey(data.apiKey ?? null);
        setNewKeyName("");
        await loadKeys();
      }
    } catch {
      setError("Network error while creating API key.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Failed to revoke API key.");
      } else {
        await loadKeys();
      }
    } catch {
      setError("Network error while revoking API key.");
    } finally {
      setRevokingId(null);
    }
  };

  const copyCreatedKey = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
  };

  if (!eligible) {
    return (
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-2 font-mono">
          API keys
        </p>
        <h3 className="text-[18px] font-bold text-cs-ink mb-2">
          Upgrade required
        </h3>
        <p className="text-[13px] text-cs-ink3 leading-[1.65]">
          API keys are available on Protocol API and Risk Analytics plans. Go to
          Billing to upgrade and unlock Bearer-key access for docs endpoints.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-2 font-mono">
          API keys
        </p>
        <h3 className="text-[18px] font-bold text-cs-ink mb-2">Create API key</h3>
        <p className="text-[13px] text-cs-ink3 leading-[1.65] mb-4">
          Use this key as <code>Authorization: Bearer &lt;key&gt;</code> for API
          docs endpoints. The full key is shown only once.
        </p>

        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2.5">
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Optional key name (e.g. prod-backend)"
            className="flex-1 border-[1.5px] border-cs-border rounded-cs px-3 py-2.5 text-sm bg-white outline-none focus:border-cs-green"
            maxLength={60}
          />
          <button
            type="submit"
            disabled={creating}
            className="text-sm font-bold px-4 py-2.5 rounded-[9px] bg-cs-green text-white hover:bg-cs-green-d transition disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create key"}
          </button>
        </form>

        {createdKey && (
          <div className="mt-4 rounded-cs border border-cs-green/25 bg-cs-green/[.06] p-3.5">
            <p className="text-[12px] font-semibold text-cs-green-d mb-1.5">
              New key (shown once)
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
              <code className="text-[12px] font-mono text-cs-ink break-all flex-1">
                {createdKey}
              </code>
              <button
                type="button"
                onClick={copyCreatedKey}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-cs-green/30 text-cs-green-d hover:bg-cs-green/[.12] transition"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[18px] font-bold text-cs-ink">Your API keys</h3>
          {loading ? (
            <span className="text-xs text-cs-ink4">Loading…</span>
          ) : (
            <span className="text-xs text-cs-ink4">{keys.length} keys</span>
          )}
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && keys.length === 0 ? (
          <p className="text-[13px] text-cs-ink3">
            No API keys yet. Create your first key above.
          </p>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div
                key={k.id}
                className="rounded-cs border border-cs-border px-3.5 py-3 flex flex-col sm:flex-row sm:items-center gap-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-cs-ink truncate">
                    {k.name || "Unnamed key"}
                  </p>
                  <p className="text-[12px] font-mono text-cs-ink3 truncate">
                    {k.prefix}••••••••••
                  </p>
                  <p className="text-[11px] text-cs-ink4">
                    Created {new Date(k.createdAt).toLocaleString()}
                    {k.lastUsedAt ? ` · Last used ${new Date(k.lastUsedAt).toLocaleString()}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[.05em] px-2 py-[3px] rounded-full ${
                      k.active
                        ? "bg-cs-green/[.12] text-cs-green-d"
                        : "bg-[#f3f3f3] text-cs-ink4"
                    }`}
                  >
                    {k.active ? "Active" : "Revoked"}
                  </span>
                  {k.active && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(k.id)}
                      disabled={revokingId === k.id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {revokingId === k.id ? "Revoking…" : "Revoke"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

