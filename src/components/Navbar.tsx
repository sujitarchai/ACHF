import React from 'react';
import { 
  Radio, 
  Cpu, 
  Activity, 
  Layers, 
  Sliders, 
  Users, 
  ShieldAlert, 
  FileCode, 
  Play, 
  Zap,
  Network,
  GitBranch,
  UserPlus,
  BookOpen,
  Presentation,
  Download,
  ShieldCheck
} from 'lucide-react';
import { RealtimeMetric } from '../types/telecom';

export type TabId = 
  | 'sessions' 
  | 'subscribers' 
  | 'tariff' 
  | 'policy-n28' 
  | 'protocol' 
  | 'diagrams' 
  | 'specs';

interface NavbarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  metrics: RealtimeMetric;
  onRunBenchmark: () => void;
  onConcurrentBurst: () => void;
  onOpenWizard: () => void;
  onOpenPresentation: () => void;
  onOpenPdf: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  metrics,
  onRunBenchmark,
  onConcurrentBurst,
  onOpenWizard,
  onOpenPresentation,
  onOpenPdf,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 text-slate-900 shadow-sm">
      {/* Top Telemetry Strip */}
      <div className="border-b border-slate-100 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono font-bold tracking-tight text-[#FF7722]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7722] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF7722]"></span>
            </span>
            <span>3GPP TS 32.290/32.291 ACHF ACTIVE</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-slate-600 hidden md:flex">
            <Radio className="w-3.5 h-3.5 text-orange-500" />
            <span>Ingress:</span>
            <span className="text-slate-800 font-mono font-semibold">5G HTTP/2 (SMF) + 4G Ro/Gy (TAS/PGW)</span>
          </div>
          <span className="text-slate-300 hidden md:inline">|</span>
          <div className="flex items-center gap-1.5 text-slate-600 hidden lg:flex">
            <Cpu className="w-3.5 h-3.5 text-rose-500" />
            <span>Rating Fabric:</span>
            <span className="text-slate-800 font-mono font-semibold">Redis CAS (Sub-10ms P99)</span>
          </div>
        </div>

        {/* Live Metrics Counters */}
        <div className="flex items-center gap-2 sm:gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-500">TPS:</span>
            <span className="text-slate-900 font-bold">{metrics.tps.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-500">P99 SLA:</span>
            <span className={`font-bold ${metrics.p99LatencyMs < 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {metrics.p99LatencyMs}ms
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-500">Sessions:</span>
            <span className="text-orange-600 font-bold">{metrics.activeSessions5G} 5G</span>
            <span className="text-slate-300">/</span>
            <span className="text-rose-600 font-bold">{metrics.activeSessions4G} 4G</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onConcurrentBurst}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-semibold transition shadow-xs"
              title="Trigger simultaneous VoLTE Voice Call and 5G Data reservation to test priority preemption"
            >
              <Zap className="w-3 h-3 text-amber-200" />
              <span className="hidden sm:inline">Dual Burst</span>
            </button>
            <button
              onClick={onRunBenchmark}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold transition shadow-xs"
              title="Benchmark 5,000 transactions to verify sub-10ms P99 latency"
            >
              <Play className="w-3 h-3 text-emerald-100" />
              <span className="hidden sm:inline">P99 Benchmark</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF7722] via-[#FF9933] to-[#E11D48] flex items-center justify-center shadow-md shadow-orange-500/20 text-white">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                ACHF (AI Converged Charging Function)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-[#FF7722] border border-orange-200">
                3GPP Rel 18
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-[#E11D48] border border-rose-200 hidden sm:inline">
                Prepaid & Postpaid
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              AI-Driven Real-Time Quota Arbitration, N28 PCF Policy, and Multi-Bucket Tariff Studio
            </p>
          </div>
        </div>

        {/* Customer Demo Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF7722] to-[#FF9933] text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:opacity-95 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Provision Wizard</span>
          </button>

          <button
            onClick={onOpenPresentation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#F43F5E] text-white text-xs font-bold shadow-md shadow-rose-500/20 hover:opacity-95 transition"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Customer Pitch (PPT)</span>
          </button>

          <button
            onClick={onOpenPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Runbook PDF</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-4 pb-2.5">
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {[
            { id: 'sessions', label: 'Live Sessions & Quota', icon: Layers },
            { id: 'subscribers', label: 'Subscriber 360 View', icon: Users },
            { id: 'tariff', label: 'Bundle & Tariff Studio', icon: Sliders },
            { id: 'policy-n28', label: 'N28 PCF Policy', icon: ShieldCheck },
            { id: 'protocol', label: 'Protocol Dissector (Ro/Nchf)', icon: GitBranch },
            { id: 'diagrams', label: 'Flow Diagrams (Mermaid)', icon: Activity },
            { id: 'specs', label: 'Specs & Code Scaffolds', icon: FileCode },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as TabId)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF7722]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
