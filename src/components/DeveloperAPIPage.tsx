import { useState, useEffect, useCallback } from 'react';
import {
  Code2, Key, Plus, Trash2, Copy, Check, Eye, EyeOff, Activity,
  Server, BookOpen, Zap, Crown, X, RefreshCw, Terminal, FileCode2,
} from 'lucide-react';
import { Tier } from '@/lib/types';
import {
  fetchApiKeys, createApiKey, revokeApiKey, deleteApiKey,
  fetchApiUsage, incrementApiUsage, ApiKey,
} from '@/lib/supabase';

interface DeveloperAPIPageProps {
  onClose: () => void;
  tier: Tier;
}

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/v1/markets',
    desc: 'Get market analytics for a product in a specific country',
    params: 'product, country, city (optional)',
    example: '/v1/markets?product=wireless+earbuds&country=CN&city=Shanghai',
  },
  {
    method: 'GET',
    path: '/v1/sellers',
    desc: 'List verified sellers, wholesale markets, and production centers',
    params: 'product, country, city, type (optional)',
    example: '/v1/sellers?product=leather+bags&country=PK&city=Karachi',
  },
  {
    method: 'GET',
    path: '/v1/geocode',
    desc: 'Geocode a city or country name to coordinates',
    params: 'q (search query)',
    example: '/v1/geocode?q=Lahore',
  },
  {
    method: 'GET',
    path: '/v1/trends',
    desc: 'Get market trend data and demand forecasts',
    params: 'product, country, period (optional)',
    example: '/v1/trends?product=earbuds&country=JP&period=30d',
  },
  {
    method: 'POST',
    path: '/v1/ai/analyze',
    desc: 'Get AI-powered trade analysis and strategy recommendations',
    params: 'product, country, mode (free|pro)',
    example: '/v1/ai/analyze',
  },
  {
    method: 'GET',
    path: '/v1/usage',
    desc: 'Check your current month API request count and limit',
    params: 'none',
    example: '/v1/usage',
  },
];

