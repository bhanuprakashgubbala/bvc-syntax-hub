'use client';

import { useState, useEffect } from 'react';
import { 
  Terminal, 
  Server, 
  Code2, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Check, 
  X, 
  Cpu, 
  Layers, 
  Clock, 
  Radio, 
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function HodCodeSpaceManagement() {
  const [activeTab, setActiveTab] = useState('servers'); // 'servers' | 'languages' | 'settings'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Configuration State
  const [servers, setServers] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [settings, setSettings] = useState({
    executionTimeoutSec: 10,
    defaultServerId: 'default',
    defaultLanguageId: 'python',
    allowStudentCustomStdin: true,
    enableAiAssistance: true,
    systemAnnouncement: ''
  });

  // Modal States
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [isEditServerOpen, setIsEditServerOpen] = useState(false);
  const [editingServer, setEditingServer] = useState(null);

  const [isAddLangOpen, setIsAddLangOpen] = useState(false);
  const [isEditLangOpen, setIsEditLangOpen] = useState(false);
  const [editingLang, setEditingLang] = useState(null);

  // Forms
  const [newServerForm, setNewServerForm] = useState({
    id: '',
    name: '',
    badge: 'Cloud Fast',
    desc: 'Distributed Execution Node',
    ping: '25ms',
    protocol: 'judge0',
    isDefault: false,
    iconColor: 'text-cyan-400'
  });

  const [newLangForm, setNewLangForm] = useState({
    id: '',
    name: '',
    version: '1.0.0',
    extension: '.ext',
    defaultCode: '// Solution\n',
    colorText: 'text-violet-400'
  });

  // Load active configuration from API
  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/codespace/config');
      const data = await res.json();
      if (data.success) {
        setServers(data.servers || []);
        setLanguages(data.languages || []);
        if (data.settings) setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error loading Code Space config:', err);
      setMessage({ type: 'error', text: 'Failed to load Code Space settings from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Dispatch Action to API
  const handleApiAction = async (action, payload) => {
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/codespace/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setServers(data.servers || []);
        setLanguages(data.languages || []);
        if (data.settings) setSettings(data.settings);
        return true;
      } else {
        setMessage({ type: 'error', text: data.error || 'Operation failed.' });
        return false;
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network communication error.' });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // 1. Server Handlers
  const handleAddServer = async (e) => {
    e.preventDefault();
    const ok = await handleApiAction('ADD_SERVER', newServerForm);
    if (ok) {
      setIsAddServerOpen(false);
      setNewServerForm({
        id: '',
        name: '',
        badge: 'Cloud Fast',
        desc: 'Distributed Execution Node',
        ping: '25ms',
        protocol: 'judge0',
        isDefault: false,
        iconColor: 'text-cyan-400'
      });
    }
  };

  const handleEditServerSubmit = async (e) => {
    e.preventDefault();
    if (!editingServer) return;
    const ok = await handleApiAction('EDIT_SERVER', editingServer);
    if (ok) {
      setIsEditServerOpen(false);
      setEditingServer(null);
    }
  };

  const handleDeleteServer = async (id, name) => {
    if (!confirm(`Are you sure you want to remove '${name}' from Code Space?`)) return;
    await handleApiAction('DELETE_SERVER', { id });
  };

  // 2. Language Handlers
  const handleAddLanguage = async (e) => {
    e.preventDefault();
    const ok = await handleApiAction('ADD_LANGUAGE', newLangForm);
    if (ok) {
      setIsAddLangOpen(false);
      setNewLangForm({
        id: '',
        name: '',
        version: '1.0.0',
        extension: '.ext',
        defaultCode: '// Solution\n',
        colorText: 'text-violet-400'
      });
    }
  };

  const handleEditLangSubmit = async (e) => {
    e.preventDefault();
    if (!editingLang) return;
    const ok = await handleApiAction('EDIT_LANGUAGE', editingLang);
    if (ok) {
      setIsEditLangOpen(false);
      setEditingLang(null);
    }
  };

  const handleDeleteLanguage = async (id, name) => {
    if (!confirm(`Are you sure you want to remove '${name}' from Code Space?`)) return;
    await handleApiAction('DELETE_LANGUAGE', { id });
  };

  // 3. Settings Handlers
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await handleApiAction('UPDATE_SETTINGS', settings);
  };

  const handleResetDefaults = async () => {
    if (!confirm('Are you sure you want to reset Code Space to default institutional settings?')) return;
    await handleApiAction('RESET_DEFAULTS', {});
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Department Control
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Synchronized with All Students & Faculty
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5 mt-1">
            <Terminal className="w-6 h-6 text-violet-400" />
            Code Space Configuration & Multi-Server Upgrades
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-3xl">
            Upgrade the Code Space environment: manage compiler servers, add new programming languages, customize default code templates, and manage execution timeouts. All modifications take effect immediately for all students and faculty.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadConfig}
            disabled={loading || actionLoading}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            title="Refresh Configuration"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm shadow-md animate-in fade-in duration-200 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-[#13131c] rounded-2xl border border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab('servers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'servers'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Compiler Servers ({servers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('languages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'languages'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Programming Languages ({languages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Global Controls & Policies</span>
        </button>
      </div>

      {/* TAB 1: COMPILER SERVERS */}
      {activeTab === 'servers' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13131c] p-4 rounded-2xl border border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-violet-400" />
                Active Execution Servers
              </h3>
              <p className="text-xs text-zinc-400">
                Servers available in student and faculty Code Space server dropdowns
              </p>
            </div>

            <button
              onClick={() => setIsAddServerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Server</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((srv) => (
              <div 
                key={srv.id} 
                className="bg-[#13131c] border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-md relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Cpu className={`w-4 h-4 ${srv.iconColor || 'text-cyan-400'}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{srv.name}</span>
                          {srv.isDefault && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              DEFAULT
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500">ID: {srv.id}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {srv.badge}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mb-3">{srv.desc}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 mb-4">
                    <div>
                      <span className="text-zinc-500 block">Latency:</span>
                      <span className="text-emerald-400 font-bold">{srv.ping || '30ms'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Protocol:</span>
                      <span className="text-zinc-300 font-bold capitalize">{srv.protocol || 'Judge0'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Operational
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingServer({ ...srv });
                        setIsEditServerOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Server Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteServer(srv.id, srv.name)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="Delete Server"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: PROGRAMMING LANGUAGES */}
      {activeTab === 'languages' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13131c] p-4 rounded-2xl border border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-violet-400" />
                Active Programming Languages & Default Code Templates
              </h3>
              <p className="text-xs text-zinc-400">
                Languages supported in Code Space with HOD-curated starting solution templates
              </p>
            </div>

            <button
              onClick={() => setIsAddLangOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Programming Language</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#13131c] border border-zinc-800/80 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181824] text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Identifier</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Extension</th>
                    <th className="py-3 px-4">Starter Template Preview</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {languages.map((lang) => (
                    <tr key={lang.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${lang.colorDot || 'bg-violet-400'}`}></span>
                        <span>{lang.name}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-semibold">{lang.id}</td>
                      <td className="py-3 px-4 text-zinc-300">{lang.version || 'Latest'}</td>
                      <td className="py-3 px-4 text-violet-400 font-bold">{lang.extension}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-zinc-500 font-mono text-[10px]">
                        {lang.defaultCode?.split('\n')[0] || '// Code'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingLang({ ...lang });
                              setIsEditLangOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-violet-400" />
                            <span>Edit Template</span>
                          </button>
                          <button
                            onClick={() => handleDeleteLanguage(lang.id, lang.name)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                            title="Remove Language"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: GLOBAL SETTINGS & POLICIES */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-[#13131c] border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-violet-400" />
              Code Space Institutional Policies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Execution Timeout (Seconds)
                </label>
                <input
                  type="number"
                  min={2}
                  max={60}
                  value={settings.executionTimeoutSec || 10}
                  onChange={(e) => setSettings({ ...settings, executionTimeoutSec: parseInt(e.target.value, 10) || 10 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-violet-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Maximum wall-clock execution time before timeout</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Default Starting Compiler Server
                </label>
                <select
                  value={settings.defaultServerId || 'default'}
                  onChange={(e) => setSettings({ ...settings, defaultServerId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                >
                  {servers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-500 mt-1 block">Assigned by default to new student executions</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Default Language for New Files
                </label>
                <select
                  value={settings.defaultLanguageId || 'python'}
                  onChange={(e) => setSettings({ ...settings, defaultLanguageId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                >
                  {languages.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.extension})</option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-500 mt-1 block">Default initial file language</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1.5">
                  Code Space System Announcement
                </label>
                <input
                  type="text"
                  value={settings.systemAnnouncement || ''}
                  onChange={(e) => setSettings({ ...settings, systemAnnouncement: e.target.value })}
                  placeholder="e.g. Lab Session 4 Active. Java & Python servers running normally."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Banner broadcasted at the top of Code Space for all students</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset to Institutional Defaults</span>
              </button>

              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(139,92,246,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{actionLoading ? 'Deploying...' : 'Deploy Settings to All Users'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* MODAL 1: ADD SERVER */}
      {isAddServerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#13131c] border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsAddServerOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Add New Compiler Server</h3>
            <p className="text-xs text-zinc-400 mb-5">Configure a new execution node or cloud cluster for Code Space</p>

            <form onSubmit={handleAddServer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Server Unique ID (e.g. custom_node)</label>
                <input
                  type="text"
                  required
                  value={newServerForm.id}
                  onChange={(e) => setNewServerForm({ ...newServerForm, id: e.target.value })}
                  placeholder="e.g. cluster_piston"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Server Display Name</label>
                <input
                  type="text"
                  required
                  value={newServerForm.name}
                  onChange={(e) => setNewServerForm({ ...newServerForm, name: e.target.value })}
                  placeholder="e.g. Piston Cloud Engine"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Badge</label>
                  <input
                    type="text"
                    value={newServerForm.badge}
                    onChange={(e) => setNewServerForm({ ...newServerForm, badge: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Latency / Ping</label>
                  <input
                    type="text"
                    value={newServerForm.ping}
                    onChange={(e) => setNewServerForm({ ...newServerForm, ping: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={newServerForm.desc}
                  onChange={(e) => setNewServerForm({ ...newServerForm, desc: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddServerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold"
                >
                  Add Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SERVER */}
      {isEditServerOpen && editingServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#13131c] border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsEditServerOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Edit Compiler Server: {editingServer.name}</h3>
            <p className="text-xs text-zinc-400 mb-5">ID: {editingServer.id}</p>

            <form onSubmit={handleEditServerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Server Display Name</label>
                <input
                  type="text"
                  required
                  value={editingServer.name}
                  onChange={(e) => setEditingServer({ ...editingServer, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Badge</label>
                  <input
                    type="text"
                    value={editingServer.badge}
                    onChange={(e) => setEditingServer({ ...editingServer, badge: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Latency</label>
                  <input
                    type="text"
                    value={editingServer.ping}
                    onChange={(e) => setEditingServer({ ...editingServer, ping: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={editingServer.desc}
                  onChange={(e) => setEditingServer({ ...editingServer, desc: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="srvDefault"
                  checked={Boolean(editingServer.isDefault)}
                  onChange={(e) => setEditingServer({ ...editingServer, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-0"
                />
                <label htmlFor="srvDefault" className="text-xs text-zinc-300 font-semibold cursor-pointer">
                  Set as Primary Default Server for all users
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditServerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold"
                >
                  Save Server Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD LANGUAGE */}
      {isAddLangOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#13131c] border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddLangOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Add New Programming Language</h3>
            <p className="text-xs text-zinc-400 mb-5">Enable another language for student and faculty lab programming</p>

            <form onSubmit={handleAddLanguage} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Language Key (e.g. kotlin)</label>
                  <input
                    type="text"
                    required
                    value={newLangForm.id}
                    onChange={(e) => setNewLangForm({ ...newLangForm, id: e.target.value })}
                    placeholder="e.g. kotlin"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={newLangForm.name}
                    onChange={(e) => setNewLangForm({ ...newLangForm, name: e.target.value })}
                    placeholder="e.g. Kotlin"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Version</label>
                  <input
                    type="text"
                    value={newLangForm.version}
                    onChange={(e) => setNewLangForm({ ...newLangForm, version: e.target.value })}
                    placeholder="e.g. 2.0.0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Extension</label>
                  <input
                    type="text"
                    value={newLangForm.extension}
                    onChange={(e) => setNewLangForm({ ...newLangForm, extension: e.target.value })}
                    placeholder="e.g. .kt"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Default Solution Template</label>
                <textarea
                  rows={6}
                  value={newLangForm.defaultCode}
                  onChange={(e) => setNewLangForm({ ...newLangForm, defaultCode: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLangOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold"
                >
                  Add Language
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT LANGUAGE & TEMPLATE */}
      {isEditLangOpen && editingLang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#13131c] border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditLangOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Edit {editingLang.name} Configuration</h3>
            <p className="text-xs text-zinc-400 mb-5">Customize starter template code provided to students when selecting this language</p>

            <form onSubmit={handleEditLangSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editingLang.name}
                    onChange={(e) => setEditingLang({ ...editingLang, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Version</label>
                  <input
                    type="text"
                    value={editingLang.version}
                    onChange={(e) => setEditingLang({ ...editingLang, version: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Starter Code Template</label>
                <textarea
                  rows={8}
                  value={editingLang.defaultCode || ''}
                  onChange={(e) => setEditingLang({ ...editingLang, defaultCode: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditLangOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold"
                >
                  Save Language Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
