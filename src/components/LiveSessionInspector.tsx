import React, { useState } from 'react';
import { 
  Play, 
  PhoneCall, 
  Wifi, 
  StopCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  HardDrive, 
  Database,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Zap,
  Volume2,
  Activity,
  Layers,
  Radio
} from 'lucide-react';
import { ChfState } from '../engine/chfEngine';

interface LiveSessionInspectorProps {
  state: ChfState;
  onTrigger5gData: (identifier: string, bytes?: number) => void;
  onTriggerVoLte: (identifier: string, seconds?: number) => void;
  onTriggerConcurrent: (identifier: string) => void;
  onTerminateSession: (sessionId: string) => void;
  onTopUp: (identifier: string) => void;
}

export const LiveSessionInspector: React.FC<LiveSessionInspectorProps> = ({
  state,
  onTrigger5gData,
  onTriggerVoLte,
  onTriggerConcurrent,
  onTerminateSession,
  onTopUp,
}) => {
  const [selectedIdentifier, setSelectedIdentifier] = useState<string>(state.subscribers[0]?.msisdn || '');
  const activeSubscriber = state.subscribers.find(s => s.msisdn === selectedIdentifier || s.supi === selectedIdentifier) || state.subscribers[0];

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900">Unified Ingress Gateway & Quota Arbiter</h2>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Simultaneously arbitrates 5G SMF (Nchf), 4G PGW (Gy), and IMS TAS (Ro) with Strict Priority preemption.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Target Subscriber:</span>
              <select
                value={selectedIdentifier}
                onChange={(e) => setSelectedIdentifier(e.target.value)}
                className="bg-transparent text-[#FF7722] font-mono font-bold focus:outline-none cursor-pointer"
              >
                {state.subscribers.map((s) => (
                  <option key={s.supi} value={s.msisdn} className="text-slate-900 bg-white">
                    {s.msisdn} ({s.accountType}) - {s.deviceModel?.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onTriggerVoLte(selectedIdentifier, 180)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#F43F5E] hover:opacity-95 text-white text-xs font-bold transition shadow-sm"
              title="IMS TAS Diameter Ro CCR-I/U for VoLTE HD Voice Call (Priority Queue P0)"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Simulate VoLTE Call (180s)</span>
            </button>

            <button
              onClick={() => onTrigger5gData(selectedIdentifier, 104857600)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF7722] to-[#FF9933] hover:opacity-95 text-white text-xs font-bold transition shadow-sm"
              title="5G SMF Nchf_ConvergedCharging POST (SCUR 100MB interim)"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Request 5G Data (100MB)</span>
            </button>

            <button
              onClick={() => onTriggerConcurrent(selectedIdentifier)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
              title="Simultaneously trigger VoLTE Call and 5G Data to test priority scheduling"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Dual-Session Burst</span>
            </button>

            <button
              onClick={() => onTopUp(selectedIdentifier)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Top-Up +10GB</span>
            </button>
          </div>
        </div>

        {/* Priority Arbitration & WFQ Visualizer */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white text-[#E11D48] shadow-2xs">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-[#E11D48] font-bold flex items-center gap-1.5">
                  <span>Priority Queue P0 (Strict)</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-200/80 text-rose-800 text-[9px]">Weight 80</span>
                </div>
                <div className="text-xs text-slate-600 font-sans">IMS TAS VoLTE/VoNR (5QI 1 GBR Voice)</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-rose-700">Preemption Active</div>
              <div className="text-[10px] text-slate-500 font-mono">&lt; 1.5ms Latency</div>
            </div>
          </div>

          <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white text-purple-600 shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-purple-700 font-bold flex items-center gap-1.5">
                  <span>Guaranteed Queue P1</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-200/80 text-purple-800 text-[9px]">Weight 15</span>
                </div>
                <div className="text-xs text-slate-600 font-sans">5G Dedicated URLLC Network Slices</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-purple-700">SST: 2, SD: 000002</div>
              <div className="text-[10px] text-slate-500 font-mono">~2.2ms Latency</div>
            </div>
          </div>

          <div className="bg-orange-50/70 p-3.5 rounded-2xl border border-orange-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white text-[#FF7722] shadow-2xs">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-[#FF7722] font-bold flex items-center gap-1.5">
                  <span>Best-Effort Queue P2</span>
                  <span className="px-1.5 py-0.2 rounded bg-orange-200/80 text-orange-900 text-[9px]">Weight 5</span>
                </div>
                <div className="text-xs text-slate-600 font-sans">5G SMF (Nchf) & 4G PGW (Gy) Data</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-orange-700">Fair Queued (WFQ)</div>
              <div className="text-[10px] text-slate-500 font-mono">~3.2ms Latency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Subscriber Active Profile Snapshot */}
      {activeSubscriber && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Selected Active Subscriber</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-lg font-extrabold text-slate-900 font-mono">{activeSubscriber.msisdn}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  activeSubscriber.accountType === 'PREPAID'
                    ? 'bg-orange-100 text-[#FF7722]'
                    : 'bg-rose-100 text-[#E11D48]'
                }`}>
                  {activeSubscriber.accountType}
                </span>
                <span className="text-xs text-slate-500 font-mono">SUPI: {activeSubscriber.supi}</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
                  activeSubscriber.policyCounters.statusN28 === 'BREACHED'
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                }`}>
                  5QI {activeSubscriber.policyCounters.active5QI} 
                  {activeSubscriber.policyCounters.statusN28 === 'BREACHED' ? ' (Throttled to 128kbps)' : ''}
                </span>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-500">Plan:</span>
              <span className="text-slate-900 font-bold ml-1.5">{activeSubscriber.planName}</span>
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                Codec: <span className="text-slate-700 font-semibold">{activeSubscriber.hardwareCodec || 'EVS'}</span>
              </div>
            </div>
          </div>

          {/* Bucket Cascade Visual Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {activeSubscriber.buckets.slice(0, 4).map((bucket) => {
              const pct = bucket.initialValue > 0 ? Math.round((bucket.currentValue / bucket.initialValue) * 100) : 0;
              const isDepleted = bucket.currentValue <= 0;

              return (
                <div 
                  key={bucket.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate">{bucket.name}</span>
                    <span className="font-mono text-[10px] font-bold text-slate-500">P{bucket.priorityOrder}</span>
                  </div>

                  <div className="font-mono text-sm font-extrabold text-slate-900">
                    {bucket.unit === 'BYTES'
                      ? formatBytes(bucket.currentValue)
                      : bucket.unit === 'SECONDS'
                      ? formatSeconds(bucket.currentValue)
                      : `$${bucket.currentValue.toFixed(2)}`}
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDepleted ? 'bg-rose-500' : 'bg-[#FF7722]'
                      }`}
                      style={{ width: `${Math.max(2, pct)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{bucket.type.replace('_', ' ')}</span>
                    {bucket.reservedValue > 0 && (
                      <span className="text-orange-600 font-bold">
                        Held: {bucket.unit === 'BYTES' ? formatBytes(bucket.reservedValue) : `${bucket.reservedValue}s`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Sessions Grid & Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Converged Sessions */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF7722]" />
              <h3 className="text-sm font-bold text-slate-900">Active Converged Sessions ({state.activeSessions.length})</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Redis In-Memory State</span>
          </div>

          {state.activeSessions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              No active sessions. Trigger a VoLTE call or 5G data request above.
            </div>
          ) : (
            <div className="space-y-3">
              {state.activeSessions.map((session) => {
                const isVoLte = session.sessionType === '4G_VOLTE_VOICE';
                const isThrottled = session.state === 'POLICY_THROTTLED';

                return (
                  <div
                    key={session.sessionId}
                    className={`p-4 rounded-2xl border transition ${
                      isThrottled
                        ? 'bg-rose-50/60 border-rose-300'
                        : isVoLte
                        ? 'bg-rose-50/30 border-rose-200'
                        : 'bg-orange-50/30 border-orange-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isVoLte ? 'bg-rose-100 text-[#E11D48]' : 'bg-orange-100 text-[#FF7722]'}`}>
                          {isVoLte ? <PhoneCall className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm font-mono">{session.sessionId}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              isVoLte ? 'bg-rose-100 text-[#E11D48]' : 'bg-orange-100 text-[#FF7722]'
                            }`}>
                              {session.protocol}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                              {session.state}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 font-mono">
                            Subscriber: <span className="text-slate-900 font-bold">{session.msisdn}</span> • Rating Group: <span className="text-slate-900 font-bold">{session.ratingGroup}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onTerminateSession(session.sessionId)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 text-xs font-semibold transition"
                      >
                        <StopCircle className="w-3.5 h-3.5" />
                        <span>Terminate</span>
                      </button>
                    </div>

                    {/* Metrics row */}
                    <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 block uppercase">Granted Quota</span>
                        <span className="font-bold text-emerald-600">
                          {session.unitType === 'BYTES' ? formatBytes(session.grantedUnits) : `${session.grantedUnits}s`}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 block uppercase">Consumed</span>
                        <span className="font-bold text-slate-800">
                          {session.unitType === 'BYTES' ? formatBytes(session.consumedUnits) : `${session.consumedUnits}s`}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 block uppercase">Active QoS</span>
                        <span className="font-bold text-slate-800">5QI {session.current5QI}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 block uppercase">Latency</span>
                        <span className="font-bold text-[#FF7722]">{session.latencyMs} ms</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Ingress Event Stream */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF7722]" />
                <h3 className="text-sm font-bold text-slate-900">Ingress Gateway & Quota Arbitration Stream</h3>
              </div>
              <span className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Live Feed
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
              {state.eventLogs.slice(0, 10).map((log) => {
                const isVoice = log.priority === 'CRITICAL_VOICE';
                const isDenied = log.status === 'QUOTA_DENIED';

                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-2xl border text-xs font-mono transition ${
                      isDenied
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : isVoice
                        ? 'bg-rose-50/40 border-rose-200 text-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.source === 'IMS_CSCF'
                            ? 'bg-rose-100 text-[#E11D48]'
                            : log.source === 'PGW'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-[#FF7722]'
                        }`}>
                          {log.source}
                        </span>
                        <span className="font-bold text-slate-900 font-sans">{log.messageName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{log.latencyMs}ms</span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{log.summary}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
