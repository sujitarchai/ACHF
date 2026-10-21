import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Server, 
  Layers, 
  Cpu, 
  Zap, 
  Database,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { 
  REDIS_ATOMIC_LUA_SCRIPT, 
  PYTHON_PCF_SIMULATOR_SCRIPT, 
  GO_PCF_SIMULATOR_SCRIPT, 
  KUBERNETES_TOPOLOGY_YAML 
} from '../data/codeScaffolds';

export const TechnicalSpecs: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'lua' | 'python' | 'go' | 'k8s'>('lua');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCurrentCode = () => {
    switch (activeCodeTab) {
      case 'lua': return { code: REDIS_ATOMIC_LUA_SCRIPT, filename: 'chf_atomic_reservation.lua' };
      case 'python': return { code: PYTHON_PCF_SIMULATOR_SCRIPT, filename: 'pcf_n28_simulator.py' };
      case 'go': return { code: GO_PCF_SIMULATOR_SCRIPT, filename: 'pcf_n28_simulator.go' };
      case 'k8s': return { code: KUBERNETES_TOPOLOGY_YAML, filename: 'chf_kubernetes_topology.yaml' };
    }
  };

  const active = getCurrentCode();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF7722] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">ACHF Engineering Specifications & Runnable Scaffolds</h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Complete 3GPP Rel 18 technical specification, sub-10ms P99 CAS rating, N28 PCF simulators, and K8s manifests.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#FF7722] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            ACHF (AI Converged Charging Function)
          </span>
        </div>
      </div>

      {/* 3GPP Standards Compliance Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#FF7722] font-mono text-xs font-bold">
            <Server className="w-4 h-4" />
            <span>3GPP TS 32.290 / TS 32.291</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">5G ACHF Service (Nchf / N40)</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Defines the HTTP/2 REST service <code className="text-orange-600 font-mono">Nchf_ConvergedCharging</code> supporting SCUR (Session Charging with Unit Reservation), ECUR, and IEC with sub-second quota replenishment.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-[#E11D48] font-mono text-xs font-bold">
            <Layers className="w-4 h-4" />
            <span>3GPP TS 32.299 / RFC 4006</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">4G Diameter Ro/Gy Mediation</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Diameter Credit-Control Application for IMS CSCF / TAS VoLTE calls and 4G PGW packet data. Normalizes CCR-I/CCR-U/CCR-T AVPs with strict preemption.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-purple-600 font-mono text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>3GPP TS 29.594 (N28 Reference Point)</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Spending Limit Control (Npcf)</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Reference point between ACHF and PCF. Enables dynamic policy adjustment (down-throttling 5QI from 9 to 80, capping throughput, captive portal) upon budget exhaustion.
          </p>
        </div>
      </div>

      {/* Code Scaffolds Hub */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-mono">
            <button
              onClick={() => setActiveCodeTab('lua')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeCodeTab === 'lua' ? 'bg-[#FF7722] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Redis Atomic Lua (CAS Quota)
            </button>
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeCodeTab === 'python' ? 'bg-[#FF7722] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Python PCF Simulator (FastAPI)
            </button>
            <button
              onClick={() => setActiveCodeTab('go')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeCodeTab === 'go' ? 'bg-[#FF7722] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Go PCF Simulator (net/http)
            </button>
            <button
              onClick={() => setActiveCodeTab('k8s')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeCodeTab === 'k8s' ? 'bg-[#FF7722] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kubernetes Topology (OpenShift)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(active.code, activeCodeTab)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs transition font-mono font-bold"
            >
              {copiedKey === activeCodeTab ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedKey === activeCodeTab ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => handleDownload(active.code, active.filename)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF7722] to-[#FF9933] text-white text-xs transition font-mono font-bold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {active.filename}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-[520px] leading-relaxed">
          {active.code}
        </pre>
      </div>
    </div>
  );
};
