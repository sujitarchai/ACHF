import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Radio, 
  ShieldCheck, 
  Sparkles,
  BookOpen,
  Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfRunbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PdfRunbookModal: React.FC<PdfRunbookModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePdf = async () => {
    if (!printAreaRef.current) return;
    setIsGenerating(true);
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const element = printAreaRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = 595.28; // A4 width in pt
      const pageHeight = 841.89; // A4 height in pt
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save('Cloud_Native_ACHF_AI_Converged_Charging_Function_Manual.pdf');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback to browser print if canvas fails
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full my-auto flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Action Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF7722] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Official PDF Technical Runbook & Manual</h3>
              <p className="text-xs text-slate-500 font-sans">
                3GPP Rel 18 ACHF (AI Converged Charging Function) Specification Document
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
              title="Print via Browser Print Dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Browser Print</span>
            </button>

            <button
              disabled={isGenerating}
              onClick={handleGeneratePdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF7722] to-[#FF9933] text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:opacity-95 transition disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Downloaded PDF!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGenerating ? 'Rendering PDF...' : 'Download Official PDF'}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Runbook Content Container */}
        <div className="p-6 sm:p-12 overflow-y-auto max-h-[80vh] bg-white text-slate-900">
          <div ref={printAreaRef} className="space-y-8 max-w-3xl mx-auto font-sans p-4 bg-white">
            
            {/* Document Header & Title Banner */}
            <div className="border-b-2 border-[#FF7722] pb-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-[#FF7722] font-bold tracking-wider">
                <span>3GPP Technical Specification Runbook</span>
                <span>Document Ref: ACHF-3GPP-REL18-MANUAL</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Cloud-Native 5G/4G ACHF (AI Converged Charging Function): Subscriber Provisioning, Bundle Architecture, and Rating Workflow Manual
              </h1>
              <p className="text-sm text-slate-600 font-medium">
                Standards: 3GPP TS 32.290, TS 32.291 (Nchf), TS 32.299 (Diameter Ro/Gy), and TS 29.594 (N28)
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-orange-100 text-[#FF7722] font-bold">
                  Sovereign White, Saffron & Pink Edition
                </span>
                <span className="px-2.5 py-1 rounded-md bg-rose-100 text-[#E11D48] font-bold">
                  Carrier-Grade P99 &lt; 10ms SLA
                </span>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-l-4 border-[#FF7722] pl-3">
                1. Executive Summary & Core Architecture
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">
                The ACHF (AI Converged Charging Function) delivers an intelligent, unified monetization core for Communication Service Providers (CSPs). It simultaneously processes 5G Service Based Architecture (SBA) sessions from the SMF via HTTP/2 REST (<code className="text-orange-600 font-mono">Nchf_ConvergedCharging</code>), legacy 4G LTE packet data from the PGW via Diameter Gy, and carrier-grade IMS VoLTE/VoNR calls from the TAS/CSCF via Diameter Ro.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                  <div className="font-bold text-[#FF7722] mb-1">Dual-Stack Ingress</div>
                  <p className="text-slate-600">5G HTTP/2 REST + 4G SCTP Diameter Ro/Gy with sub-2ms normalization.</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="font-bold text-[#E11D48] mb-1">Strict Priority Preemption</div>
                  <p className="text-slate-600">Voice requests bypass data queues to eliminate call setup jitter under high load.</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="font-bold text-emerald-700 mb-1">In-Memory CAS Fabric</div>
                  <p className="text-slate-600">Atomic Lua CAS primitives deliver sub-10ms P99 quota arbitration without DB locks.</p>
                </div>
              </div>
            </section>

            {/* Section 2: Unified Subscriber Provisioning Engine */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-l-4 border-[#E11D48] pl-3">
                2. Unified Subscriber Provisioning Engine (Prepaid vs. Postpaid)
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">
                Subscribers are registered with a unified 3GPP identifier stack that correlates all incoming network events to a single balance ledger:
              </p>
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-2.5">Identifier</th>
                    <th className="p-2.5">3GPP Standard</th>
                    <th className="p-2.5">Example Value</th>
                    <th className="p-2.5">Core Function Binding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">MSISDN</td>
                    <td className="p-2.5 text-slate-600">ITU-T E.164</td>
                    <td className="p-2.5 font-mono text-orange-600">+91 98200 12345</td>
                    <td className="p-2.5 text-slate-600">IMS TAS VoLTE Calling ID</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">IMSI</td>
                    <td className="p-2.5 text-slate-600">3GPP TS 23.003</td>
                    <td className="p-2.5 font-mono text-orange-600">404450123456789</td>
                    <td className="p-2.5 text-slate-600">4G PGW Gy Subscription-Id</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">SUPI</td>
                    <td className="p-2.5 text-slate-600">3GPP TS 23.501</td>
                    <td className="p-2.5 font-mono text-orange-600">imsi-404450123456789</td>
                    <td className="p-2.5 text-slate-600">5G SMF Nchf Subscriber ID</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">PEI</td>
                    <td className="p-2.5 text-slate-600">IMEISV</td>
                    <td className="p-2.5 font-mono text-orange-600">8629100412345670</td>
                    <td className="p-2.5 text-slate-600">Device Hardware Verification</td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/50">
                  <div className="font-bold text-[#FF7722] mb-1">Prepaid Account Mechanics</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li>Strict real-time credit check prior to unit granting.</li>
                    <li>Unit Reservation (SCUR) with holding timers.</li>
                    <li>Mid-session termination & redirect upon zero balance.</li>
                  </ul>
                </div>
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
                  <div className="font-bold text-[#E11D48] mb-1">Postpaid Account Mechanics</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li>Assigned credit limit (e.g. $150.00 ceiling).</li>
                    <li>Zero-balance pass-through with cumulative unbilled debit.</li>
                    <li>Bill shock alerts at 70%, 90%, and 100% credit limit.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Multi-Bucket Tariff & Drawdown Cascade */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-l-4 border-amber-500 pl-3">
                3. Multi-Bucket Tariff & Drawdown Priority Cascade
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">
                When a session requests quota, the rating engine evaluates the subscriber's balances according to the commercial plan's precedence rules:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2">
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-[#FF7722] text-white flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>Promotional / Sign-On Grant Bucket (Draws First, Earliest Expiry)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>5G Dedicated Slice Bucket (eMBB S-NSSAI 1-000001) / Time-bound Off-Peak</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[10px]">3</span>
                  <span>Primary General Voice / Data Pool (National Coverage)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">4</span>
                  <span>Main Monetary Currency Wallet (Prepaid Cash / Postpaid Credit Facility)</span>
                </div>
              </div>
            </section>

            {/* Section 4: Rating Group Configurations */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-l-4 border-[#FF7722] pl-3">
                4. Rating Group (RG) Configuration Matrix
              </h2>
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-2.5">RG Code</th>
                    <th className="p-2.5">Service Description</th>
                    <th className="p-2.5">Unit Basis</th>
                    <th className="p-2.5">Default Grant</th>
                    <th className="p-2.5">Validity Sec</th>
                    <th className="p-2.5">Re-auth Triggers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-bold font-mono text-orange-600">RG 100</td>
                    <td className="p-2.5 text-slate-800">5G eMBB Sliced Data</td>
                    <td className="p-2.5 text-slate-600">BYTES</td>
                    <td className="p-2.5 font-mono">100 MB</td>
                    <td className="p-2.5 font-mono">300s</td>
                    <td className="p-2.5 text-[11px] text-slate-600">QUOTA_EXHAUSTED, VALIDITY_TIME</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold font-mono text-orange-600">RG 200</td>
                    <td className="p-2.5 text-slate-800">VoLTE On-Net Voice</td>
                    <td className="p-2.5 text-slate-600">SECONDS</td>
                    <td className="p-2.5 font-mono">180s</td>
                    <td className="p-2.5 font-mono">600s</td>
                    <td className="p-2.5 text-[11px] text-slate-600">QUOTA_EXHAUSTED, FINAL</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold font-mono text-orange-600">RG 201</td>
                    <td className="p-2.5 text-slate-800">VoLTE Off-Net Voice</td>
                    <td className="p-2.5 text-slate-600">SECONDS</td>
                    <td className="p-2.5 font-mono">180s</td>
                    <td className="p-2.5 font-mono">600s</td>
                    <td className="p-2.5 text-[11px] text-slate-600">QUOTA_EXHAUSTED, FINAL</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Document Footer Sign-off */}
            <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between font-mono">
              <span>Verified 3GPP Rel 18 Implementation</span>
              <span>© Communication Service Provider OCS Manual</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