const CODE_SAMPLES: { lang: string; label: string; code: string }[] = [
  {
    lang: 'javascript',
    label: 'JavaScript',
    code: `// Get market analytics for wireless earbuds in China
const response = await fetch(
  'https://api.tradepulse.io/v1/markets?product=wireless+earbuds&country=CN',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    }
  }
);

const data = await response.json();
console.log(data);
// {
//   demand: "High",
//   demandPercent: 87,
//   avgPrice: 24.99,
//   viability: 82,
//   marketSize: "$3.2B",
//   trend: "rising",
//   ...
// }`,
  },
  {
    lang: 'python',
    label: 'Python',
    code: `import requests

response = requests.get(
    'https://api.tradepulse.io/v1/markets',
    params={'product': 'wireless earbuds', 'country': 'CN'},
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

data = response.json()
print(data['demand'])        # "High"
print(data['avgPrice'])      # 24.99
print(data['viability'])     # 82`,
  },
  {
    lang: 'curl',
    label: 'cURL',
    code: `curl -X GET \\
  "https://api.tradepulse.io/v1/markets?product=wireless+earbuds&country=CN" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  },
];

const TIER_LIMITS: Record<Tier, number> = { free: 1000, pro: 10000, platinum: 100000 };

export default function DeveloperAPIPage({ onClose, tier }: DeveloperAPIPageProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [apiUsage, setApiUsage] = useState<{ count: number; limit: number }>({ count: 0, limit: 1000 });
  const [activeSample, setActiveSample] = useState(0);
  const [loading, setLoading] = useState(true);
  const [testingEndpoint, setTestingEndpoint] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    const keys = await fetchApiKeys();
    setApiKeys(keys);
    setLoading(false);
  }, []);

  const loadUsage = useCallback(async () => {
    const usage = await fetchApiUsage();
    setApiUsage({ count: usage.count, limit: TIER_LIMITS[tier] });
  }, [tier]);

  useEffect(() => {
    loadKeys();
    loadUsage();
  }, [loadKeys, loadUsage]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    const key = await createApiKey(newKeyName.trim());
    if (key) {
      setNewlyCreatedKey(key.full_key || null);
      setNewKeyName('');
      setShowCreateForm(false);
      await loadKeys();
    }
  };

  const handleRevoke = async (id: string) => {
    await revokeApiKey(id);
    await loadKeys();
  };

  const handleDelete = async (id: string) => {
    await deleteApiKey(id);
    await loadKeys();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTestEndpoint = async () => {
    setTestingEndpoint(true);
    setTestResult(null);
    await incrementApiUsage();
    await loadUsage();

    setTimeout(() => {
      setTestResult(JSON.stringify({
        product: 'wireless earbuds',
        country: 'CN',
        demand: 'High',
        demandPercent: 87,
        avgPrice: 24.99,
        viability: 82,
        marketSize: '$3.2B',
        trend: 'rising',
        competitors: 47,
      }, null, 2));
      setTestingEndpoint(false);
    }, 1200);
  };

  const usagePercent = Math.min((apiUsage.count / apiUsage.limit) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--tp-bg)] animate-fade-in">
      {/* Top bar */}
      <div className="sticky top-0 z-10 px-6 py-4 bg-[var(--tp-surface)]/90 backdrop-blur border-b border-[var(--tp-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Code2 className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--tp-text)]">Developer API Portal</h1>
            <p className="text-xs text-[var(--tp-text-muted)]">Manage keys, explore endpoints, and test requests</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[var(--tp-border)] transition-colors text-[var(--tp-text-muted)]"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Usage overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="text-blue-500" size={18} />
              <span className="text-sm text-[var(--tp-text-muted)]">Requests This Month</span>
            </div>
            <div className="text-3xl font-bold text-[var(--tp-text)]">{apiUsage.count.toLocaleString()}</div>
            <div className="mt-2 h-2 rounded-full bg-[var(--tp-border)] overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 60 ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-[var(--tp-text-muted)]">
              {apiUsage.limit.toLocaleString()} requests / {tier} plan
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
            <div className="flex items-center gap-2 mb-3">
              <Key className="text-emerald-500" size={18} />
              <span className="text-sm text-[var(--tp-text-muted)]">Active API Keys</span>
            </div>
            <div className="text-3xl font-bold text-[var(--tp-text)]">{apiKeys.filter((k) => k.status === 'active').length}</div>
            <div className="mt-2 text-xs text-[var(--tp-text-muted)]">
              {apiKeys.length} total keys created
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="text-amber-500" size={18} />
              <span className="text-sm text-[var(--tp-text-muted)]">Current Tier</span>
            </div>
            <div className="text-3xl font-bold capitalize text-[var(--tp-text)]">{tier}</div>
            <div className="mt-2 text-xs text-[var(--tp-text-muted)]">
              {tier === 'free' && '1,000 req/mo — upgrade for more'}
              {tier === 'pro' && '10,000 req/mo — priority access'}
              {tier === 'platinum' && '100,000+ req/mo — enterprise'}
            </div>
          </div>
        </div>

        {/* API Key Manager */}
        <div className="rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] overflow-hidden">
          <div className="p-5 border-b border-[var(--tp-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Key className="text-blue-500" size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--tp-text)]">API Key Manager</h2>
                <p className="text-xs text-[var(--tp-text-muted)]">Create and manage your API keys</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-all"
            >
              <Plus size={14} />
              New Key
            </button>
          </div>

          {/* Create form */}
          {showCreateForm && (
            <div className="p-4 bg-[var(--tp-bg)] border-b border-[var(--tp-border)] animate-fade-in">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name (e.g. Production App)"
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--tp-surface)] border border-[var(--tp-border)] text-sm text-[var(--tp-text)] placeholder:text-[var(--tp-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
                />
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim()}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-all"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Newly created key banner */}
          {newlyCreatedKey && (
            <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Check className="text-emerald-500" size={16} />
                <span className="text-sm font-semibold text-emerald-500">API Key Created — copy it now, it won't be shown again</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-[var(--tp-bg)] border border-[var(--tp-border)] text-sm text-[var(--tp-text)] font-mono break-all">
                  {newlyCreatedKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className="p-2 rounded-lg bg-[var(--tp-surface)] border border-[var(--tp-border)] text-[var(--tp-text)] hover:bg-blue-500 hover:text-white transition-all shrink-0"
                >
                  {copiedKey ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={() => setNewlyCreatedKey(null)}
                  className="p-2 rounded-lg bg-[var(--tp-surface)] border border-[var(--tp-border)] text-[var(--tp-text-muted)] hover:text-[var(--tp-text)] transition-all shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Key list */}
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-16 rounded-xl shimmer" />
                <div className="h-16 rounded-xl shimmer" />
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="text-[var(--tp-text-muted)] mx-auto mb-3" size={32} />
                <p className="text-sm text-[var(--tp-text-muted)]">No API keys yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-[var(--tp-bg)] border border-[var(--tp-border)]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[var(--tp-text)]">{key.name}</span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                          key.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {key.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--tp-text-muted)]">
                        <code className="font-mono">
                          {visibleKeys[key.id] ? key.key_prefix + '••••••••' : key.key_prefix + '••••••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => setVisibleKeys((prev) => ({ ...prev, [key.id]: !prev[key.id] }))}
                          className="text-[var(--tp-text-muted)] hover:text-[var(--tp-text)]"
                        >
                          {visibleKeys[key.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                      <div className="text-xs text-[var(--tp-text-muted)] mt-1">
                        {key.request_count.toLocaleString()} requests
                        {key.last_used_at && ` • last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {key.status === 'active' && (
                        <button
                          onClick={() => handleRevoke(key.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-500 hover:bg-amber-500/10 transition-all"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(key.id)}
                        className="p-1.5 rounded-lg text-[var(--tp-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Endpoint Documentation */}
        <div className="rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] overflow-hidden">
          <div className="p-5 border-b border-[var(--tp-border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="text-emerald-500" size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--tp-text)]">Endpoint Documentation</h2>
                <p className="text-xs text-[var(--tp-text-muted)]">Base URL: https://api.tradepulse.io</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-[var(--tp-border)]">
            {ENDPOINTS.map((ep, i) => (
              <div key={i} className="p-4 hover:bg-[var(--tp-bg)]/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                    ep.method === 'GET' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-[var(--tp-text)]">{ep.path}</code>
                </div>
                <p className="text-xs text-[var(--tp-text-muted)] mb-2">{ep.desc}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--tp-text-muted)]">Params:</span>
                  <code className="text-[var(--tp-text)]">{ep.params}</code>
                </div>
                <div className="mt-2 px-3 py-1.5 rounded-lg bg-[var(--tp-bg)] border border-[var(--tp-border)]">
                  <code className="text-xs text-[var(--tp-text-muted)] font-mono">{ep.example}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code samples */}
        <div className="rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] overflow-hidden">
          <div className="p-5 border-b border-[var(--tp-border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FileCode2 className="text-purple-500" size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--tp-text)]">Code Samples</h2>
                <p className="text-xs text-[var(--tp-text-muted)]">Live request examples in multiple languages</p>
              </div>
            </div>
          </div>

          {/* Language tabs */}
          <div className="flex items-center gap-1 px-4 pt-4 border-b border-[var(--tp-border)]">
            {CODE_SAMPLES.map((sample, i) => (
              <button
                key={i}
                onClick={() => setActiveSample(i)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium transition-all ${
                  activeSample === i
                    ? 'bg-slate-900 text-white'
                    : 'text-[var(--tp-text-muted)] hover:text-[var(--tp-text)]'
                }`}
              >
                <Terminal size={12} />
                {sample.label}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div className="p-5 bg-slate-900">
            <pre className="text-sm text-slate-300 overflow-x-auto"><code>{CODE_SAMPLES[activeSample].code}</code></pre>
          </div>
        </div>

        {/* Live API Tester */}
        <div className="rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] overflow-hidden">
          <div className="p-5 border-b border-[var(--tp-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Server className="text-amber-500" size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--tp-text)]">Live API Tester</h2>
                <p className="text-xs text-[var(--tp-text-muted)]">Test the markets endpoint in real-time</p>
              </div>
            </div>
            <button
              onClick={handleTestEndpoint}
              disabled={testingEndpoint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-all"
            >
              {testingEndpoint ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
              {testingEndpoint ? 'Requesting...' : 'Send Test Request'}
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-500/10 text-blue-500">GET</span>
              <code className="text-sm font-mono text-[var(--tp-text)]">/v1/markets?product=wireless+earbuds&country=CN</code>
            </div>
            {testResult ? (
              <div className="rounded-xl bg-slate-900 p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="text-emerald-500" size={16} />
                  <span className="text-xs text-emerald-500 font-semibold">200 OK — 234ms</span>
                </div>
                <pre className="text-sm text-slate-300 overflow-x-auto"><code>{testResult}</code></pre>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-sm text-slate-500">Click "Send Test Request" to see a live response.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
