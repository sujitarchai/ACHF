import React, { useState } from 'react';
import { 
  Sliders, 
  Layers, 
  Check, 
  Plus, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  HelpCircle, 
  BookOpen, 
  Code2, 
  CheckCircle2,
  Sparkles,
  Server,
  Wifi,
  PhoneCall,
  DollarSign
} from 'lucide-react';
import { CommercialTariffPlan, RatingGroupConfig } from '../types/telecom';

interface TariffStudioProps {
  tariffs: CommercialTariffPlan[];
}

export const TariffStudio: React.FC<TariffStudioProps> = ({ tariffs }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(tariffs[0]?.planId || '');
  const [activeWalkthroughStep, setActiveWalkthroughStep] = useState<number>(1);
  const activePlan = tariffs.find(p => p.planId === selectedPlanId) || tariffs[0];

  const walkthroughSteps = [
    {
      step: 1,
      title: 'Commercial Bundle Definition',
      desc: 'Define commercial bundle name, target segment (Prepaid Consumer vs Enterprise Postpaid), monthly charge, and multi-bucket priority cascade.',
      keyConcepts: ['Prepaid/Postpaid Classification', 'Cascade: Promo → Slice → Night → General → Wallet', 'Billing Cycle Dates'],
    },
    {
      step: 2,
      title: 'Rating Groups (RGs) & Service IDs',
      desc: 'Configure distinct rating groups: RG 100 for 5G broadband data, RG 110 for Off-Peak night quota, RG 200 for VoLTE On-Net, RG 201 for Off-Net, and RG 205 for ISD.',
      keyConcepts: ['Rating Group (RG)', 'Service Identifier (Service-Id)', 'Traffic Steering via S-NSSAI'],
    },
    {
      step: 3,
      title: 'Re-Authorization Triggers & Validity Timers',
      desc: 'Bind real-time re-authorization triggers (QUOTA_EXHAUSTED, VALIDITY_TIME_ELAPSED, QOS_CHANGE, LOCATION_CHANGE) to enforce 3GPP TS 32.291 SCUR re-authorizations.',
      keyConcepts: ['Validity-Time AVP', 'Quota-Holding-Time', 'Preemption & QoS Changes'],
    },
    {
      step: 4,
      title: 'Spending Limit Policy (N28) Mapping',
      desc: 'Map usage counters to policy thresholds (50% SMS notice, 80% PCF near-exhaustion, 100% PCF breach with 5QI down-throttling to 80).',
      keyConcepts: ['Npcf_SpendingLimitControl', 'Policy Counter Status Values', 'Down-throttling to 128kbps'],
    },
    {
      step: 5,
      title: 'Subscriber & Hardware Association',
      desc: 'Bind SIM/eSIM hardware profiles (MSISDN, IMSI, SUPI, PEI, VoLTE codecs) to this commercial bundle for instant core activation.',
      keyConcepts: ['MSISDN', 'IMSI', 'SUPI', 'PEI', 'EVS-SWB Audio Codec'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF7722] flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Commercial Bundle & Tariff Studio</h2>
              <p className="text-xs text-slate-500 font-sans">
                Visual matrix builder linking Rating Groups (RG), Service IDs, validity timers, and multi-bucket drawdown cascades.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Active Tariff Bundle:</label>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="bg-slate-50 text-[#FF7722] font-mono text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
          >
            {tariffs.map((t) => (
              <option key={t.planId} value={t.planId} className="text-slate-900 bg-white">
                {t.name} ({t.planId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Operator Walkthrough Guide */}
      <div className="bg-gradient-to-r from-orange-50 via-white to-rose-50 border border-orange-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#FF7722]">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900">Operator Configuration Manual: 5G SA Data + VoLTE Bundle</h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#FF7722] bg-white px-2.5 py-1 rounded-full border border-orange-200 shadow-2xs">
            3GPP TS 32.290 / TS 32.291
          </span>
        </div>

        {/* Step buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {walkthroughSteps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveWalkthroughStep(s.step)}
              className={`p-3 rounded-2xl border text-left transition ${
                activeWalkthroughStep === s.step
                  ? 'bg-gradient-to-r from-[#FF7722] to-[#FF9933] text-white border-orange-500 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-mono font-bold uppercase opacity-80">Step 0{s.step}</div>
              <div className="text-xs font-bold truncate mt-0.5">{s.title.split('&')[0]}</div>
            </button>
          ))}
        </div>

        {/* Active step display */}
        {walkthroughSteps[activeWalkthroughStep - 1] && (
          <div className="bg-white/90 border border-orange-100 rounded-2xl p-4 space-y-2">
            <div className="text-xs font-bold font-mono text-[#FF7722]">
              STEP {activeWalkthroughStep}: {walkthroughSteps[activeWalkthroughStep - 1].title}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {walkthroughSteps[activeWalkthroughStep - 1].desc}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500 font-semibold">Key Concepts:</span>
              {walkthroughSteps[activeWalkthroughStep - 1].keyConcepts.map((c, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-orange-50 border border-orange-200 text-orange-900 font-semibold">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Plan Details & Rating Groups Matrix */}
      {activePlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Plan Info & Drawdown Cascade */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Selected Commercial Plan</span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">{activePlan.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{activePlan.description}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan ID:</span>
                <span className="font-mono font-bold text-slate-900">{activePlan.planId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Segment:</span>
                <span className="text-slate-900 font-semibold">{activePlan.targetSegment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Recurring Fee:</span>
                <span className="font-bold text-[#FF7722]">${activePlan.monthlyRecurringFee}/mo</span>
              </div>
            </div>

            {/* Bucket Drawdown Cascade Precedence */}
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-2">
                Multi-Bucket Drawdown Precedence:
              </span>
              <div className="space-y-2">
                {activePlan.bucketCascade.map((bucketType, index) => (
                  <div
                    key={bucketType}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#FF7722] text-white font-mono text-[10px] flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span className="font-bold text-slate-800">{bucketType.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Priority P{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rating Groups Matrix */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Rating Groups (RGs) & Tariff Matrix</h3>
                <p className="text-xs text-slate-500">Mapping traffic flows to charging formulas, default grants, and SCUR validity timers.</p>
              </div>
              <button
                onClick={() => alert('New Rating Group Wizard: Configure unit basis (Bytes/Seconds/Count), unit price, and re-authorization triggers.')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF7722] to-[#FF9933] text-white text-xs font-bold shadow-sm hover:opacity-95 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rating Group</span>
              </button>
            </div>

            <div className="space-y-3">
              {activePlan.ratingGroups.map((rg) => (
                <div
                  key={rg.ratingGroup}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-orange-100 border border-orange-200 text-[#FF7722] font-mono font-extrabold text-xs">
                        RG {rg.ratingGroup}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{rg.name}</h4>
                      {rg.snssai && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-100 text-purple-700 font-bold">
                          Slice: {rg.snssai}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono text-emerald-700 font-bold">
                      ${rg.unitPriceMonetary.toFixed(2)} per{' '}
                      {rg.unitType === 'BYTES'
                        ? `${(rg.unitsPerPrice / 1048576).toFixed(0)} MB`
                        : `${rg.unitsPerPrice}s`}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{rg.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-white p-3 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Unit Basis</span>
                      <span className="font-bold text-slate-800">{rg.unitType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Default Grant</span>
                      <span className="font-bold text-orange-600">
                        {rg.unitType === 'BYTES' ? `${(rg.defaultQuotaGrant / 1048576).toFixed(0)} MB` : `${rg.defaultQuotaGrant}s`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Validity Time</span>
                      <span className="font-bold text-slate-800">{rg.validityTimeSeconds}s</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Holding Time</span>
                      <span className="font-bold text-slate-800">{rg.quotaHoldingTimeSeconds}s</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                      Active Re-authorization Triggers:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rg.triggers.map((trigger) => (
                        <span
                          key={trigger}
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-white border border-slate-200 text-slate-700 font-semibold"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
