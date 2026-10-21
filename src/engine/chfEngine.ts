import {
  ActiveSession,
  BalanceBucket,
  CdrRecord,
  GatewayEventLog,
  RealtimeMetric,
  SubscriberAccount,
  CommercialTariffPlan,
  PriorityLevel,
  BucketType,
  AccountClassification
} from '../types/telecom';
import { INITIAL_SUBSCRIBERS, INITIAL_ACTIVE_SESSIONS, INITIAL_CDRS, INITIAL_TARIFFS } from '../data/mockTelecomData';

export interface ChfState {
  subscribers: SubscriberAccount[];
  activeSessions: ActiveSession[];
  cdrs: CdrRecord[];
  tariffs: CommercialTariffPlan[];
  eventLogs: GatewayEventLog[];
  metrics: RealtimeMetric;
  queueStatus: {
    voicePriorityQueue: number;
    sliceQueue: number;
    dataBestEffortQueue: number;
    wfqWeightVoice: number;
    wfqWeightData: number;
  };
  pcfStatus: {
    lastNotification: any | null;
    activeThrottles: number;
    totalBreachesHandled: number;
  };
}

export class ChfSimulatorEngine {
  private state: ChfState;
  private listeners: Array<(state: ChfState) => void> = [];

  constructor() {
    this.state = {
      subscribers: JSON.parse(JSON.stringify(INITIAL_SUBSCRIBERS)),
      activeSessions: JSON.parse(JSON.stringify(INITIAL_ACTIVE_SESSIONS)),
      cdrs: JSON.parse(JSON.stringify(INITIAL_CDRS)),
      tariffs: JSON.parse(JSON.stringify(INITIAL_TARIFFS)),
      eventLogs: [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          protocol: '4G_DIAMETER_RO',
          source: 'IMS_CSCF',
          messageName: 'Diameter CCR-U (VoLTE 180s)',
          priority: 'CRITICAL_VOICE',
          supi: 'imsi-404450123456789',
          rg: 200,
          latencyMs: 1.84,
          status: 'SUCCESS',
          summary: 'Resolved MSISDN +919820012345 ⇄ SUPI imsi-404450123456789. Granted 180s VoLTE reservation via Priority Queue 0.',
        },
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 5000).toISOString(),
          protocol: '5G_HTTP2_JSON',
          source: 'SMF',
          messageName: 'Nchf ChargingDataRequest [Update]',
          priority: 'BEST_EFFORT_DATA',
          supi: 'imsi-404450123456789',
          rg: 100,
          latencyMs: 3.42,
          status: 'SUCCESS',
          summary: 'SMF Nchf session: Granted 100MB SCUR interim quota via Promo Grant bucket.',
        },
      ],
      metrics: {
        tps: 8420,
        p50LatencyMs: 1.4,
        p95LatencyMs: 3.8,
        p99LatencyMs: 6.2,
        activeSessions5G: 1,
        activeSessions4G: 2,
        priorityQueueDepth: 0,
        bestEffortQueueDepth: 1,
        throttledSessionsCount: 0,
        n28BreachAlertsSent: 0,
        totalCdrCount: 2,
      },
      queueStatus: {
        voicePriorityQueue: 0,
        sliceQueue: 0,
        dataBestEffortQueue: 1,
        wfqWeightVoice: 80,
        wfqWeightData: 20,
      },
      pcfStatus: {
        lastNotification: null,
        activeThrottles: 0,
        totalBreachesHandled: 0,
      },
    };
  }

  public getState(): ChfState {
    return this.state;
  }

  public subscribe(listener: (state: ChfState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }

  /**
   * Universal 3GPP Identity Resolution:
   * Finds subscriber by SUPI, IMSI, MSISDN, or GPSI
   */
  public resolveSubscriber(id: string): SubscriberAccount | undefined {
    return this.state.subscribers.find(s => 
      s.supi === id || 
      s.imsi === id || 
      s.msisdn === id || 
      s.gpsi === id ||
      s.sipUri === id ||
      s.accountId === id
    );
  }

  /**
   * Multi-Bucket Priority Drawdown Cascade:
   * 1. PROMOTIONAL_GRANT -> 2. SLICE_SPECIFIC -> 3. DATA_OFFPEAK / SPECIFIC -> 4. DATA_GENERAL / VOICE -> 5. MONETARY_WALLET
   */
  private deductFromBuckets(
    subscriber: SubscriberAccount,
    unitsToReserve: number,
    unitType: 'BYTES' | 'SECONDS',
    sliceId?: string
  ): { granted: number; cascadeTrace: string[] } {
    let remainingToReserve = unitsToReserve;
    let totalGranted = 0;
    const cascadeTrace: string[] = [];

    // Sort buckets by priorityOrder
    const sortedBuckets = [...subscriber.buckets]
      .filter(b => b.unit === unitType)
      .sort((a, b) => a.priorityOrder - b.priorityOrder);

    for (const bucket of sortedBuckets) {
      if (remainingToReserve <= 0) break;

      // Check slice match if bucket is slice-specific
      if (bucket.type === 'SLICE_SPECIFIC' && sliceId && bucket.sliceId !== sliceId) {
        continue;
      }

      if (bucket.currentValue > 0) {
        const take = Math.min(bucket.currentValue, remainingToReserve);
        bucket.currentValue -= take;
        bucket.reservedValue += take;
        totalGranted += take;
        remainingToReserve -= take;
        cascadeTrace.push(`Drawn ${this.formatUnitValue(take, unitType)} from ${bucket.name} (${bucket.type})`);
      }
    }

    // If unitType is not satisfied and subscriber has Monetary Wallet:
    if (remainingToReserve > 0) {
      const moneyBucket = subscriber.buckets.find(b => b.unit === 'MONETARY');
      if (moneyBucket && moneyBucket.currentValue > 0.05) {
        // Convert to monetary deduction ($0.05 per 500MB or $0.01 per min)
        const cost = unitType === 'BYTES' ? 0.05 : 0.02;
        if (moneyBucket.currentValue >= cost) {
          moneyBucket.currentValue = Number((moneyBucket.currentValue - cost).toFixed(2));
          totalGranted += remainingToReserve;
          cascadeTrace.push(`Main Wallet Deduct $${cost} for remaining quota`);
          remainingToReserve = 0;
        }
      } else if (subscriber.accountType === 'POSTPAID') {
        // Postpaid zero-balance pass-through with bill accumulation
        const limit = subscriber.creditLimit || 150;
        const currentUnbilled = subscriber.currentUnbilledAmount || 0;
        const charge = unitType === 'BYTES' ? 0.05 : 0.02;
        if (currentUnbilled + charge <= limit) {
          subscriber.currentUnbilledAmount = Number((currentUnbilled + charge).toFixed(2));
          totalGranted += remainingToReserve;
          cascadeTrace.push(`Postpaid Pass-Through: Billed $${charge} to unbilled ledger ($${subscriber.currentUnbilledAmount}/$${limit})`);
          remainingToReserve = 0;
        }
      }
    }

    return { granted: totalGranted, cascadeTrace };
  }

  public formatUnitValue(val: number, unit: string): string {
    if (unit === 'BYTES') {
      if (val >= 1073741824) return `${(val / 1073741824).toFixed(2)} GB`;
      if (val >= 1048576) return `${(val / 1048576).toFixed(0)} MB`;
      return `${(val / 1024).toFixed(0)} KB`;
    }
    if (unit === 'SECONDS') {
      if (val >= 3600) return `${(val / 3600).toFixed(1)} hrs`;
      if (val >= 60) return `${Math.floor(val / 60)}m ${val % 60}s`;
      return `${val}s`;
    }
    if (unit === 'MONETARY') return `$${val.toFixed(2)}`;
    return `${val}`;
  }

  /**
   * Process a 5G HTTP/2 Nchf ChargingDataRequest (SMF)
   */
  public trigger5gDataQuotaRequest(identifier: string, requestedBytes = 104857600): void {
    const subscriber = this.resolveSubscriber(identifier);
    if (!subscriber) return;

    const queueLatency = Math.random() * 2.2 + 1.4;
    const startTime = performance.now();

    const existingSession = this.state.activeSessions.find(
      s => s.supi === subscriber.supi && s.sessionType === '5G_DATA_SCUR' && s.state === 'ACTIVE'
    );

    if (existingSession) {
      subscriber.usageCounters.dataBytesCycle += existingSession.grantedUnits;
      existingSession.consumedUnits += existingSession.grantedUnits;
    }

    const { granted, cascadeTrace } = this.deductFromBuckets(
      subscriber,
      requestedBytes,
      'BYTES',
      '1-000001'
    );

    const actualLatency = Number(((performance.now() - startTime) + queueLatency).toFixed(2));

    const totalDataLeft = subscriber.buckets
      .filter(b => b.unit === 'BYTES')
      .reduce((sum, b) => sum + b.currentValue, 0);

    const initialDataCapacity = subscriber.buckets
      .filter(b => b.unit === 'BYTES')
      .reduce((sum, b) => sum + b.initialValue, 0);

    const consumedPct = Math.round(((initialDataCapacity - totalDataLeft) / initialDataCapacity) * 100);

    let status: 'SUCCESS' | 'THROTTLED' | 'QUOTA_DENIED' = 'SUCCESS';

    // Prepaid strict cut-off vs Postpaid credit limit check
    if (subscriber.accountType === 'PREPAID' && (totalDataLeft <= 0 || granted === 0)) {
      status = 'QUOTA_DENIED';
      subscriber.policyCounters.statusN28 = 'BREACHED';
      subscriber.policyCounters.active5QI = 80; // Throttled to 128kbps
      subscriber.policyCounters.redirectUrl = `https://portal.telco.net/selfcare/topup?msisdn=${subscriber.msisdn}`;
      this.dispatchN28BreachToPcf(subscriber, 100);
      if (existingSession) {
        existingSession.state = 'POLICY_THROTTLED';
        existingSession.current5QI = 80;
      }
    } else if (subscriber.accountType === 'POSTPAID' && subscriber.currentUnbilledAmount && subscriber.creditLimit && subscriber.currentUnbilledAmount >= subscriber.creditLimit) {
      status = 'QUOTA_DENIED';
      subscriber.policyCounters.statusN28 = 'BREACHED';
      subscriber.policyCounters.active5QI = 80;
      this.dispatchN28BreachToPcf(subscriber, 100);
    } else if (consumedPct >= 80 && subscriber.policyCounters.statusN28 !== 'BREACHED') {
      subscriber.policyCounters.statusN28 = 'NEAR_THRESHOLD';
      this.dispatchN28BreachToPcf(subscriber, 80);
    }

    if (existingSession) {
      existingSession.grantedUnits = granted;
      existingSession.lastReservationTime = Date.now();
      existingSession.latencyMs = actualLatency;
      existingSession.history.unshift({
        timestamp: Date.now(),
        messageType: 'ChargingDataRequest [Update - Interim]',
        protocol: 'HTTP/2 REST (Nchf/N40 via SMF)',
        unitsRequested: requestedBytes,
        unitsGranted: granted,
        p99LatencyMs: actualLatency,
      });
    }

    this.state.eventLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      protocol: '5G_HTTP2_JSON',
      source: 'SMF',
      messageName: 'Nchf ChargingDataRequest [Update]',
      priority: 'BEST_EFFORT_DATA',
      supi: subscriber.supi,
      rg: 100,
      latencyMs: actualLatency,
      status,
      summary: `SMF Ingress: Resolved ${subscriber.msisdn} (${subscriber.accountType}). Requested ${this.formatUnitValue(requestedBytes, 'BYTES')} -> Granted ${this.formatUnitValue(granted, 'BYTES')}. Cascade: ${cascadeTrace.join(' -> ')}`,
    });

    this.updateRealtimeMetrics(actualLatency, '5G');
    this.notify();
  }

  /**
   * Process an IMS TAS / CSCF Diameter Ro CCR-I / CCR-U Request
   */
  public triggerVoLteVoiceReservation(identifier: string, requestedSeconds = 180): void {
    const subscriber = this.resolveSubscriber(identifier);
    if (!subscriber) return;

    const queueLatency = Math.random() * 0.8 + 0.7; // 0.7ms - 1.5ms
    const startTime = performance.now();

    let session = this.state.activeSessions.find(
      s => s.supi === subscriber.supi && s.sessionType === '4G_VOLTE_VOICE' && s.state === 'ACTIVE'
    );

    const isInitial = !session;

    if (!session) {
      session = {
        sessionId: `ims-volte-diam-${Math.floor(1000 + Math.random() * 9000)}`,
        protocol: '4G_DIAMETER_RO',
        sessionType: '4G_VOLTE_VOICE',
        priority: 'CRITICAL_VOICE',
        supi: subscriber.supi,
        msisdn: subscriber.msisdn,
        gpsi: subscriber.gpsi,
        diameterSessionId: `ims-cscf.mnc045.mcc404.3gppnetwork.org;${Date.now()}`,
        ratingGroup: 200,
        serviceId: 2001,
        state: 'ACTIVE',
        startTime: Date.now(),
        lastReservationTime: Date.now(),
        grantedUnits: 0,
        consumedUnits: 0,
        unitType: 'SECONDS',
        validityTimeSeconds: 600,
        current5QI: 1, // GBR VoLTE
        latencyMs: 1.4,
        cdrId: `CDR-RO-${Date.now()}`,
        history: [],
      };
      this.state.activeSessions.push(session);
      this.state.metrics.activeSessions4G += 1;
    } else {
      subscriber.usageCounters.voiceSecondsCycle += session.grantedUnits;
      session.consumedUnits += session.grantedUnits;
    }

    const { granted, cascadeTrace } = this.deductFromBuckets(
      subscriber,
      requestedSeconds,
      'SECONDS'
    );

    const actualLatency = Number(((performance.now() - startTime) + queueLatency).toFixed(2));

    session.grantedUnits = granted;
    session.lastReservationTime = Date.now();
    session.latencyMs = actualLatency;
    session.history.unshift({
      timestamp: Date.now(),
      messageType: isInitial ? 'Diameter CCR [INITIAL] (CC-Request-Type=1)' : 'Diameter CCR [UPDATE] (CC-Request-Type=2)',
      protocol: 'Diameter Ro (IMS TAS / CSCF)',
      unitsRequested: requestedSeconds,
      unitsGranted: granted,
      p99LatencyMs: actualLatency,
    });

    this.state.eventLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      protocol: '4G_DIAMETER_RO',
      source: 'IMS_CSCF',
      messageName: isInitial ? 'Diameter Ro CCR-I (VoLTE Voice)' : 'Diameter Ro CCR-U (VoLTE Voice)',
      priority: 'CRITICAL_VOICE',
      supi: subscriber.supi,
      rg: 200,
      latencyMs: actualLatency,
      status: granted > 0 ? 'SUCCESS' : 'QUOTA_DENIED',
      summary: `[PRIORITY QUEUE P0] IMS TAS Voice Reservation: Granted ${granted}s from Voice Buckets. Latency: ${actualLatency}ms (DCCA CCA 2001 SUCCESS).`,
    });

    this.updateRealtimeMetrics(actualLatency, '4G');
    this.notify();
  }

  /**
   * Process 4G PGW Diameter Gy Data Reservation
   */
  public trigger4gPgwDataReservation(identifier: string, requestedBytes = 52428800): void {
    const subscriber = this.resolveSubscriber(identifier);
    if (!subscriber) return;

    const queueLatency = Math.random() * 1.5 + 1.2;
    const startTime = performance.now();

    const { granted, cascadeTrace } = this.deductFromBuckets(
      subscriber,
      requestedBytes,
      'BYTES'
    );

    const actualLatency = Number(((performance.now() - startTime) + queueLatency).toFixed(2));

    this.state.eventLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      protocol: '4G_DIAMETER_GY',
      source: 'PGW',
      messageName: 'Diameter Gy CCR-U (4G EPC Data)',
      priority: 'BEST_EFFORT_DATA',
      supi: subscriber.supi,
      rg: 100,
      latencyMs: actualLatency,
      status: granted > 0 ? 'SUCCESS' : 'QUOTA_DENIED',
      summary: `PGW Gy Ingress: Granted ${this.formatUnitValue(granted, 'BYTES')} data. Cascade: ${cascadeTrace.join(' -> ')}`,
    });

    this.updateRealtimeMetrics(actualLatency, '4G');
    this.notify();
  }

  /**
   * Dual Session Concurrent Stress Test (VoLTE Voice + 5G Data)
   */
  public triggerConcurrentDualSession(identifier: string): void {
    this.triggerVoLteVoiceReservation(identifier, 180);
    this.trigger5gDataQuotaRequest(identifier, 104857600);
  }

  /**
   * Provision a brand-new Subscriber (Prepaid or Postpaid)
   */
  public provisionSubscriber(newSub: SubscriberAccount): void {
    this.state.subscribers.unshift(newSub);
    this.state.eventLogs.unshift({
      id: `log-prov-${Date.now()}`,
      timestamp: new Date().toISOString(),
      protocol: '5G_HTTP2_JSON',
      source: 'SMF',
      messageName: 'Subscriber Account Provisioned',
      priority: 'BEST_EFFORT_DATA',
      supi: newSub.supi,
      rg: 100,
      latencyMs: 1.1,
      status: 'SUCCESS',
      summary: `Provisioned ${newSub.accountType} subscriber ${newSub.msisdn} (SUPI: ${newSub.supi}). Attached bundle: ${newSub.planName} with ${newSub.buckets.length} buckets.`,
    });
    this.notify();
  }

  /**
   * Terminate active session and settle CDR into Kafka Ledger
   */
  public terminateSession(sessionId: string): void {
    const sessionIndex = this.state.activeSessions.findIndex(s => s.sessionId === sessionId);
    if (sessionIndex === -1) return;

    const session = this.state.activeSessions[sessionIndex];
    session.state = 'TERMINATED';

    const subscriber = this.resolveSubscriber(session.supi);
    if (subscriber) {
      const bucket = subscriber.buckets.find(b => b.unit === session.unitType && b.reservedValue > 0);
      if (bucket) {
        bucket.currentValue += bucket.reservedValue;
        bucket.reservedValue = 0;
      }
    }

    const cdr: CdrRecord = {
      cdrId: session.cdrId,
      sessionId: session.sessionId,
      supi: session.supi,
      msisdn: session.msisdn,
      gpsi: session.gpsi,
      protocol: session.protocol,
      ratingGroup: session.ratingGroup,
      chargingMethod: 'SCUR',
      totalUnitsConsumed: session.consumedUnits + session.grantedUnits,
      unitType: session.unitType,
      totalChargeMonetary: session.ratingGroup === 100 ? 0.08 : 0.06,
      currency: 'USD',
      sNssai: session.sNssai,
      causeForTermination: 'USER_INITIATED_RELEASE (Normal Call/Session Release)',
      timestamp: new Date().toISOString(),
    };

    this.state.cdrs.unshift(cdr);
    this.state.activeSessions.splice(sessionIndex, 1);

    if (session.protocol === '5G_HTTP2_JSON') {
      this.state.metrics.activeSessions5G = Math.max(0, this.state.metrics.activeSessions5G - 1);
    } else {
      this.state.metrics.activeSessions4G = Math.max(0, this.state.metrics.activeSessions4G - 1);
    }
    this.state.metrics.totalCdrCount += 1;

    this.state.eventLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      protocol: session.protocol,
      source: session.protocol === '5G_HTTP2_JSON' ? 'SMF' : 'IMS_CSCF',
      messageName: session.protocol === '5G_HTTP2_JSON' ? 'ChargingDataRequest [Release]' : 'Diameter CCR-T',
      priority: session.priority,
      supi: session.supi,
      rg: session.ratingGroup,
      latencyMs: 1.15,
      status: 'SUCCESS',
      summary: `Session ${session.sessionId} terminated. Emitted CDR ${cdr.cdrId} to Kafka ledger pipeline.`,
    });

    this.notify();
  }

  /**
   * Dispatch N28 Spending Limit Breach Alert to PCF
   */
  private dispatchN28BreachToPcf(subscriber: SubscriberAccount, percentage: number): void {
    const payload = {
      notificationType: percentage === 100 ? 'DATA_QUOTA_BREACH_100' : 'DATA_QUOTA_WARNING_80',
      timestamp: new Date().toISOString(),
      supi: subscriber.supi,
      msisdn: subscriber.msisdn,
      accountType: subscriber.accountType,
      policyCounterStatus: {
        counterId: 'DATA_MONTHLY_QUOTA',
        currentStatusValue: percentage === 100 ? 'BREACHED_100' : 'WARNING_80',
        remainingBytes: subscriber.buckets.filter(b => b.unit === 'BYTES').reduce((s, b) => s + b.currentValue, 0),
      },
      recommendedPccRule: {
        target5QI: percentage === 100 ? 80 : 9,
        action: percentage === 100 ? 'DOWNTHROTTLE_128KBPS' : 'MONITOR',
        captivePortalRedirect: percentage === 100,
      },
    };

    this.state.pcfStatus.lastNotification = payload;
    this.state.pcfStatus.totalBreachesHandled += 1;
    if (percentage === 100) {
      this.state.pcfStatus.activeThrottles += 1;
    }
    this.state.metrics.n28BreachAlertsSent += 1;

    this.state.eventLogs.unshift({
      id: `log-n28-${Date.now()}`,
      timestamp: new Date().toISOString(),
      protocol: 'N28_HTTP2_JSON',
      source: 'PCF',
      messageName: `N28 SpendingLimitNotification (${percentage}%)`,
      priority: 'CRITICAL_VOICE',
      supi: subscriber.supi,
      rg: 100,
      latencyMs: 2.1,
      status: percentage === 100 ? 'THROTTLED' : 'SUCCESS',
      summary: `[N28 Interface TS 29.594] Pushed ${percentage}% threshold breach to PCF for ${subscriber.msisdn}. PCC Rule enforced: 5QI 9 -> 5QI ${subscriber.policyCounters.active5QI}.`,
    });
  }

  /**
   * Top up subscriber balance and restore 5QI QoS
   */
  public topUpSubscriber(identifier: string, gigabytesToAdd = 10, dollarsToAdd = 25): void {
    const subscriber = this.resolveSubscriber(identifier);
    if (!subscriber) return;

    const dataBucket = subscriber.buckets.find(b => (b.type === 'DATA_GENERAL' || b.type === 'PRIMARY_ACCOUNT') && b.unit === 'BYTES');
    if (dataBucket) {
      dataBucket.currentValue += gigabytesToAdd * 1073741824;
    }

    const moneyBucket = subscriber.buckets.find(b => (b.type === 'MONETARY_WALLET' || b.type === 'PRIMARY_ACCOUNT') && b.unit === 'MONETARY');
    if (moneyBucket) {
      moneyBucket.currentValue += dollarsToAdd;
    }

    if (subscriber.accountType === 'POSTPAID') {
      subscriber.currentUnbilledAmount = 0;
    }

    subscriber.policyCounters.statusN28 = 'NORMAL';
    subscriber.policyCounters.active5QI = 9;
    subscriber.policyCounters.redirectUrl = undefined;
    subscriber.status = 'ACTIVE';

    this.state.activeSessions
      .filter(s => s.supi === subscriber.supi && s.state === 'POLICY_THROTTLED')
      .forEach(s => {
        s.state = 'ACTIVE';
        s.current5QI = 9;
      });

    this.state.eventLogs.unshift({
      id: `log-topup-${Date.now()}`,
      timestamp: new Date().toISOString(),
      protocol: '5G_HTTP2_JSON',
      source: 'SMF',
      messageName: 'Subscriber Top-Up & Policy Restoration',
      priority: 'BEST_EFFORT_DATA',
      supi: subscriber.supi,
      rg: 100,
      latencyMs: 1.2,
      status: 'SUCCESS',
      summary: `Top-up credited (+${gigabytesToAdd}GB, +$${dollarsToAdd}) for ${subscriber.msisdn}. N28 PCF notified: QoS restored to 5QI 9.`,
    });

    this.notify();
  }

  public runLatencyBenchmark(transactionCount = 1000): {
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
    latencies: number[];
  } {
    const latencies: number[] = [];
    for (let i = 0; i < transactionCount; i++) {
      const rand = Math.random();
      let l: number;
      if (rand < 0.80) {
        l = 0.8 + Math.random() * 1.7;
      } else if (rand < 0.95) {
        l = 2.5 + Math.random() * 2.5;
      } else {
        l = 5.0 + Math.random() * 3.8;
      }
      latencies.push(Number(l.toFixed(2)));
    }

    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(transactionCount * 0.50)];
    const p95 = latencies[Math.floor(transactionCount * 0.95)];
    const p99 = latencies[Math.floor(transactionCount * 0.99)];
    const min = latencies[0];
    const max = latencies[latencies.length - 1];

    this.state.metrics.p50LatencyMs = p50;
    this.state.metrics.p95LatencyMs = p95;
    this.state.metrics.p99LatencyMs = p99;
    this.notify();

    return { p50, p95, p99, min, max, latencies };
  }

  private updateRealtimeMetrics(latencyMs: number, callType: '5G' | '4G') {
    this.state.metrics.tps = Math.floor(7800 + Math.random() * 1800);
    this.state.metrics.p99LatencyMs = Number((5.5 + Math.random() * 1.8).toFixed(1));
    this.state.metrics.p50LatencyMs = Number((1.2 + Math.random() * 0.5).toFixed(1));
    this.state.metrics.p95LatencyMs = Number((3.4 + Math.random() * 0.8).toFixed(1));
  }
}

export const chfEngineInstance = new ChfSimulatorEngine();
