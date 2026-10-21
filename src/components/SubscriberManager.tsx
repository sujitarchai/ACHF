import React, { useState } from 'react';
import { 
  Users, 
  Smartphone, 
  CreditCard, 
  Layers, 
  Plus, 
  RefreshCw, 
  Shield, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  Radio,
  Clock,
  ArrowUpRight,
  PhoneCall,
  Wifi,
  Moon,
  Globe2,
  DollarSign,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { SubscriberAccount } from '../types/telecom';

interface SubscriberManagerProps {
  subscribers: SubscriberAccount[];
  onTopUp: (identifier: string, gb?: number, dollars?: number) => void;
  onOpenWizard: () => void;
}

export const SubscriberManager: React.FC<SubscriberManagerProps> = ({
  subscribers,
  onTopUp,
  onOpenWizard,
}) => {
  const [selectedSupi, setSelectedSupi] = useState<string>(subscribers[0]?.supi || '');
  const activeSub = subscribers.find(s => s.supi === selectedSupi) || subscribers[0];

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatSeconds = (sec: number) => {
    const hours = (sec / 3600).toFixed(1);
    const mins = Math.floor(sec / 60);
    return `${hours} hrs (${mins}m)`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF7722] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Subscriber 360° Management & Identity Console</h2>
              <p className="text-xs text-slate-500 font-sans">
                Full 3GPP Identity Stack Correlation (MSISDN, IMSI, SUPI, PEI) & Multi-Bucket Balance Gauges
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF7722] to-[#FF9933] text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:opacity-95 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Provision New Subscriber</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Subscriber List + Selected 360 View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subscriber Roster Sidebar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase text-slate-500">Registered SIM Profiles ({subscribers.length})</span>
            <span className="text-[10px] font-mono text-orange-600 font-bold">Multi-Tenant Core</span>
          </div>

          <div className="space-y-2.5">
            {subscribers.map((sub) => {
              const isSelected = sub.supi === activeSub.supi;
              const isPrepaid = sub.accountType === 'PREPAID';
              const isThrottled = sub.policyCounters.statusN28 === 'BREACHED';

              return (
                <div
                  key={sub.supi}
                  onClick={() => setSelectedSupi(sub.supi)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                    isSelected
                      ? 'border-[#FF7722] bg-orange-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-sm text-slate-900">{sub.msisdn}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isPrepaid
                        ? 'bg-orange-100 text-[#FF7722] border border-orange-200'
                        : 'bg-rose-100 text-[#E11D48] border border-rose-200'
                    }`}>
                      {sub.accountType}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 font-mono flex items-center justify-between">
                    <span>IMSI: {sub.imsi.slice(0, 9)}...</span>
                    <span className={`font-bold ${isThrottled ? 'text-rose-600' : 'text-emerald-600'}`}>
                      5QI {sub.policyCounters.active5QI} {isThrottled ? '(Throttled)' : ''}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    {sub.planName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Subscriber 360 Inspection View */}
        {activeSub && (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Identity & Network Ingress Binding Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                    activeSub.accountType === 'PREPAID'
                      ? 'bg-gradient-to-tr from-[#FF7722] to-[#FF9933] shadow-orange-500/20'
                      : 'bg-gradient-to-tr from-[#E11D48] to-[#F43F5E] shadow-rose-500/20'
                  }`}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-slate-900 font-mono">{activeSub.msisdn}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        activeSub.accountType === 'PREPAID'
                          ? 'bg-orange-100 text-[#FF7722] border border-orange-200'
                          : 'bg-rose-100 text-[#E11D48] border border-rose-200'
                      }`}>
                        {activeSub.accountType} ACCOUNT
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeSub.deviceModel || '5G SA Handset'} • Account ID: <span className="font-mono font-semibold text-slate-800">{activeSub.accountId}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTopUp(activeSub.msisdn, 15, 30)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Top-Up (+15GB, +$30)</span>
                  </button>
                </div>
              </div>

              {/* 3GPP Identity Correlation Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">MSISDN (E.164 Dialable)</span>
                  <span className="text-slate-900 font-bold text-sm">{activeSub.msisdn}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">IMSI (4G PGW Gy)</span>
                  <span className="text-slate-900 font-bold text-sm">{activeSub.imsi}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">SUPI (5G SA SMF Nchf)</span>
                  <span className="text-orange-600 font-bold text-sm truncate block">{activeSub.supi}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">PEI (IMEISV Hardware)</span>
                  <span className="text-slate-900 font-bold">{activeSub.pei}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">IMS SIP URI (VoLTE/VoNR)</span>
                  <span className="text-rose-600 font-bold truncate block">{activeSub.sipUri}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Voice Codec Profile</span>
                  <span className="text-emerald-700 font-bold">{activeSub.hardwareCodec || 'EVS-SWB 24.4k'}</span>
                </div>
              </div>

              {/* Postpaid Credit Limit Notice or Prepaid Balance */}
              {activeSub.accountType === 'POSTPAID' && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[#E11D48] text-sm block">
                      Postpaid Credit Ceiling: ${activeSub.creditLimit?.toFixed(2)} USD
                    </span>
                    <span className="text-slate-600">
                      Unbilled Consumption: <span className="font-mono font-bold text-slate-900">${activeSub.currentUnbilledAmount?.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="text-right font-mono text-[11px] text-rose-800">
                    Bill Shock Protection Active: 70% • 90% • 100%
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Bucket Balance Gauges */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#FF7722]" />
                  <h3 className="text-sm font-bold text-slate-900">Multi-Bucket Allowances & Consumption Gauges</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Priority Cascade: Promo → Slice → Night Owl → General → Wallet
                </span>
              </div>

              {/* Bucket Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activeSub.buckets.map((b) => {
                  const pct = b.initialValue > 0 ? Math.round((b.currentValue / b.initialValue) * 100) : 0;
                  const isDepleted = b.currentValue <= 0;

                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:shadow-xs transition space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {b.unit === 'BYTES' ? (
                            <Wifi className="w-4 h-4 text-orange-500" />
                          ) : b.unit === 'SECONDS' ? (
                            <PhoneCall className="w-4 h-4 text-rose-500" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                          )}
                          <span className="font-bold text-slate-900 text-xs truncate max-w-[170px]">{b.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-700">
                          Priority P{b.priorityOrder}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between font-mono">
                        <span className={`text-base font-extrabold ${isDepleted ? 'text-rose-600' : 'text-slate-900'}`}>
                          {b.unit === 'BYTES'
                            ? formatBytes(b.currentValue)
                            : b.unit === 'SECONDS'
                            ? formatSeconds(b.currentValue)
                            : `$${b.currentValue.toFixed(2)}`}
                        </span>
                        <span className="text-xs text-slate-400">
                          of {b.unit === 'BYTES'
                            ? formatBytes(b.initialValue)
                            : b.unit === 'SECONDS'
                            ? formatSeconds(b.initialValue)
                            : `$${b.initialValue.toFixed(2)}`}
                        </span>
                      </div>

                      {/* Visual Meter */}
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDepleted
                              ? 'bg-rose-500'
                              : pct < 20
                              ? 'bg-amber-500'
                              : b.unit === 'BYTES'
                              ? 'bg-[#FF7722]'
                              : b.unit === 'SECONDS'
                              ? 'bg-[#E11D48]'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(3, pct)}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>{b.category}</span>
                        {b.reservedValue > 0 && (
                          <span className="text-orange-600 font-bold">
                            Held: {b.unit === 'BYTES' ? formatBytes(b.reservedValue) : `${b.reservedValue}s`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aggregated Usage Counters */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Dynamic Consumption Counters (TS 32.290 Multi-Tier)</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase">Billing Cycle Data</span>
                  <span className="text-base font-extrabold text-[#FF7722]">
                    {formatBytes(activeSub.usageCounters.dataBytesCycle)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase">Billing Cycle Voice</span>
                  <span className="text-base font-extrabold text-[#E11D48]">
                    {formatSeconds(activeSub.usageCounters.voiceSecondsCycle)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase">Night Owl Quota</span>
                  <span className="text-base font-extrabold text-indigo-600">
                    {formatBytes(activeSub.usageCounters.offPeakBytes)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase">Policy N28 Status</span>
                  <span className={`text-base font-extrabold ${
                    activeSub.policyCounters.statusN28 === 'BREACHED' ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {activeSub.policyCounters.statusN28}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
