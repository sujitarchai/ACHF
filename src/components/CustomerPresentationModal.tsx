import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Download, 
  Layers, 
  Radio, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  FileText,
  CheckCircle2,
  PhoneCall,
  Wifi,
  Sparkles
} from 'lucide-react';

interface CustomerPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPdf: () => void;
}

export const CustomerPresentationModal: React.FC<CustomerPresentationModalProps> = ({
  isOpen,
  onClose,
  onOpenPdf,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);

  if (!isOpen) return null;

  const slides = [
    {
      id: 1,
      badge: 'Executive Presentation',
      title: 'Cloud-Native 5G/4G ACHF (AI Converged Charging Function)',
      subtitle: 'AI-Driven Real-Time Quota Arbitration, Multi-Bucket Bundles & N28 Dynamic Policy Enforcement',
      keyPoints: [
        '3GPP Release 18 alignment (TS 32.290, TS 32.291, TS 32.299, TS 29.594).',
        'Unified Edge Ingress terminating 5G HTTP/2 REST (Nchf/N40) and legacy 4G Diameter Ro/Gy.',
        'Sub-10ms P99 quota arbitration powered by distributed in-memory Redis/CAS primitives.',
        'Dual-mode support for Prepaid strict real-time cut-off and Postpaid credit limits with bill shock prevention.'
      ],
      accent: 'from-[#FF7722] to-[#FF9933]',
      speakerNotes: 'Start by explaining that CSPs moving to 5G Standalone need ACHF (AI Converged Charging Function) to unify legacy 4G voice/data with cloud-native 5G microservices with AI-driven predictive elasticity and zero revenue leakage.'
    },
    {
      id: 2,
      badge: 'Architecture & Ingress',
      title: 'Dual-Stack Protocol Mediation & Strict Priority Arbitration',
      subtitle: 'Terminating 5G SMF, 4G PGW, and IMS TAS with zero voice jitter',
      keyPoints: [
        '5G SMF Ingress: Nchf_ConvergedCharging HTTP/2 JSON carrying S-NSSAI slices and 5QI profiles.',
        'IMS TAS Ingress: Diameter Ro (RFC 4006 DCCA) carrying carrier voice VoLTE/VoNR calls.',
        '4G PGW Ingress: Diameter Gy for 4G LTE packet data sessions.',
        'Strict Priority Arbiter: VoLTE/VoNR voice requests (Priority 0, Weight 80) preempt high-volume best-effort 5G eMBB data sessions to guarantee sub-2ms voice setup.'
      ],
      accent: 'from-[#E11D48] to-[#F43F5E]',
      speakerNotes: 'Highlight the WFQ / Strict Priority scheduler. Even if millions of mobile phones stream 4K video, voice calls never get dropped or delayed.'
    },
    {
      id: 3,
      badge: 'Identity Stack',
      title: 'Universal 3GPP Identity Resolution & Correlation',
      subtitle: 'Single customer ledger correlating multiple network identifiers',
      keyPoints: [
        'Identities Correlated: MSISDN (E.164), IMSI, 5G SA SUPI, GPSI, SIP URI, and PEI (IMEISV).',
        'Cross-Network Session Binding: Simultaneous 5G PDU session (SMF), 4G Bearer (PGW), and VoLTE call (TAS) bind to one subscriber account.',
        'Multi-Tenant & Fleet Support: Consumer accounts, multi-SIM shared pools, and corporate enterprise tiers.',
        'Device Hardware Metadata: Tracks VoLTE/VoNR codecs (EVS-SWB, AMR-WB) and 5G SA network slicing capabilities.'
      ],
      accent: 'from-[#FF7722] to-[#E11D48]',
      speakerNotes: 'Show that regardless of whether the session comes as an IMSI, MSISDN, or SUPI, the CHF correlates it in under 1ms to the master balance.'
    },
    {
      id: 4,
      badge: 'Commercial Studio',
      title: 'Hierarchical Multi-Bucket Tariff & Drawdown Cascade',
      subtitle: 'Dynamic priority ordering across diverse allowance sub-buckets',
      keyPoints: [
        'Voice Sub-Buckets: Dedicated On-Net unlimited, Off-Net interconnect, and International ISD minutes.',
        'Data Sub-Buckets: 5G Dedicated Slice (eMBB), General 4G/5G volume, and Off-Peak night quota (00:00 - 06:00).',
        'Main Currency Wallet: Stored-value funds for out-of-bundle pay-as-you-go charging.',
        'Drawdown Precedence: Free Promo Grant (P1) → Dedicated Slice (P2) → Off-Peak (P2) → General Allowance (P3) → Main Wallet (P4).'
      ],
      accent: 'from-[#FF9933] to-[#FF7722]',
      speakerNotes: 'Explain the business value for marketing teams: they can design complex promotional packages with zero code changes in the OCS.'
    },
    {
      id: 5,
      badge: 'Policy & Credit Control',
      title: 'Prepaid Strict Cut-Off vs. Postpaid Credit Limit Control',
      subtitle: 'Converged monetization for both consumer and corporate segments',
      keyPoints: [
        'Prepaid Engine: Real-time unit reservation (SCUR) with automatic mid-session cut-off and redirect to top-up portal upon balance depletion.',
        'Postpaid Engine: Zero-balance pass-through with cumulative unbilled ledger charging up to an assigned credit limit ceiling.',
        'Bill Shock Thresholds: Multi-tier triggers (70%, 90%, 100%) alerting subscribers and notifying operations.',
        'N28 PCF Enforcement: Pushes SpendingLimitNotification to PCF, triggering immediate down-throttling to 5QI 80 (128 kbps).'
      ],
      accent: 'from-[#E11D48] to-[#9333ea]',
      speakerNotes: 'Point out how Postpaid customers enjoy seamless connectivity without sudden cut-offs, while Prepaid customers are protected from balance debt.'
    },
    {
      id: 6,
      badge: 'SLA & Cloud-Native Topology',
      title: 'Sub-10ms P99 SLA & Kubernetes Architecture',
      subtitle: 'Distributed in-memory CAS fabric with asynchronous CDR settlement',
      keyPoints: [
        'In-Memory Data Fabric: Redis Cluster / DragonflyDB CAS Lua primitives eliminate database locks.',
        'Stateless Ingress Pods: Horizontally autoscale on Kubernetes/OpenShift based on P99 latency.',
        'Asynchronous Settlement: Kafka/Redpanda high-throughput event bus streams CDRs to offline billing and data lakes.',
        'Benchmarked SLA: Consistent P99 latency of 5.5ms - 6.2ms under 100,000+ transactions per second.'
      ],
      accent: 'from-emerald-500 to-teal-600',
      speakerNotes: 'Conclude with the carrier-grade reliability metrics: 99.999% availability, zero single point of failure, and sub-10ms response.'
    }
  ];

  const slide = slides[currentSlide - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-orange-100 text-[#FF7722]">
              Customer Pitch Deck (Slide {currentSlide} of {slides.length})
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
              ACHF (AI Converged Charging Function)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF7722] to-[#FF9933] text-white text-xs font-bold shadow-sm hover:opacity-95 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Runbook</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Canvas */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-white via-slate-50/50 to-orange-50/20">
          <div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider mb-3 bg-gradient-to-r from-[#FF7722] to-[#E11D48]">
              {slide.badge}
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              {slide.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium mb-8">
              {slide.subtitle}
            </p>

            {/* Key Bullet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slide.keyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-start gap-3.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#FF7722] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    0{idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Speaker Notes Callout */}
          <div className="mt-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] block mb-0.5">
                Presenter Talking Point:
              </span>
              <p className="leading-relaxed">{slide.speakerNotes}</p>
            </div>
          </div>
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {slides.map(s => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(s.id)}
                className={`w-7 h-2 rounded-full transition-all ${
                  currentSlide === s.id ? 'w-10 bg-[#FF7722]' : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentSlide === 1}
              onClick={() => setCurrentSlide(c => c - 1)}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Slide</span>
            </button>

            <button
              disabled={currentSlide === slides.length}
              onClick={() => setCurrentSlide(c => c + 1)}
              className="flex items-center gap-1 px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF7722] to-[#FF9933] text-white text-xs font-bold shadow-md hover:opacity-95 transition disabled:opacity-40"
            >
              <span>Next Slide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
