import React, { useEffect, useState } from "react";

export function KeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = `${window.location.origin}/v1`;

  const fetchKeys = async () => {
    const res = await fetch("/api/keys");
    const data = (await res.json()) as any;
    setKeys(data.keys || []);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1400);
  };

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = (await res.json()) as any;
      setCreatedKey(data.key);
      setNewKeyName("");
      fetchKeys();
    } finally {
      setLoading(false);
    }
  };

  const revokeKey = async (id: string) => {
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    fetchKeys();
  };

  return (
    <div className="dashboard-page">
      <header className="page-header-card">
        <p>Access Control</p>
        <h1>API Keys</h1>
        <span>Generate unified API keys that route across all providers.</span>
      </header>

      <section className="data-card animate-fade-in">
        <div className="card-heading">
          <div>
            <p>New Credential</p>
            <h2>Create New Key</h2>
          </div>
        </div>

        <div className="form-row">
          <input
            type="text"
            placeholder="Key name, e.g. Cline, OpenCode, Production"
            value={newKeyName}
            onChange={(event) => setNewKeyName(event.currentTarget.value)}
            onKeyDown={(event) => event.key === "Enter" && createKey()}
            className="field-input"
          />
          <button onClick={createKey} disabled={loading || !newKeyName.trim()} className="primary-button">
            {loading ? "Creating..." : "Generate Key"}
          </button>
        </div>

        {createdKey && (
          <div className="secret-result">
            <p>Key created. Copy it now because the full value is only shown once.</p>
            <code>{createdKey}</code>
            <button onClick={() => copyValue("createdKey", createdKey)} className="secondary-button">
              {copied === "createdKey" ? "Copied" : "Copy Key"}
            </button>
          </div>
        )}
      </section>

      <section className="data-card animate-fade-in">
        <div className="card-heading">
          <div>
            <p>Credentials</p>
            <h2>Active Keys</h2>
          </div>
          <span>{keys.length} active</span>
        </div>

        {keys.length === 0 ? (
          <p className="empty-state">No API keys yet. Create one above to get started.</p>
        ) : (
          <div className="key-list">
            {keys.map((key) => (
              <div key={key.id} className="key-row">
                <div>
                  <p>{key.name}</p>
                  <code>{key.prefix}</code>
                </div>
                <div className="key-actions">
                  <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                  {key.last_used && <span>Last used {new Date(key.last_used).toLocaleDateString()}</span>}
                  <button onClick={() => revokeKey(key.id)} className="danger-button">Revoke</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="data-card animate-fade-in">
        <div className="card-heading">
          <div>
            <p>Client Setup</p>
            <h2>OpenAI-compatible usage</h2>
          </div>
          <button className="secondary-button" onClick={() => copyValue("baseUrl", baseUrl)}>
            {copied === "baseUrl" ? "Copied" : "Copy Base URL"}
          </button>
        </div>

        <div className="copy-row light">
          <label>Base URL</label>
          <code>{baseUrl}</code>
          <button onClick={() => copyValue("baseUrlRow", baseUrl)}>{copied === "baseUrlRow" ? "Copied" : "Copy"}</button>
        </div>

        <pre className="code-block">
{`curl ${baseUrl}/chat/completions \
  -H "Authorization: Bearer nxs_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello"}]}'`}
        </pre>
      </section>
    </div>
  );
}
