import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  Cpu, 
  AlertTriangle, 
  RotateCcw,
  Sliders,
  Radio,
  FileCode,
  Copy,
  Check
} from 'lucide-react';
import { ChfState } from '../engine/chfEngine';
import { PYTHON_PCF_SIMULATOR_SCRIPT, GO_PCF_SIMULATOR_SCRIPT } from '../data/codeScaffolds';

interface DynamicPolicyN28Props {
  state: ChfState;
  onTrigger5gData: (supi: string, bytes?: number) => void;
  onTopUp: (supi: string) => void;
}

export const DynamicPolicyN28: React.FC<DynamicPolicyN28Props> = ({
  state,
  onTrigger5gData,
  onTopUp,
}) => {
  const [selectedSupi, setSelectedSupi] = useState<string>(state.subscribers[1]?.supi || state.subscribers[0]?.supi || '');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'go'>('python');

  const subscriber = state.subscribers.find(s => s.supi === selectedSupi) || state.subscribers[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const remainingDataBytes = subscriber 
    ? subscriber.buckets.filter(b => b.unit === 'BYTES').reduce((acc, b) => acc + b.currentValue, 0)
    : 0;

  const totalDataBytes = subscriber 
    ? subscriber.buckets.filter(b => b.unit === 'BYTES').reduce((acc, b) => acc + b.initialValue, 0)
    : 1;

  const consumedPct = Math.round(((totalDataBytes - remainingDataBytes) / totalDataBytes) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-semibold text-white">3GPP TS 29.594 (N28) Dynamic Policy & Spending Limit Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Service-based reference point N28 between CHF and PCF (<code className="text-purple-300 font-mono">Npcf_SpendingLimitControl</code>). Triggers real-time QoS modification when subscriber thresholds are crossed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Select Subscriber:</span>
            <select
              value={selectedSupi}
              onChange={(e) => setSelectedSupi(e.target.value)}
              className="bg-transparent text-purple-300 font-mono font-medium focus:outline-none"
            >
              {state.subscribers.map((s) => (
                <option key={s.supi} value={s.supi} className="bg-slate-900 text-slate-200">
                  {s.gpsi} (SUPI: {s.supi})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Real-Time N28 Simulation Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive Policy Controller */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">N28 Policy Counter Tracker</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
              subscriber?.policyCounters.statusN28 === 'BREACHED'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : subscriber?.policyCounters.statusN28 === 'NEAR_THRESHOLD'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              Policy Status: {subscriber?.policyCounters.statusN28}
            </span>
          </div>

          {/* Current Subscriber Status */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">SUPI: {subscriber?.supi}</span>
              <span className="text-white font-mono font-semibold">Active 5QI: {subscriber?.policyCounters.active5QI}</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Monthly Data Consumption</span>
                <span className="font-bold text-white">{consumedPct}% Used ({((totalDataBytes - remainingDataBytes)/1073741824).toFixed(2)} GB / {(totalDataBytes/1073741824).toFixed(1)} GB)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    consumedPct >= 100 
                      ? 'bg-rose-500' 
                      : consumedPct >= 80 
                      ? 'bg-amber-400' 
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, consumedPct)}%` }}
                ></div>
              </div>
            </div>

            {/* Threshold Milestones */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
              <div className={`p-2 rounded border text-center ${
                consumedPct >= 50 ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <div className="font-bold">50% Quota</div>
                <div>SMS Notice</div>
              </div>

              <div className={`p-2 rounded border text-center ${
                consumedPct >= 80 ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <div className="font-bold">80% Quota</div>
                <div>N28 Alert to PCF</div>
              </div>

              <div className={`p-2 rounded border text-center ${
                consumedPct >= 100 ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <div className="font-bold">100% Depleted</div>
                <div>QoS Down-Throttle</div>
              </div>
            </div>
          </div>

          {/* Test Buttons to simulate threshold breaches */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Simulate N28 Dynamic Policy Triggers:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  // Drain balance to 85% or 100%
                  onTrigger5gData(selectedSupi, 1073741824); // 1GB
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-medium transition"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Trigger 1GB Data Usage</span>
              </button>

              <button
                onClick={() => {
                  // Drain entirely to 0
                  onTrigger5gData(selectedSupi, remainingDataBytes + 1048576);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-medium transition"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Force 100% Depletion Breach</span>
              </button>
            </div>

            {subscriber?.policyCounters.statusN28 === 'BREACHED' && (
              <button
                onClick={() => onTopUp(selectedSupi)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow mt-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Top-Up +10GB to Restore 5QI 9 QoS</span>
              </button>
            )}
          </div>

          {/* Policy Enforcement Details */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Active PCF Policy & Traffic Steering</span>
            <div className="flex justify-between">
              <span className="text-slate-400">Current 5QI QoS Profile:</span>
              <span className={`font-bold ${subscriber?.policyCounters.active5QI === 80 ? 'text-rose-400' : 'text-sky-300'}`}>
                5QI {subscriber?.policyCounters.active5QI} {subscriber?.policyCounters.active5QI === 80 ? '(Throttled to 128kbps)' : '(eMBB Broadband)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Captive Portal Action:</span>
              <span className="text-slate-300">
                {subscriber?.policyCounters.statusN28 === 'BREACHED' ? 'ENABLED (Redirecting to Top-Up)' : 'DISABLED'}
              </span>
            </div>
            {subscriber?.policyCounters.redirectUrl && (
              <div className="pt-1 text-[11px] text-sky-400 truncate">
                Redirect URL: {subscriber.policyCounters.redirectUrl}
              </div>
            )}
          </div>
        </div>

        {/* Right: Last Dispatched N28 Payload & PCF Reaction */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">N28 Spending Limit Report Payload</h3>
              </div>
              <span className="text-xs font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                POST /npcf-spending-limit-control/v1/notify
              </span>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[380px] leading-relaxed">
              {JSON.stringify(
                state.pcfStatus.lastNotification || {
                  status: "LISTENING_FOR_BREACH_EVENTS",
                  subscriptionId: `sub-n28-${subscriber?.supi}-pcf01`,
                  subscribedCounters: ["DATA_MONTHLY_QUOTA"],
                  currentStatus: subscriber?.policyCounters.statusN28,
                  message: "Trigger quota usage on the left to fire a real-time N28 spending limit notification."
                },
                null,
                2
              )}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">Standards Workflow (TS 29.594 & TS 29.512):</span>
            <p className="mt-1">
              1. PCF creates N28 subscription to subscriber policy counters on CHF.
              <br />
              2. As subscriber consumes quota, CHF checks threshold percentages.
              <br />
              3. Upon 100% exhaustion, CHF fires HTTP/2 POST with <code className="text-purple-300">BREACHED_100</code>.
              <br />
              4. PCF executes Npcf_SMPolicyControl to SMF to modify session QoS (5QI 9 -&gt; 5QI 80) and inject captive portal rules.
            </p>
          </div>
        </div>
      </div>

      {/* Code Scaffolds Explorer for PCF Simulation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Runnable Standalone PCF Simulation Scripts</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Production-ready FastAPI (Python) and Go scripts implementing the full 3GPP TS 29.594 N28 server and PCC rule down-throttling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveCodeTab('python')}
                className={`px-3 py-1 rounded transition ${
                  activeCodeTab === 'python' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python (FastAPI/HTTPX)
              </button>
              <button
                onClick={() => setActiveCodeTab('go')}
                className={`px-3 py-1 rounded transition ${
                  activeCodeTab === 'go' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Go (net/http)
              </button>
            </div>

            <button
              onClick={() => handleCopy(
                activeCodeTab === 'python' ? PYTHON_PCF_SIMULATOR_SCRIPT : GO_PCF_SIMULATOR_SCRIPT,
                activeCodeTab
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
            >
              {copiedCode === activeCodeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === activeCodeTab ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[340px] leading-relaxed">
          {activeCodeTab === 'python' ? PYTHON_PCF_SIMULATOR_SCRIPT : GO_PCF_SIMULATOR_SCRIPT}
        </pre>
      </div>
    </div>
  );
};
