import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  UserPlus, 
  Smartphone, 
  CreditCard, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  PhoneCall,
  Wifi,
  Database
} from 'lucide-react';
import { SubscriberAccount, AccountClassification, CommercialTariffPlan } from '../types/telecom';

interface ProvisioningWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariffs: CommercialTariffPlan[];
  onProvisionSuccess: (subscriber: SubscriberAccount) => void;
}

export const ProvisioningWizardModal: React.FC<ProvisioningWizardModalProps> = ({
  isOpen,
  onClose,
  tariffs,
  onProvisionSuccess,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [accountType, setAccountType] = useState<AccountClassification>('PREPAID');
  const [msisdn, setMsisdn] = useState<string>('+91 98200 ' + Math.floor(10000 + Math.random() * 90000));
  const [imsi, setImsi] = useState<string>('404450' + Math.floor(100000000 + Math.random() * 900000000));
  const [pei, setPei] = useState<string>('86291004' + Math.floor(10000000 + Math.random() * 90000000));
  const [deviceModel, setDeviceModel] = useState<string>('Apple iPhone 16 Pro (5G SA / VoNR)');
  const [hardwareCodec, setHardwareCodec] = useState<string>('EVS-SWB 24.4kbps');
  const [sa5gCapable, setSa5gCapable] = useState<boolean>(true);
  
  // Postpaid credit limit
  const [creditLimit, setCreditLimit] = useState<number>(150);
  
  // Selected commercial bundle
  const [selectedPlanId, setSelectedPlanId] = useState<string>(tariffs[0]?.planId || '');
  const [initialCashWallet, setInitialCashWallet] = useState<number>(25);

  if (!isOpen) return null;

  const handleFinish = () => {
    const selectedPlan = tariffs.find(t => t.planId === selectedPlanId) || tariffs[0];
    const cleanedMsisdn = msisdn.replace(/\s+/g, '');
    const supi = `imsi-${imsi}`;
    const gpsi = `msisdn-${cleanedMsisdn.replace('+', '')}`;
    const sipUri = `sip:${cleanedMsisdn}@ims.mnc045.mcc404.3gppnetwork.org`;

    const newSubscriber: SubscriberAccount = {
      accountId: `ACC-${accountType}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: 'TELCO-NATIONAL-01',
      accountType,
      tier: accountType === 'PREPAID' ? 'CONSUMER_PREPAID' : 'CONSUMER_POSTPAID',
      msisdn: cleanedMsisdn,
      imsi,
      supi,
      gpsi,
      pei,
      sipUri,
      hardwareCodec,
      sa5gCapable,
      deviceModel,
      activePlanId: selectedPlan.planId,
      planName: selectedPlan.name,
      status: 'ACTIVE',
      creditLimit: accountType === 'POSTPAID' ? creditLimit : undefined,
      currentUnbilledAmount: accountType === 'POSTPAID' ? 0.00 : undefined,
      billShockThresholds: accountType === 'POSTPAID' ? [70, 90, 100] : undefined,
      buckets: [
        {
          id: `BKT-PROMO-${Date.now()}`,
          name: 'Welcome Sign-On 5G Data Promo',
          type: 'PROMOTIONAL_GRANT',
          category: 'PROMOTIONAL_GRANT',
          unit: 'BYTES',
          initialValue: 5368709120, // 5 GB
          currentValue: 5368709120,
          reservedValue: 0,
          priorityOrder: 1,
        },
        {
          id: `BKT-SLICE-${Date.now()}`,
          name: 'Dedicated 5G eMBB Slice Quota',
          type: 'SLICE_SPECIFIC',
          category: 'DATA_SLICE',
          unit: 'BYTES',
          initialValue: 10737418240, // 10 GB
          currentValue: 10737418240,
          reservedValue: 0,
          priorityOrder: 2,
          sliceId: '1-000001',
        },
        {
          id: `BKT-GEN-${Date.now()}`,
          name: 'Primary 5G/4G Data Pool',
          type: 'DATA_GENERAL',
          category: 'DATA_GENERAL',
          unit: 'BYTES',
          initialValue: 53687091200, // 50 GB
          currentValue: 53687091200,
          reservedValue: 0,
          priorityOrder: 3,
        },
        {
          id: `BKT-V-ON-${Date.now()}`,
          name: 'VoLTE On-Net Unlimited Voice',
          type: 'VOICE_ONNET',
          category: 'VOICE_ONNET',
          unit: 'SECONDS',
          initialValue: 180000, // 50 hours
          currentValue: 180000,
          reservedValue: 0,
          priorityOrder: 1,
        },
        {
          id: `BKT-V-OFF-${Date.now()}`,
          name: 'VoLTE Off-Net National Voice',
          type: 'VOICE_OFFNET',
          category: 'VOICE_OFFNET',
          unit: 'SECONDS',
          initialValue: 36000, // 10 hours
          currentValue: 36000,
          reservedValue: 0,
          priorityOrder: 1,
        },
        {
          id: `BKT-WALLET-${Date.now()}`,
          name: accountType === 'PREPAID' ? 'Main Prepaid Cash Wallet' : 'Credit Balance Ledger',
          type: 'MONETARY_WALLET',
          category: 'MONETARY_WALLET',
          unit: 'MONETARY',
          initialValue: accountType === 'PREPAID' ? initialCashWallet : creditLimit,
          currentValue: accountType === 'PREPAID' ? initialCashWallet : creditLimit,
          reservedValue: 0,
          priorityOrder: 5,
          currency: 'USD',
        }
      ],
      usageCounters: {
        dataBytesCycle: 0,
        voiceSecondsCycle: 0,
        smsCountCycle: 0,
        rolling24hBytes: 0,
        peakHourBytes: 0,
        offPeakBytes: 0,
      },
      policyCounters: {
        statusN28: 'NORMAL',
        active5QI: 9,
      }
    };

    onProvisionSuccess(newSubscriber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF7722] to-[#FF9933] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">3GPP Subscriber Provisioning Wizard</h3>
              <p className="text-xs text-slate-500 font-sans">
                Unified SIM/eSIM Registration, Prepaid/Postpaid Policy & Bundle Attachment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-4 gap-2 text-xs font-medium">
          {[
            { num: 1, title: 'Account Type' },
            { num: 2, title: 'Identities' },
            { num: 3, title: 'Device & Codec' },
            { num: 4, title: 'Tariff Bundle' },
          ].map(s => (
            <div
              key={s.num}
              className={`p-2.5 rounded-xl border transition ${
                step === s.num
                  ? 'border-[#FF7722] bg-orange-50/70 text-[#FF7722] font-bold shadow-sm'
                  : step > s.num
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider">Step 0{s.num}</div>
              <div className="truncate font-semibold">{s.title}</div>
            </div>
          ))}
        </div>

        {/* Step 1: Account Classification (Prepaid vs Postpaid) */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Select Subscriber Account Classification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setAccountType('PREPAID')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
                  accountType === 'PREPAID'
                    ? 'border-[#FF7722] bg-orange-50/40 shadow-md ring-2 ring-orange-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">Consumer Prepaid</span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    accountType === 'PREPAID' ? 'border-[#FF7722] bg-[#FF7722] text-white' : 'border-slate-300'
                  }`}>
                    {accountType === 'PREPAID' && <Check className="w-3 h-3" />}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Strict real-time credit check, unit reservation (SCUR) with mid-session cut-off upon balance exhaustion. Immediate recharge replenishment.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-[#FF7722] font-semibold">
                  Zero Overrun Risk • Instant Rating
                </div>
              </div>

              <div
                onClick={() => setAccountType('POSTPAID')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
                  accountType === 'POSTPAID'
                    ? 'border-[#E11D48] bg-rose-50/40 shadow-md ring-2 ring-rose-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">Corporate / Postpaid</span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    accountType === 'POSTPAID' ? 'border-[#E11D48] bg-[#E11D48] text-white' : 'border-slate-300'
                  }`}>
                    {accountType === 'POSTPAID' && <Check className="w-3 h-3" />}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Assigned credit limits, zero-balance pass-through with bill accumulation. Bill shock prevention thresholds (70%, 90%, 100%).
                </p>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-[#E11D48] font-semibold">
                  Credit Limit Policy • Bill Shock Prevention
                </div>
              </div>
            </div>

            {accountType === 'POSTPAID' && (
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Assign Subscriber Credit Limit Ceiling (USD):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-32 px-3 py-1.5 rounded-xl border border-rose-300 bg-white text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <span className="text-xs text-slate-500">Bill shock notification will alert at 70% and 90%.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Full 3GPP Identity Stack */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">3GPP Identity Stack Provisioning</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">MSISDN (E.164 Dialable Number):</label>
                <input
                  type="text"
                  value={msisdn}
                  onChange={(e) => setMsisdn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">IMSI (15-Digit SIM Identity):</label>
                <input
                  type="text"
                  value={imsi}
                  onChange={(e) => setImsi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">PEI (IMEISV Hardware Identifier):</label>
                <input
                  type="text"
                  value={pei}
                  onChange={(e) => setPei(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Automatic 5G SA SUPI Mapping:</label>
                <div className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-600 truncate">
                  imsi-{imsi}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-slate-700">
              <span className="font-bold text-[#FF7722]">3GPP Correlation:</span> The Unified Edge Gateway correlates incoming requests from 5G SMF (SUPI), 4G PGW (IMSI), and IMS TAS (MSISDN) to this single subscriber ledger.
            </div>
          </div>
        )}

        {/* Step 3: Hardware Capabilities & Codec */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Device Hardware & VoLTE/VoNR Codec Parameters</h4>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">User Equipment (UE) Device Model:</label>
                <input
                  type="text"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Carrier Audio Codec Profile:</label>
                <select
                  value={hardwareCodec}
                  onChange={(e) => setHardwareCodec(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="EVS-SWB 24.4kbps">EVS-SWB 24.4kbps (Enhanced Voice Services / Ultra HD)</option>
                  <option value="AMR-WB 12.65kbps">AMR-WB 12.65kbps (Adaptive Multi-Rate Wideband / HD Voice)</option>
                  <option value="AMR-NB 7.4kbps">AMR-NB 7.4kbps (Legacy Standard Voice)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sa5g"
                  checked={sa5gCapable}
                  onChange={(e) => setSa5gCapable(e.target.checked)}
                  className="w-4 h-4 text-[#FF7722] rounded focus:ring-orange-400"
                />
                <label htmlFor="sa5g" className="font-semibold text-slate-800">
                  Enable 5G Standalone (SA) Network Slicing Capabilities (eMBB + URLLC)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Bundle Attachment */}
        {step === 4 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Attach Commercial Multi-Bucket Bundle</h4>
            <div className="space-y-2.5">
              {tariffs.map(t => (
                <div
                  key={t.planId}
                  onClick={() => setSelectedPlanId(t.planId)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                    selectedPlanId === t.planId
                      ? 'border-[#FF7722] bg-orange-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                    <span className="font-mono font-bold text-slate-900">${t.monthlyRecurringFee}/mo</span>
                  </div>
                  <p className="text-xs text-slate-600">{t.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-orange-100 text-[#FF7722] font-semibold">
                      {t.ratingGroups.length} Rating Groups
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-[#E11D48] font-semibold">
                      Cascade: Promo → Slice → General
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {accountType === 'PREPAID' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Initial Cash Wallet Credit:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                  <span>$</span>
                  <input
                    type="number"
                    value={initialCashWallet}
                    onChange={(e) => setInitialCashWallet(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7722] to-[#FF9933] text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:opacity-95 transition"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#F43F5E] text-white text-xs font-bold shadow-md shadow-rose-500/25 hover:opacity-95 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Provision & Activate Subscriber</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
