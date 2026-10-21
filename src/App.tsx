/**
 * 3GPP Converged Charging Function (CHF / OCS) Carrier Console
 * Real-Time Quota Arbitration, N28 Spending Limit Policy Engine,
 * Dual-Stack Protocol Mediation, Tariff Studio & PDF Runbook Manual
 * Design System: Crisp White, Regal Saffron (#FF7722) & Sophisticated Pink (#E11D48)
 */

import React, { useEffect, useState } from 'react';
import { Navbar, TabId } from './components/Navbar';
import { LiveSessionInspector } from './components/LiveSessionInspector';
import { TariffStudio } from './components/TariffStudio';
import { SubscriberManager } from './components/SubscriberManager';
import { DynamicPolicyN28 } from './components/DynamicPolicyN28';
import { ProtocolDissector } from './components/ProtocolDissector';
import { ArchitecturalDiagrams } from './components/ArchitecturalDiagrams';
import { TechnicalSpecs } from './components/TechnicalSpecs';
import { LatencyBenchmarkModal } from './components/LatencyBenchmarkModal';
import { ProvisioningWizardModal } from './components/ProvisioningWizardModal';
import { CustomerPresentationModal } from './components/CustomerPresentationModal';
import { PdfRunbookModal } from './components/PdfRunbookModal';
import { chfEngineInstance, ChfState } from './engine/chfEngine';
import { SubscriberAccount } from './types/telecom';

export default function App() {
  const [state, setState] = useState<ChfState>(chfEngineInstance.getState());
  const [currentTab, setCurrentTab] = useState<TabId>('subscribers');
  
  // Modals state
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(false);

  // Notification Toast
  const [notificationToast, setNotificationToast] = useState<{
    id: number;
    title: string;
    msg: string;
    type: 'info' | 'warning' | 'breach' | 'success';
  } | null>(null);

  useEffect(() => {
    const unsubscribe = chfEngineInstance.subscribe((newState) => {
      setState({ ...newState });

      // Trigger toast on new N28 breach event or top-up
      const latestLog = newState.eventLogs[0];
      if (latestLog && latestLog.protocol === 'N28_HTTP2_JSON') {
        setNotificationToast({
          id: Date.now(),
          title: latestLog.messageName,
          msg: latestLog.summary,
          type: latestLog.status === 'THROTTLED' ? 'breach' : 'warning',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTrigger5gData = (identifier: string, bytes?: number) => {
    chfEngineInstance.trigger5gDataQuotaRequest(identifier, bytes);
  };

  const handleTriggerVoLte = (identifier: string, seconds?: number) => {
    chfEngineInstance.triggerVoLteVoiceReservation(identifier, seconds);
  };

  const handleTriggerConcurrent = (identifier: string) => {
    chfEngineInstance.triggerConcurrentDualSession(identifier);
  };

  const handleTerminateSession = (sessionId: string) => {
    chfEngineInstance.terminateSession(sessionId);
  };

  const handleTopUp = (identifier: string, gb = 15, dollars = 30) => {
    chfEngineInstance.topUpSubscriber(identifier, gb, dollars);
    setNotificationToast({
      id: Date.now(),
      title: 'Balance Top-Up Successful',
      msg: `Recharged +${gb}GB Data and +$${dollars} monetary balance. QoS restored to 5QI 9.`,
      type: 'success',
    });
  };

  const handleProvisionSuccess = (newSubscriber: SubscriberAccount) => {
    chfEngineInstance.provisionSubscriber(newSubscriber);
    setNotificationToast({
      id: Date.now(),
      title: 'Subscriber Account Activated',
      msg: `Successfully provisioned ${newSubscriber.accountType} subscriber ${newSubscriber.msisdn} with commercial bundle ${newSubscriber.planName}.`,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-900">
      {/* Carrier Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        metrics={state.metrics}
        onRunBenchmark={() => setIsBenchmarkOpen(true)}
        onConcurrentBurst={() => {
          const firstIdentifier = state.subscribers[0]?.msisdn || '';
          if (firstIdentifier) handleTriggerConcurrent(firstIdentifier);
        }}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onOpenPdf={() => setIsPdfOpen(true)}
      />

      {/* Real-Time Push Notification Toast */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-2xl border shadow-xl flex items-start justify-between gap-3 ${
              notificationToast.type === 'breach'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : notificationToast.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-orange-50 border-orange-300 text-orange-950'
            }`}
          >
            <div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase mb-1">
                {notificationToast.title}
              </div>
              <p className="text-xs leading-relaxed opacity-90">{notificationToast.msg}</p>
            </div>
            <button
              onClick={() => setNotificationToast(null)}
              className="text-xs font-mono opacity-70 hover:opacity-100 p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'subscribers' && (
          <SubscriberManager
            subscribers={state.subscribers}
            onTopUp={handleTopUp}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        )}

        {currentTab === 'sessions' && (
          <LiveSessionInspector
            state={state}
            onTrigger5gData={handleTrigger5gData}
            onTriggerVoLte={handleTriggerVoLte}
            onTriggerConcurrent={handleTriggerConcurrent}
            onTerminateSession={handleTerminateSession}
            onTopUp={handleTopUp}
          />
        )}

        {currentTab === 'tariff' && (
          <TariffStudio tariffs={state.tariffs} />
        )}

        {currentTab === 'policy-n28' && (
          <DynamicPolicyN28
            state={state}
            onTrigger5gData={handleTrigger5gData}
            onTopUp={handleTopUp}
          />
        )}

        {currentTab === 'protocol' && (
          <ProtocolDissector />
        )}

        {currentTab === 'diagrams' && (
          <ArchitecturalDiagrams />
        )}

        {currentTab === 'specs' && (
          <TechnicalSpecs />
        )}
      </main>

      {/* Benchmark Modal */}
      <LatencyBenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        engine={chfEngineInstance}
      />

      {/* Provisioning Wizard Modal */}
      <ProvisioningWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        tariffs={state.tariffs}
        onProvisionSuccess={handleProvisionSuccess}
      />

      {/* Customer Pitch Deck Presentation Modal (PPT Mode) */}
      <CustomerPresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        onOpenPdf={() => {
          setIsPresentationOpen(false);
          setIsPdfOpen(true);
        }}
      />

      {/* PDF Runbook & Manual Modal */}
      <PdfRunbookModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
      />

      {/* Engineering Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800">ACHF (AI Converged Charging Function)</span>
          <span>•</span>
          <span className="font-semibold text-slate-700">3GPP Rel 18</span>
          <span>•</span>
          <span>TS 32.290 / TS 32.291 (Nchf / N40)</span>
          <span>•</span>
          <span>TS 32.299 (Diameter Ro & Gy)</span>
          <span>•</span>
          <span>TS 29.594 (N28 PCF)</span>
        </div>
        <div className="font-mono text-slate-600">
          AI Rating SLA: P99 &lt; 10ms <span className="text-[#FF7722] font-bold">({state.metrics.p99LatencyMs}ms)</span>
        </div>
      </footer>
    </div>
  );
}
