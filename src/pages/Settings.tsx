import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useActivePair, AVAILABLE_PAIRS } from "@/providers/TradingPairContext";
import DashboardLayout from "@/components/DashboardLayout";
import {
  User, Shield, Bell, Globe, Key, Smartphone, Save, CheckCircle2,
  Plus, Trash2, X,
} from "lucide-react";

// ── Exchange Key Manager ──────────────────────────────────────────────
function ExchangeKeyManager() {
  const utils = trpc.useUtils();
  const { data: keys, isLoading } = trpc.exchangeKey.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    exchange: "binance" as "binance" | "okx" | "bybit" | "coinbase" | "kraken",
    label: "",
    apiKey: "",
    apiSecret: "",
    passphrase: "",
    isTestnet: false,
  });
  const [formError, setFormError] = useState("");

  const addMutation = trpc.exchangeKey.add.useMutation({
    onSuccess: () => {
      utils.exchangeKey.list.invalidate();
      setShowForm(false);
      setForm({ exchange: "binance", label: "", apiKey: "", apiSecret: "", passphrase: "", isTestnet: false });
      setFormError("");
    },
    onError: (e) => setFormError(e.message),
  });

  const removeMutation = trpc.exchangeKey.remove.useMutation({
    onSuccess: () => utils.exchangeKey.list.invalidate(),
  });

  const handleAdd = () => {
    if (!form.label.trim()) { setFormError("Label is required"); return; }
    if (!form.apiKey.trim()) { setFormError("API Key is required"); return; }
    if (!form.apiSecret.trim()) { setFormError("API Secret is required"); return; }
    setFormError("");
    addMutation.mutate(form);
  };

  const EXCHANGES = ["binance", "okx", "bybit", "coinbase", "kraken"] as const;
  const needsPassphrase = ["okx", "coinbase", "kraken"].includes(form.exchange);

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">Exchange API Keys</h4>
        <button
          onClick={() => { setShowForm(!showForm); setFormError(""); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: showForm ? "var(--navy-highlight)" : "var(--lime-primary)", color: showForm ? "var(--grey-dim)" : "var(--navy-base)" }}
        >
          {showForm ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add Key</>}
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl mb-4 space-y-3" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)" }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Exchange</label>
              <select
                value={form.exchange}
                onChange={(e) => setForm({ ...form, exchange: e.target.value as typeof form.exchange })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", color: "white" }}
              >
                {EXCHANGES.map((ex) => <option key={ex} value={ex}>{ex.charAt(0).toUpperCase() + ex.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Binance Testnet"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", color: "white" }}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>API Key</label>
            <input
              type="text"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder="Paste your API key"
              className="w-full px-3 py-2 rounded-lg text-sm font-mono-data outline-none"
              style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", color: "white" }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>API Secret</label>
            <input
              type="password"
              value={form.apiSecret}
              onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
              placeholder="Paste your API secret"
              className="w-full px-3 py-2 rounded-lg text-sm font-mono-data outline-none"
              style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", color: "white" }}
            />
          </div>
          {needsPassphrase && (
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Passphrase</label>
              <input
                type="password"
                value={form.passphrase}
                onChange={(e) => setForm({ ...form, passphrase: e.target.value })}
                placeholder="Required for OKX / Coinbase / Kraken"
                className="w-full px-3 py-2 rounded-lg text-sm font-mono-data outline-none"
                style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", color: "white" }}
              />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isTestnet}
              onChange={(e) => setForm({ ...form, isTestnet: e.target.checked })}
              className="w-4 h-4 rounded"
              style={{ accentColor: "var(--lime-primary)" }}
            />
            <span className="text-sm" style={{ color: "var(--grey-dim)" }}>Testnet key (safe for testing)</span>
          </label>
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <button
            onClick={handleAdd}
            disabled={addMutation.isPending}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: "var(--lime-primary)", color: "var(--navy-base)" }}
          >
            {addMutation.isPending ? "Saving..." : "Save API Key"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {isLoading ? (
          <div className="h-12 rounded-xl animate-pulse" style={{ background: "var(--navy-base)" }} />
        ) : keys?.length === 0 ? (
          <div className="p-4 rounded-xl text-center text-sm" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "var(--grey-dim)" }}>
            No API keys added yet. Click "Add Key" to connect an exchange.
          </div>
        ) : keys?.map((k) => (
          <div key={k.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)" }}>
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
              <div>
                <div className="text-sm font-medium text-white">{k.apiKeyLabel}</div>
                <div className="text-xs flex items-center gap-2" style={{ color: "var(--grey-dim)" }}>
                  <span className="capitalize">{k.exchange}</span>
                  {k.isTestnet && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}>TESTNET</span>}
                  {k.isActive && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: "rgba(16,185,129,0.2)", color: "#10B981" }}>ACTIVE</span>}
                </div>
              </div>
            </div>
            <button
              onClick={() => { if (confirm("Remove this API key?")) removeMutation.mutate({ id: k.id }); }}
              disabled={removeMutation.isPending}
              className="p-1.5 rounded-lg"
              style={{ color: "#EF4444" }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────────────────────
export default function Settings() {
  const { user, refresh } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "preferences">("profile");
  const [showSuccess, setShowSuccess] = useState(false);

  const { setActivePair } = useActivePair();

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setActivePair(preferences.defaultPair);
      refresh();
    },
  });

  const [profile, setProfile] = useState({ name: "", email: "", timezone: "UTC", language: "en" });
  const [security, setSecurity] = useState({ twoFactor: false, loginNotifications: true, tradingPin: false });
  const [notifications, setNotifications] = useState({ signalAlerts: true, tradeExecutions: true, priceAlerts: true, newsDigest: false, weeklyReport: true });
  const [preferences, setPreferences] = useState({ defaultExchange: "binance", defaultPair: "BTC/USDT", riskLevel: "medium" });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        timezone: (user.preferences as any)?.timezone || "UTC",
        language: (user.preferences as any)?.language || "en",
      });
      setSecurity({ twoFactor: user.twoFactorEnabled || false, loginNotifications: true, tradingPin: false });
      const p = user.preferences as any;
      if (p) {
        setPreferences({ defaultExchange: p.defaultExchange || "binance", defaultPair: p.defaultPair || "BTC/USDT", riskLevel: p.riskLevel || "medium" });
        setNotifications({ signalAlerts: p.notificationsEnabled !== false, tradeExecutions: true, priceAlerts: true, newsDigest: false, weeklyReport: true });
      }
    }
  }, [user]);

  const handleSave = () => {
    updateProfileMutation.mutate({
      name: profile.name,
      twoFactorEnabled: security.twoFactor,
      preferences: {
        defaultExchange: preferences.defaultExchange,
        defaultPair: preferences.defaultPair,
        riskLevel: preferences.riskLevel as "low" | "medium" | "high",
        notificationsEnabled: notifications.signalAlerts,
        timezone: profile.timezone,
        language: profile.language,
      },
    });
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "security" as const, label: "Security", icon: Shield },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "preferences" as const, label: "Preferences", icon: Globe },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--grey-dim)" }}>Manage your account and preferences</p>
        </div>

        {/* Profile Header */}
        <div className="card-surface p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold" style={{ background: "var(--navy-highlight)", color: "var(--lime-primary)" }}>
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{user?.name ?? "User"}</h2>
            <p className="text-sm" style={{ color: "var(--grey-dim)" }}>{user?.email ?? ""}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(210, 249, 0, 0.1)", color: "var(--lime-primary)" }}>
                {user?.subscriptionTier ?? "free"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider capitalize" style={{ background: "var(--navy-highlight)", color: "var(--grey-dim)" }}>
                {user?.role ?? "user"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="sm:w-48 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: activeTab === tab.id ? "var(--navy-highlight)" : "transparent", color: activeTab === tab.id ? "var(--lime-primary)" : "var(--grey-dim)" }}
              >
                <tab.icon className="w-[18px] h-[18px]" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 card-surface p-6">

            {activeTab === "profile" && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
                  Profile Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Display Name</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Email</label>
                    <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Timezone</label>
                    <select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }}>
                      <option value="UTC">UTC</option>
                      <option value="EST">EST (New York)</option>
                      <option value="CST">CST (Chicago)</option>
                      <option value="PST">PST (Los Angeles)</option>
                      <option value="GMT">GMT (London)</option>
                      <option value="CET">CET (Berlin)</option>
                      <option value="JST">JST (Tokyo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Language</label>
                    <select value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }}>
                      <option value="en">English</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
                  Security Settings
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Two-Factor Authentication", desc: "Add an extra layer of security to your account", icon: Smartphone, key: "twoFactor" as const },
                    { label: "Login Notifications", desc: "Get notified of new login attempts", icon: Bell, key: "loginNotifications" as const },
                    { label: "Trading PIN", desc: "Require PIN confirmation for trades", icon: Key, key: "tradingPin" as const },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
                        <div>
                          <div className="text-sm font-medium text-white">{item.label}</div>
                          <div className="text-xs" style={{ color: "var(--grey-dim)" }}>{item.desc}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSecurity({ ...security, [item.key]: !security[item.key] })}
                        className="w-11 h-6 rounded-full transition-all relative"
                        style={{ background: security[item.key] ? "var(--lime-primary)" : "var(--navy-highlight)" }}
                      >
                        <div className={`w-4 h-4 rounded-full absolute top-1 transition-all ${security[item.key] ? "left-6" : "left-1"}`} style={{ background: "white" }} />
                      </button>
                    </div>
                  ))}
                </div>
                <ExchangeKeyManager />
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "AI Signal Alerts", desc: "Get notified when new trading signals are generated", key: "signalAlerts" as const },
                    { label: "Trade Executions", desc: "Notifications for order fills and position updates", key: "tradeExecutions" as const },
                    { label: "Price Alerts", desc: "Alerts when assets hit your price targets", key: "priceAlerts" as const },
                    { label: "Daily News Digest", desc: "Receive a daily summary of market news", key: "newsDigest" as const },
                    { label: "Weekly Performance Report", desc: "Weekly portfolio performance summary", key: "weeklyReport" as const },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
                      <div>
                        <div className="text-sm font-medium text-white">{item.label}</div>
                        <div className="text-xs" style={{ color: "var(--grey-dim)" }}>{item.desc}</div>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                        className="w-11 h-6 rounded-full transition-all relative"
                        style={{ background: notifications[item.key] ? "var(--lime-primary)" : "var(--navy-highlight)" }}
                      >
                        <div className={`w-4 h-4 rounded-full absolute top-1 transition-all ${notifications[item.key] ? "left-6" : "left-1"}`} style={{ background: "white" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5" style={{ color: "var(--lime-primary)" }} />
                  Trading Preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Default Exchange</label>
                    <select value={preferences.defaultExchange} onChange={(e) => setPreferences({ ...preferences, defaultExchange: e.target.value })} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }}>
                      <option value="binance">Binance</option>
                      <option value="bybit">Bybit</option>
                      <option value="okx">OKX</option>
                      <option value="coinbase">Coinbase</option>
                      <option value="kraken">Kraken</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Default Trading Pair</label>
                    <select value={preferences.defaultPair} onChange={(e) => setPreferences({ ...preferences, defaultPair: e.target.value })} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }}>
                      {AVAILABLE_PAIRS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--grey-dim)" }}>Default Risk Level</label>
                    <select value={preferences.riskLevel} onChange={(e) => setPreferences({ ...preferences, riskLevel: e.target.value })} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--navy-base)", border: "1px solid var(--navy-highlight)", color: "white" }}>
                      <option value="low">Conservative</option>
                      <option value="medium">Balanced</option>
                      <option value="high">Aggressive</option>
                    </select>
                  </div>

                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-6 mt-6 flex items-center gap-4" style={{ borderTop: "1px solid var(--navy-highlight)" }}>
              <button onClick={handleSave} disabled={updateProfileMutation.isPending} className="btn-lime flex items-center gap-2 text-sm disabled:opacity-50">
                <Save className="w-4 h-4" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
              {showSuccess && (
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--lime-primary)" }}>
                  <CheckCircle2 className="w-4 h-4" />
                  Changes saved successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
